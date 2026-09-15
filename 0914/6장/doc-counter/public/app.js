/* ═══════════════════════════════════════════
   📄 문서 분석기 — PDF·DOCX 브라우저 내 분석
   PDF: pdf.js / DOCX: JSZip (파일은 기기 밖으로 나가지 않음)
   ═══════════════════════════════════════════ */
'use strict';

// pdf.js 워커 설정
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const $ = (id) => document.getElementById(id);
const dropZone = $('dropZone');
const fileInput = $('fileInput');

/* ───────── 텍스트 통계 계산 ───────── */
function computeStats(text) {
  const chars = [...text.replace(/\r/g, '')]; // 서로게이트 쌍 안전 처리
  const noNewline = text.replace(/\r?\n/g, '');
  return {
    chars: [...noNewline].length,                                  // 글자 수 (공백 포함, 줄바꿈 제외)
    charsNoSpace: [...noNewline.replace(/\s/g, '')].length,        // 공백 제외
    spaces: (text.match(/[ \t\u00A0\u3000]/g) || []).length,       // 공백 개수 (스페이스·탭·전각공백)
    words: (text.trim().match(/\S+/g) || []).length,               // 단어 수
    hangul: (text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) || []).length,       // 한글 글자
    lines: text.trim() ? text.trim().split(/\r?\n/).length : 0     // 줄 수
  };
}

/* ───────── PDF 분석 ───────── */
async function analyzePdf(arrayBuffer, onProgress) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  let imageCount = 0;
  const seenImages = new Set(); // 같은 이미지 객체 중복 방지 (페이지 내 재사용)

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);

    // 텍스트 추출
    const tc = await page.getTextContent();
    let pageText = '';
    for (const item of tc.items) {
      pageText += item.str;
      if (item.hasEOL) pageText += '\n';
    }
    fullText += pageText + '\n';

    // 이미지 카운트: 연산자 목록에서 이미지 그리기 연산 탐지
    try {
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        if (fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintImageXObjectRepeat ||
            fn === pdfjsLib.OPS.paintJpegXObject) {
          const objId = ops.argsArray[i] && ops.argsArray[i][0];
          const key = p + ':' + objId; // 페이지별로 구분 (다른 페이지 반복 사용은 각각 카운트)
          if (!seenImages.has(key)) { seenImages.add(key); imageCount++; }
        } else if (fn === pdfjsLib.OPS.paintInlineImageXObject) {
          imageCount++;
        }
      }
    } catch (e) {
      console.warn(`페이지 ${p} 이미지 분석 건너뜀:`, e.message);
    }

    onProgress(Math.round((p / pdf.numPages) * 100), `${p}/${pdf.numPages} 페이지 분석 중...`);
  }

  return { text: fullText, images: imageCount, pages: pdf.numPages };
}

/* ───────── DOCX 분석 ───────── */
async function analyzeDocx(arrayBuffer, onProgress) {
  onProgress(20, '압축 해제 중...');
  const zip = await JSZip.loadAsync(arrayBuffer);

  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('올바른 DOCX 파일이 아닙니다 (document.xml 없음)');

  onProgress(50, '본문 추출 중...');
  const xml = await docFile.async('string');

  // XML 파싱으로 정확한 텍스트 추출
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  let text = '';
  const walk = (node) => {
    for (const child of node.childNodes) {
      const name = child.nodeName;
      if (name === 'w:t') text += child.textContent;
      else if (name === 'w:tab') text += '\t';
      else if (name === 'w:br' || name === 'w:cr') text += '\n';
      else if (name === 'w:p') { walk(child); text += '\n'; continue; }
      if (child.childNodes && name !== 'w:p') walk(child);
    }
  };
  walk(dom.documentElement);

  onProgress(80, '이미지 세는 중...');
  // 이미지: 본문의 그리기 요소(w:drawing) + 레거시 그림(w:pict) 개수
  const drawings = (xml.match(/<w:drawing[\s>]/g) || []).length;
  const picts = (xml.match(/<w:pict[\s>]/g) || []).length;
  let images = drawings + picts;

  // 폴백: 본문 태그가 없는데 media 폴더에 이미지가 있으면 그 수로 대체
  if (images === 0) {
    let mediaCount = 0;
    zip.forEach((path) => {
      if (/^word\/media\/.+\.(png|jpe?g|gif|bmp|tiff?|emf|wmf|svg)$/i.test(path)) mediaCount++;
    });
    images = mediaCount;
  }

  onProgress(100, '완료!');
  return { text, images, pages: null };
}

/* ───────── UI 흐름 ───────── */
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

function setProgress(pct, msg) {
  $('progressFill').style.width = pct + '%';
  $('progressText').textContent = msg;
}

function showError(msg) {
  hide('progressBox');
  $('errorText').textContent = '⚠️ ' + msg;
  show('errorBox');
  show('dropZone');
}

function animateNumber(el, target) {
  const dur = 600, start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString('ko-KR');
    if (t < 1) requestAnimationFrame(tick);
    else { el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 350); }
  };
  requestAnimationFrame(tick);
}

async function handleFile(file) {
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'pdf' && ext !== 'docx') {
    showError('지원하지 않는 형식입니다. .pdf 또는 .docx 파일을 올려주세요.');
    return;
  }
  if (ext === 'pdf' && !window.pdfjsLib) {
    showError('PDF 라이브러리 로드 실패 — 인터넷 연결을 확인하고 새로고침해 주세요.');
    return;
  }
  if (ext === 'docx' && !window.JSZip) {
    showError('DOCX 라이브러리 로드 실패 — 인터넷 연결을 확인하고 새로고침해 주세요.');
    return;
  }

  hide('dropZone'); hide('errorBox'); hide('resultBox');
  show('progressBox');
  setProgress(5, '파일 읽는 중...');

  try {
    const buf = await file.arrayBuffer();
    const result = ext === 'pdf'
      ? await analyzePdf(buf, setProgress)
      : await analyzeDocx(buf, setProgress);

    const stats = computeStats(result.text);

    // 결과 렌더링
    $('fileIcon').textContent = ext === 'pdf' ? '📕' : '📘';
    $('fileName').textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);
    $('fileDetail').textContent =
      `${ext.toUpperCase()} · ${sizeKB} KB` + (result.pages ? ` · ${result.pages}페이지` : '');

    hide('progressBox');
    show('resultBox');

    animateNumber($('statChars'), stats.chars);
    animateNumber($('statWords'), stats.words);
    animateNumber($('statSpaces'), stats.spaces);
    animateNumber($('statImages'), result.images);
    $('statCharsNoSpace').textContent = stats.charsNoSpace.toLocaleString('ko-KR');
    $('statHangul').textContent = stats.hangul.toLocaleString('ko-KR');
    $('statLines').textContent = stats.lines.toLocaleString('ko-KR');
    $('statPages').textContent = result.pages ? result.pages.toLocaleString('ko-KR') : '—';

    // 미리보기 (앞 1,000자)
    const preview = result.text.trim().slice(0, 1000);
    $('previewText').textContent = preview
      ? preview + (result.text.trim().length > 1000 ? '\n\n… (이하 생략)' : '')
      : '(추출된 텍스트가 없습니다 — 스캔 이미지 PDF일 수 있습니다)';

    if (navigator.vibrate) navigator.vibrate(30);
  } catch (err) {
    console.error(err);
    showError('분석 실패: ' + (err.message || '파일이 손상되었거나 암호화되어 있을 수 있습니다.'));
  }
}

/* ───────── 이벤트 바인딩 ───────── */
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  handleFile(fileInput.files[0]);
  fileInput.value = ''; // 같은 파일 재선택 허용
});

['dragover', 'dragenter'].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  })
);
dropZone.addEventListener('drop', (e) => {
  handleFile(e.dataTransfer.files[0]);
});

$('resetBtn').addEventListener('click', () => {
  hide('resultBox'); hide('errorBox');
  show('dropZone');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
