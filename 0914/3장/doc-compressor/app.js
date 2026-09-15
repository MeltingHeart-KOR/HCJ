/* ============================================
   Smart Doc Compressor — 나나컴퍼니
   모든 처리는 브라우저 안에서만 (서버 전송 없음)
   ============================================ */
'use strict';

/* ---------- pdf.js 워커 설정 ---------- */
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/* ---------- DOM ---------- */
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');
const toast = document.getElementById('toast');
const logoImg = document.getElementById('logoImg');
const logoFallback = document.getElementById('logoFallback');

/* 로고 없으면 텍스트 로고로 대체 */
logoImg.addEventListener('error', () => {
  logoImg.hidden = true;
  logoFallback.hidden = false;
});

/* ---------- 업로드 트리거 ---------- */
uploadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

/* ---------- 드래그 앤 드롭 ---------- */
['dragenter', 'dragover'].forEach(ev =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach(ev =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  })
);
dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));

/* 브라우저가 파일을 새 탭으로 열어버리는 것 방지 */
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

/* ---------- 토스트 ---------- */
let toastTimer = null;
function showToast(msg, ms = 4200) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, ms);
}

/* ---------- 파일 분류 ---------- */
const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];

function getExt(name) {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}

function classify(file) {
  const ext = getExt(file.name);
  if (ext === 'hwp' || ext === 'hwpx') return 'hwp';
  if (ext === 'ppt' || ext === 'doc') return 'legacy';
  if (ext === 'pptx') return 'pptx';
  if (ext === 'docx') return 'docx';
  if (ext === 'pdf') return 'pdf';
  if (IMG_EXTS.includes(ext)) return 'image';
  return 'unsupported';
}

/* ---------- 메인 핸들러 ---------- */
function handleFiles(files) {
  if (!files || !files.length) return;

  [...files].forEach(file => {
    const type = classify(file);

    if (type === 'hwp') {
      showToast('📄 HWP 파일은 지원하지 않아요. PDF나 Word(docx)로 변환해서 다시 올려주세요!');
      return;
    }
    if (type === 'legacy') {
      showToast('⚠️ 구형 .ppt/.doc 형식은 처리할 수 없어요. .pptx/.docx로 다시 저장 후 올려주세요.');
      return;
    }
    if (type === 'unsupported') {
      showToast('❌ 지원하지 않는 형식이에요. PPTX · DOCX · PDF · 이미지만 업로드할 수 있어요.');
      return;
    }

    const card = createCard(file, type);
    // 각 파일 독립 병렬 처리
    processFile(file, type, card).catch(err => {
      console.error(err);
      setError(card, '처리 중 오류가 발생했어요 😢');
    });
  });
}

/* ---------- 카드 UI ---------- */
function createCard(file, type) {
  const card = document.createElement('div');
  card.className = 'file-card';

  const iconMap = { pptx: ['ppt', 'P'], docx: ['doc', 'W'], pdf: ['pdf', '≡'], image: ['img', '🖼'] };
  const [cls, label] = iconMap[type];

  card.innerHTML = `
    <div class="file-icon ${cls}">${label}</div>
    <div class="file-info">
      <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="file-status">대기 중…</div>
    </div>
    <button class="download-btn" disabled>⬇ 다운로드</button>
  `;
  fileList.prepend(card);

  return {
    el: card,
    fill: card.querySelector('.progress-fill'),
    status: card.querySelector('.file-status'),
    btn: card.querySelector('.download-btn'),
  };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function setProgress(card, pct, msg) {
  card.fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  if (msg) card.status.textContent = msg;
}

function setDone(card, blob, downloadName, origSize) {
  setProgress(card, 100);
  card.el.classList.add('done');
  const saved = origSize > 0 ? Math.max(0, Math.round((1 - blob.size / origSize) * 100)) : 0;
  card.status.textContent =
    `완료! ${fmtSize(origSize)} → ${fmtSize(blob.size)} (${saved}% 절감)`;
  card.btn.disabled = false;
  card.btn.classList.add('ready');
  card.btn.addEventListener('click', () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
}

function setError(card, msg) {
  card.el.classList.add('error');
  card.status.textContent = msg;
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/* ---------- 처리 라우터 ---------- */
async function processFile(file, type, card) {
  setProgress(card, 3, '분석 중…');
  if (type === 'image') return compressImage(file, card);
  if (type === 'pdf') return compressPdf(file, card);
  return compressOffice(file, card); // pptx / docx
}

/* ============================================
   1) 이미지 압축: 리사이즈 + JPEG 재인코딩
   ============================================ */
async function compressImage(file, card) {
  setProgress(card, 15, '이미지 불러오는 중…');
  const img = await loadImage(file);

  setProgress(card, 45, '리사이즈 & 재인코딩 중…');
  const MAX = 1920;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // PNG 투명 배경 → 흰색
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  setProgress(card, 75, '압축 중…');
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.75);

  const base = file.name.replace(/\.[^.]+$/, '');
  const finalBlob = blob.size < file.size ? blob : file; // 커지면 원본 유지
  setDone(card, finalBlob, 'compressed_' + base + '.jpg', file.size);
}

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('이미지 로드 실패')); };
    img.src = url;
  });
}

function canvasToBlob(canvas, mime, q) {
  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error('인코딩 실패')), mime, q)
  );
}

/* ============================================
   2) PDF 압축: 전 페이지 캡처 → 저화질 JPEG → 재조립
      (저화질 스캔본 방식)
   ============================================ */
async function compressPdf(file, card) {
  if (!window.pdfjsLib || !window.jspdf) {
    setError(card, '라이브러리 로드 실패 — 인터넷 연결을 확인해주세요');
    return;
  }
  setProgress(card, 6, 'PDF 여는 중…');
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const total = pdf.numPages;

  const { jsPDF } = window.jspdf;
  let out = null;

  const RENDER_SCALE = 1.4;  // 캡처 해상도
  const JPEG_Q = 0.5;        // 저화질 스캔본 품질

  for (let i = 1; i <= total; i++) {
    setProgress(card, 6 + (i - 1) / total * 88, `페이지 캡처 중… ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', JPEG_Q);

    // 페이지 크기(pt) = viewport / scale
    const wPt = viewport.width / RENDER_SCALE;
    const hPt = viewport.height / RENDER_SCALE;
    const orient = wPt > hPt ? 'l' : 'p';

    if (!out) {
      out = new jsPDF({ orientation: orient, unit: 'pt', format: [wPt, hPt] });
    } else {
      out.addPage([wPt, hPt], orient);
    }
    out.addImage(imgData, 'JPEG', 0, 0, wPt, hPt);

    canvas.width = canvas.height = 0; // 메모리 해제
  }

  setProgress(card, 96, 'PDF로 묶는 중…');
  const blob = out.output('blob');
  setDone(card, blob, 'compressed_' + file.name, file.size);
}

/* ============================================
   3) PPTX / DOCX 압축: 내부 이미지 최적화 + 재압축
   ============================================ */
async function compressOffice(file, card) {
  if (!window.JSZip) {
    setError(card, '라이브러리 로드 실패 — 인터넷 연결을 확인해주세요');
    return;
  }
  setProgress(card, 8, '문서 여는 중…');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  // 내부 이미지 수집 (ppt/media/, word/media/)
  const mediaPaths = Object.keys(zip.files).filter(p =>
    /^(ppt|word)\/media\//i.test(p) && /\.(png|jpe?g)$/i.test(p) && !zip.files[p].dir
  );

  const MAX_DIM = 1280;
  const total = mediaPaths.length;

  for (let i = 0; i < total; i++) {
    const path = mediaPaths[i];
    setProgress(card, 10 + i / Math.max(1, total) * 65, `이미지 최적화 중… ${i + 1}/${total}`);
    try {
      const origBuf = await zip.files[path].async('blob');
      const img = await loadImage(origBuf);

      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 확장자 유지: png→png / jpg→jpeg (파일명 바꾸면 문서 참조가 깨짐)
      const isPng = /\.png$/i.test(path);
      const newBlob = await canvasToBlob(
        canvas,
        isPng ? 'image/png' : 'image/jpeg',
        isPng ? undefined : 0.65
      );

      // 작아졌을 때만 교체
      if (newBlob.size < origBuf.size) {
        zip.file(path, newBlob);
      }
    } catch (e) {
      // 개별 이미지 실패는 건너뜀 (문서 무결성 우선)
      console.warn('skip image:', path, e);
    }
  }

  setProgress(card, 82, '문서 재압축 중…');
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } },
    meta => setProgress(card, 82 + meta.percent * 0.16)
  );

  const finalBlob = blob.size < file.size ? blob : file;
  setDone(card, finalBlob, 'compressed_' + file.name, file.size);
}
