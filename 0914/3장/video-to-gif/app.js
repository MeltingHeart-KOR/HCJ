'use strict';

/* ===== Video to GIF — 나나컴퍼니 =====
 * 모든 변환은 브라우저 안에서 처리 (서버 전송 없음)
 * FPS 상한: 29 (요구사항)
 */

const MAX_FPS = 29;          // 절대 상한
const MAX_DURATION = 30;     // 변환 최대 길이(초) — 너무 긴 GIF 방지
const GIF_CDN_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';

const $ = (s) => document.querySelector(s);

const dropzone = $('#dropzone');
const fileInput = $('#fileInput');
const pickBtn = $('#pickBtn');
const fileSection = $('#fileSection');
const fileList = $('#fileList');
const toastEl = $('#toast');

const state = { items: [], busy: false, workerUrl: null };
let uid = 0;

/* ---------- 로고 폴백 ---------- */
const logoImg = document.querySelector('.logo-img');
logoImg.addEventListener('error', () => {
  logoImg.hidden = true;
  document.querySelector('.logo-fallback').hidden = false;
});

/* ---------- 토스트 ---------- */
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
}

/* ---------- 옵션 (칩 선택) ---------- */
function setupChips(containerId) {
  const box = $(containerId);
  box.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    box.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  });
}
setupChips('#fpsChips');
setupChips('#widthChips');

function getFps() {
  const chip = $('#fpsChips .chip.active');
  const v = parseInt(chip ? chip.dataset.fps : '10', 10);
  return Math.min(Math.max(v, 1), MAX_FPS); // 29 FPS 상한 강제
}
function getOutWidth() {
  const chip = $('#widthChips .chip.active');
  return parseInt(chip ? chip.dataset.width : '480', 10);
}

/* ---------- 업로드 (버튼 + 드래그 앤 드롭) ---------- */
pickBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  })
);
dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));

function handleFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith('video/')) {
      toast(`"${file.name}" — 동영상 파일만 업로드할 수 있어요 🎞️`);
      continue;
    }
    addItem(file);
    added++;
  }
  if (added > 0) {
    fileSection.hidden = false;
    pump();
  }
}

/* ---------- 목록 UI ---------- */
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function addItem(file) {
  const id = ++uid;
  const li = document.createElement('li');
  li.className = 'file-item';
  li.innerHTML = `
    <div class="thumb" data-role="thumb">🎬</div>
    <div class="file-info">
      <p class="file-name" title="${file.name}">${file.name}</p>
      <p class="file-status" data-role="status">대기 중…</p>
      <div class="progress-track"><div class="progress-fill" data-role="bar"></div></div>
    </div>
    <button class="dl-btn" data-role="dl" disabled>⬇ 다운로드</button>
  `;
  fileList.appendChild(li);

  const item = {
    id, file, status: 'wait',
    el: li,
    thumbEl: li.querySelector('[data-role="thumb"]'),
    statusEl: li.querySelector('[data-role="status"]'),
    barEl: li.querySelector('[data-role="bar"]'),
    dlBtn: li.querySelector('[data-role="dl"]'),
  };
  state.items.push(item);
}

function setProgress(item, pct, msg) {
  item.barEl.style.width = Math.min(100, pct).toFixed(1) + '%';
  if (msg) item.statusEl.textContent = msg;
}

/* ---------- 순차 처리 큐 (동영상은 메모리를 많이 써서 한 번에 하나씩) ---------- */
async function pump() {
  if (state.busy) return;
  const item = state.items.find((i) => i.status === 'wait');
  if (!item) return;
  state.busy = true;
  item.status = 'work';
  try {
    await processItem(item);
    item.status = 'done';
  } catch (err) {
    item.status = 'error';
    item.statusEl.textContent = '⚠️ 변환 실패 — 브라우저가 지원하지 않는 코덱일 수 있어요';
    item.statusEl.classList.add('error');
    item.barEl.style.width = '100%';
    item.barEl.style.background = '#C0392B';
  }
  state.busy = false;
  pump();
}

/* ---------- gif.js 워커 준비 (CDN 워커는 blob으로 우회) ---------- */
async function getWorkerUrl() {
  if (state.workerUrl) return state.workerUrl;
  const code = await fetch(GIF_CDN_WORKER).then((r) => r.text());
  state.workerUrl = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  return state.workerUrl;
}

/* ---------- 동영상 탐색 ---------- */
function seekTo(video, t) {
  return new Promise((resolve) => {
    const target = Math.min(Math.max(t, 0.01), Math.max(0.01, video.duration - 0.05));
    if (Math.abs(video.currentTime - target) < 0.005) return resolve();
    const onSeek = () => {
      video.removeEventListener('seeked', onSeek);
      resolve();
    };
    video.addEventListener('seeked', onSeek);
    video.currentTime = target;
  });
}

/* ---------- 변환 본체 ---------- */
async function processItem(item) {
  const url = URL.createObjectURL(item.file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  setProgress(item, 2, '동영상 읽는 중…');
  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = () => reject(new Error('video load failed'));
  });

  const fps = getFps();
  const outW = getOutWidth();
  const scale = Math.min(1, outW / video.videoWidth);
  const w = Math.max(2, Math.round(video.videoWidth * scale));
  const h = Math.max(2, Math.round(video.videoHeight * scale));

  const duration = Math.min(video.duration, MAX_DURATION);
  if (video.duration > MAX_DURATION) {
    toast(`⏱️ "${item.file.name}" — 앞 ${MAX_DURATION}초까지만 변환합니다`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // 썸네일 (첫 프레임)
  await seekTo(video, 0.01);
  ctx.drawImage(video, 0, 0, w, h);
  const thumb = document.createElement('img');
  thumb.alt = '';
  thumb.src = canvas.toDataURL('image/jpeg', 0.7);
  item.thumbEl.textContent = '';
  item.thumbEl.appendChild(thumb);

  // GIF 인코더 준비
  const workerUrl = await getWorkerUrl();
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: w,
    height: h,
    workerScript: workerUrl,
  });

  // 프레임 캡처 (0% ~ 60%)
  const frameCount = Math.max(1, Math.floor(duration * fps));
  const delay = Math.round(1000 / fps);
  for (let i = 0; i < frameCount; i++) {
    await seekTo(video, i / fps);
    ctx.drawImage(video, 0, 0, w, h);
    gif.addFrame(ctx, { copy: true, delay });
    setProgress(item, ((i + 1) / frameCount) * 60, `프레임 캡처 중… ${i + 1}/${frameCount}`);
  }

  // 인코딩 (60% ~ 100%)
  const blob = await new Promise((resolve, reject) => {
    gif.on('progress', (p) => {
      setProgress(item, 60 + p * 40, `GIF 인코딩 중… ${Math.round(p * 100)}%`);
    });
    gif.on('finished', resolve);
    try {
      gif.render();
    } catch (e) {
      reject(e);
    }
  });

  URL.revokeObjectURL(url);

  // 완료 UI
  const outName = item.file.name.replace(/\.[^.]+$/, '') + '.gif';
  setProgress(item, 100);
  item.barEl.classList.add('done');
  item.statusEl.textContent = `✅ 완료 · ${formatSize(item.file.size)} → ${formatSize(blob.size)} · ${fps}fps`;
  item.statusEl.classList.add('done');
  item.dlBtn.disabled = false;
  item.dlBtn.classList.add('ready');
  item.dlBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
}
