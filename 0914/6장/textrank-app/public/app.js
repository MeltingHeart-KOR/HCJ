/* ============================================================
   TextRank 문서 요약기 — 메인 로직
   PDF: pdf.js / DOCX: JSZip + DOMParser (전부 브라우저 내 처리)
   ============================================================ */
'use strict';

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const dropzone = $('dropzone');
const fileInput = $('fileInput');
const uploadCard = $('uploadCard');
const progress = $('progress');
const progressFill = $('progressFill');
const progressText = $('progressText');
const errorBox = $('errorBox');
const resultArea = $('resultArea');
const fileBadge = $('fileBadge');
const fileName = $('fileName');
const statSent = $('statSent');
const statChar = $('statChar');
const statCompress = $('statCompress');
const lenSlider = $('lenSlider');
const sentCount = $('sentCount');
const summaryList = $('summaryList');
const copyBtn = $('copyBtn');
const previewText = $('previewText');
const resetBtn = $('resetBtn');
const toast = $('toast');

// ---------- 상태 ----------
// 30년차 포인트: TextRank 채점은 파일당 1회만 수행하고 캐싱.
// 슬라이더는 캐시에서 상위 k개만 다시 뽑으므로 즉각 반응한다.
let cache = null; // { sentences, scores, order(점수순 인덱스), text }

// ---------- 유틸 ----------
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
  progress.classList.add('hidden');
}

function setProgress(pct, text) {
  progress.classList.remove('hidden');
  progressFill.style.width = pct + '%';
  progressText.textContent = text;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---------- 텍스트 추출: PDF ----------
async function extractPdf(buf) {
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    setProgress(10 + (p / pdf.numPages) * 60, `PDF 텍스트 추출 중… (${p}/${pdf.numPages} 페이지)`);
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let last = null;
    let pageText = '';
    for (const item of content.items) {
      if (!item.str) continue;
      // y좌표가 바뀌면 줄바꿈으로 간주
      if (last && Math.abs(last.transform[5] - item.transform[5]) > 2) pageText += '\n';
      else if (last && item.str && !last.str.endsWith(' ') && !item.str.startsWith(' ')) pageText += ' ';
      pageText += item.str;
      last = item;
    }
    text += pageText + '\n\n';
  }
  return text;
}

// ---------- 텍스트 추출: DOCX ----------
async function extractDocx(buf) {
  setProgress(30, 'DOCX 압축 해제 중…');
  const zip = await JSZip.loadAsync(buf);
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('본문(document.xml)을 찾을 수 없습니다. 올바른 DOCX 파일인지 확인해주세요.');
  const xml = await docFile.async('string');

  setProgress(60, '본문 텍스트 추출 중…');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('DOCX 본문 XML 해석에 실패했습니다.');

  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const paras = doc.getElementsByTagNameNS(W, 'p');
  let text = '';
  for (const p of paras) {
    let line = '';
    // 문단 내 노드를 문서 순서대로 순회 (w:t 텍스트 / w:br 줄바꿈 / w:tab 탭)
    const nodes = p.getElementsByTagName('*');
    for (const node of nodes) {
      if (node.namespaceURI !== W) continue;
      if (node.localName === 't') line += node.textContent;
      else if (node.localName === 'br') line += '\n';
      else if (node.localName === 'tab') line += ' ';
    }
    text += line + '\n';
  }
  return text;
}

// ---------- 분석 파이프라인 ----------
async function analyze(file) {
  errorBox.classList.add('hidden');
  const name = file.name || '문서';
  const ext = name.toLowerCase().split('.').pop();

  if (ext !== 'pdf' && ext !== 'docx') {
    showError('지원하지 않는 형식입니다. PDF 또는 DOCX 파일을 올려주세요.');
    return;
  }

  try {
    setProgress(5, '파일 읽는 중…');
    const buf = await file.arrayBuffer();

    let text = '';
    if (ext === 'pdf') {
      if (!window.pdfjsLib) throw new Error('pdf.js 로드 실패 — 인터넷 연결을 확인해주세요.');
      text = await extractPdf(buf);
    } else {
      if (!window.JSZip) throw new Error('JSZip 로드 실패 — 인터넷 연결을 확인해주세요.');
      text = await extractDocx(buf);
    }

    const plain = text.replace(/\s+/g, ' ').trim();
    if (plain.length < 30) {
      throw new Error(
        '추출된 텍스트가 거의 없습니다. 스캔본(이미지) PDF이거나 빈 문서일 수 있어요. ' +
        '스캔본은 OCR이 필요해 이 앱에서는 요약할 수 없습니다.'
      );
    }

    setProgress(80, 'TextRank 요약 계산 중…');
    // UI 갱신 프레임 양보 후 계산 (문장이 많으면 수백 ms 걸릴 수 있음)
    await new Promise((r) => setTimeout(r, 30));

    const { sentences, scores } = TextRank.summarize(text, 5);
    if (sentences.length === 0) throw new Error('문장을 분리하지 못했습니다. 문서 내용을 확인해주세요.');

    const order = sentences.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
    cache = { sentences, scores, order, text };

    setProgress(100, '완료!');

    // ---- 결과 표시 ----
    fileBadge.textContent = ext.toUpperCase();
    fileBadge.classList.toggle('docx', ext === 'docx');
    fileName.textContent = name;
    statSent.textContent = sentences.length.toLocaleString();
    statChar.textContent = plain.length.toLocaleString();

    // 슬라이더 최대값을 문장 수에 맞춰 보정 (문장 3개짜리 문서에 5문장 요약은 무의미)
    const maxK = Math.min(5, sentences.length);
    lenSlider.max = String(maxK);
    if (+lenSlider.value > maxK) lenSlider.value = String(maxK);

    previewText.textContent = plain.slice(0, 1500) + (plain.length > 1500 ? ' …' : '');

    renderSummary(+lenSlider.value);

    setTimeout(() => {
      uploadCard.classList.add('hidden');
      progress.classList.add('hidden');
      resultArea.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);

    if (navigator.vibrate) navigator.vibrate(30);
  } catch (e) {
    if (String(e && e.name) === 'PasswordException') {
      showError('암호로 보호된 PDF입니다. 암호를 해제한 뒤 다시 시도해주세요.');
    } else {
      showError('분석 실패: ' + (e && e.message ? e.message : e));
    }
  }
}

// ---------- 요약 렌더링 ----------
function renderSummary(k) {
  if (!cache) return;
  const { sentences, scores, order } = cache;
  const kk = Math.max(1, Math.min(k, sentences.length));

  sentCount.textContent = kk;

  // 점수 상위 kk개 → 원문 순서로 정렬
  const pickedSet = order.slice(0, kk);
  const picked = pickedSet.slice().sort((a, b) => a - b);
  const maxScore = scores[order[0]] || 1;

  // 압축률 = 요약 글자수 / 전체 글자수
  const totalLen = sentences.reduce((s, t) => s + t.length, 0);
  const sumLen = picked.reduce((s, i) => s + sentences[i].length, 0);
  statCompress.textContent = Math.round((sumLen / totalLen) * 100) + '%';

  summaryList.innerHTML = picked.map((idx, i) => {
    const rank = pickedSet.indexOf(idx) + 1;   // 중요도 순위
    const pct = Math.round((scores[idx] / maxScore) * 100);
    return `
      <div class="sum-item" style="animation-delay:${i * 60}ms">
        <div class="sum-rank ${rank === 1 ? 'r1' : ''}">${rank}</div>
        <div class="sum-body">
          <div class="sum-text">${escapeHtml(sentences[idx])}</div>
          <div class="sum-score">
            <div class="sum-score-bar"><div class="sum-score-fill" style="width:${pct}%"></div></div>
            <span class="sum-score-label">중요도 ${pct}%</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ---------- 이벤트 ----------
fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files[0]) analyze(fileInput.files[0]);
  fileInput.value = ''; // 같은 파일 재선택 허용
});

['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); })
);
['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); })
);
dropzone.addEventListener('drop', (e) => {
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) analyze(f);
});

lenSlider.addEventListener('input', () => {
  renderSummary(+lenSlider.value);
  if (navigator.vibrate) navigator.vibrate(8);
});

copyBtn.addEventListener('click', async () => {
  if (!cache) return;
  const texts = [...summaryList.querySelectorAll('.sum-text')].map((el, i) => `${i + 1}. ${el.textContent}`);
  const payload = texts.join('\n');
  try {
    await navigator.clipboard.writeText(payload);
    showToast('📋 요약이 복사되었습니다');
  } catch {
    // 구형 브라우저 폴백
    const ta = document.createElement('textarea');
    ta.value = payload;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('📋 요약이 복사되었습니다');
  }
});

resetBtn.addEventListener('click', () => {
  cache = null;
  resultArea.classList.add('hidden');
  uploadCard.classList.remove('hidden');
  progress.classList.add('hidden');
  errorBox.classList.add('hidden');
  progressFill.style.width = '0%';
  lenSlider.max = '5';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
