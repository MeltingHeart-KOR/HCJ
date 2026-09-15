/* ═══════════════════════════════════════════
   📎 PDF 병합기 — 순수 브라우저 처리 (pdf-lib)
   파일은 어디로도 전송되지 않습니다.
   ═══════════════════════════════════════════ */
'use strict';

/* ── DOM ── */
const $ = (id) => document.getElementById(id);
const dropZone     = $('dropZone');
const fileInput    = $('fileInput');
const listSection  = $('listSection');
const fileListEl   = $('fileList');
const fileCountEl  = $('fileCount');
const totalPagesEl = $('totalPages');
const totalSizeEl  = $('totalSize');
const outputName   = $('outputName');
const mergeBtn     = $('mergeBtn');
const clearBtn     = $('clearBtn');
const progressWrap = $('progressWrap');
const progressBar  = $('progressBar');
const progressText = $('progressText');
const resultSection = $('resultSection');
const resultInfo   = $('resultInfo');
const downloadLink = $('downloadLink');
const restartBtn   = $('restartBtn');
const toastEl      = $('toast');

/* ── 상태 ──
   files: [{ id, name, size, bytes(ArrayBuffer), pages(number|null), error(string|null) }] */
let files = [];
let seq = 0;
let lastUrl = null; // 이전 다운로드 Blob URL 해제용

/* ═══ 유틸 ═══ */
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ═══ 파일 추가 ═══ */
async function addFiles(fileList) {
  const arr = Array.from(fileList).filter((f) =>
    f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
  );
  const rejected = fileList.length - arr.length;
  if (rejected > 0) toast(`⚠️ PDF가 아닌 파일 ${rejected}개는 제외했습니다`);
  if (arr.length === 0) return;

  for (const f of arr) {
    const item = {
      id: ++seq,
      name: f.name,
      size: f.size,
      bytes: null,
      pages: null,
      error: null,
    };
    files.push(item);
    render();

    try {
      item.bytes = await f.arrayBuffer();
      // 페이지 수 확인 겸 유효성 검사 (암호 PDF 대응 옵션 포함)
      const doc = await PDFLib.PDFDocument.load(item.bytes, { ignoreEncryption: false });
      item.pages = doc.getPageCount();
    } catch (e) {
      item.error = /encrypt/i.test(String(e))
        ? '암호화된 PDF — 병합 불가'
        : '읽기 실패 — 손상되었거나 지원되지 않는 파일';
    }
    render();
  }
  vibrate(10);
}

/* ═══ 목록 렌더링 ═══ */
function render() {
  const valid = files.filter((f) => f.pages !== null);

  listSection.classList.toggle('hidden', files.length === 0);
  fileCountEl.textContent = files.length + '개';
  totalPagesEl.textContent = valid.reduce((s, f) => s + f.pages, 0);
  totalSizeEl.textContent = fmtSize(files.reduce((s, f) => s + f.size, 0));
  mergeBtn.disabled = valid.length < 2;
  mergeBtn.textContent =
    valid.length < 2 ? '📎 PDF를 2개 이상 추가하세요' : `📎 ${valid.length}개 PDF 병합하기`;

  fileListEl.innerHTML = '';
  files.forEach((f, i) => {
    const li = document.createElement('li');
    li.className = 'file-item' + (f.error ? ' error' : '');

    const meta = f.error
      ? `<span class="file-meta err">⚠️ ${f.error}</span>`
      : `<span class="file-meta">${f.pages === null ? '분석 중…' : f.pages + '페이지'} · ${fmtSize(f.size)}</span>`;

    li.innerHTML = `
      <span class="file-order">${i + 1}</span>
      <div class="file-info">
        <div class="file-name">${escapeHtml(f.name)}</div>
        ${meta}
      </div>
      <div class="file-btns">
        <button type="button" class="icon-btn" data-act="up" data-id="${f.id}" ${i === 0 ? 'disabled' : ''} aria-label="위로">▲</button>
        <button type="button" class="icon-btn" data-act="down" data-id="${f.id}" ${i === files.length - 1 ? 'disabled' : ''} aria-label="아래로">▼</button>
        <button type="button" class="icon-btn del" data-act="del" data-id="${f.id}" aria-label="삭제">✕</button>
      </div>`;
    fileListEl.appendChild(li);
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* 목록 버튼 (이벤트 위임) */
fileListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const idx = files.findIndex((f) => f.id === id);
  if (idx === -1) return;

  const act = btn.dataset.act;
  if (act === 'del') {
    files.splice(idx, 1);
  } else if (act === 'up' && idx > 0) {
    [files[idx - 1], files[idx]] = [files[idx], files[idx - 1]];
  } else if (act === 'down' && idx < files.length - 1) {
    [files[idx + 1], files[idx]] = [files[idx], files[idx + 1]];
  }
  vibrate(8);
  render();
});

/* ═══ 업로드 UI ═══ */
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
fileInput.addEventListener('change', () => {
  addFiles(fileInput.files);
  fileInput.value = ''; // 같은 파일 재선택 허용
});

['dragenter', 'dragover'].forEach((ev) =>
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
  if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

clearBtn.addEventListener('click', () => {
  files = [];
  render();
  toast('목록을 비웠습니다');
});

/* ═══ 병합 ═══ */
mergeBtn.addEventListener('click', async () => {
  const valid = files.filter((f) => f.pages !== null);
  if (valid.length < 2) return;

  mergeBtn.disabled = true;
  progressWrap.classList.remove('hidden');
  resultSection.classList.add('hidden');

  try {
    const merged = await PDFLib.PDFDocument.create();
    let done = 0;
    let totalPages = 0;

    for (const f of valid) {
      progressText.textContent = `병합 중… (${done + 1}/${valid.length}) ${f.name}`;
      const src = await PDFLib.PDFDocument.load(f.bytes);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
      totalPages += pages.length;
      done++;
      progressBar.style.width = Math.round((done / valid.length) * 90) + '%';
      // UI가 멈춰 보이지 않도록 한 파일마다 프레임 양보
      await new Promise((r) => setTimeout(r, 0));
    }

    progressText.textContent = '파일 생성 중…';
    const bytes = await merged.save();
    progressBar.style.width = '100%';

    // 다운로드 링크 준비
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    lastUrl = URL.createObjectURL(blob);

    const name = (outputName.value.trim() || 'merged').replace(/[\\/:*?"<>|]/g, '_');
    downloadLink.href = lastUrl;
    downloadLink.download = name + '.pdf';

    resultInfo.innerHTML =
      `<strong>${valid.length}개</strong> 파일 → <strong>${totalPages}페이지</strong> · ${fmtSize(blob.size)}<br />` +
      `파일명: ${escapeHtml(name)}.pdf`;

    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    vibrate([20, 40, 20]);
    toast('✅ 병합 완료!');
  } catch (e) {
    console.error(e);
    toast('❌ 병합 실패: ' + (e.message || '알 수 없는 오류'));
  } finally {
    mergeBtn.disabled = false;
    setTimeout(() => {
      progressWrap.classList.add('hidden');
      progressBar.style.width = '0%';
    }, 800);
    render();
  }
});

/* ═══ 새로 시작 ═══ */
restartBtn.addEventListener('click', () => {
  files = [];
  resultSection.classList.add('hidden');
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* 초기 렌더 */
render();
