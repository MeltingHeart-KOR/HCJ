'use strict';

/* ═══════════ Smart GIF Studio ═══════════
   Decode: gifuct-js (CDN) / Encode: gif.js (CDN)
   All processing happens in the browser. */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const GIF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';
let workerBlobUrl = null; // cross-origin worker workaround

/* ── App state ── */
const state = {
  fileName: 'animation.gif',
  blob: null,        // current GIF blob (for preview & download)
  frames: [],        // array of canvases (full composited frames)
  delays: [],        // ms per frame
  width: 0,
  height: 0,
  edited: false,
  busy: false,
};

/* ═══════════ Boot ═══════════ */
document.addEventListener('DOMContentLoaded', () => {
  // logo fallback
  const logo = $('#logoImg');
  logo.addEventListener('error', () => {
    logo.hidden = true;
    $('#logoFallback').hidden = false;
  });

  initUpload();
  initToolNav();
  initResize();
  initCrop();
  initDownsizing();
  initConvert();
  initRotate();
  initSimpleTools();
  initSpeed();
  initCut();

  $('#downloadBtn').addEventListener('click', downloadCurrent);
  $('#anotherBtn').addEventListener('click', resetAll);
});

/* ═══════════ Upload ═══════════ */
function initUpload() {
  const dz = $('#dropzone');
  const input = $('#fileInput');

  $('#chooseBtn').addEventListener('click', (e) => { e.stopPropagation(); input.click(); });
  dz.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); input.value = ''; });

  ['dragenter', 'dragover'].forEach(ev =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(ev =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('dragover'); }));
  dz.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
}

async function handleFile(file) {
  const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
  if (!isGif) { toast('⚠️ GIF 파일만 업로드할 수 있어요!'); return; }

  toast('🎞️ GIF 분석 중…');
  try {
    const buf = await file.arrayBuffer();
    const lib = window.gifuct || window.GIF_UCT || null;
    if (!lib || !lib.parseGIF) throw new Error('GIF decoder library not loaded');

    const parsed = lib.parseGIF(buf);
    const rawFrames = lib.decompressFrames(parsed, true);
    if (!rawFrames.length) throw new Error('No frames found');

    const W = parsed.lsd.width, H = parsed.lsd.height;
    const { frames, delays } = compositeFrames(rawFrames, W, H);

    state.fileName = file.name;
    state.blob = file;
    state.frames = frames;
    state.delays = delays;
    state.width = W;
    state.height = H;
    state.edited = false;

    $('#uploadScreen').hidden = true;
    $('#editorScreen').hidden = false;
    $('#previewTitle').textContent = 'Original GIF';
    showView('home');
    renderPreview();
    toast(`✅ 로드 완료 — ${frames.length} frames`);
  } catch (err) {
    console.error(err);
    toast('❌ GIF를 읽을 수 없어요. 파일을 확인해주세요.');
  }
}

/* Composite partial patches into full frames (handles disposal) */
function compositeFrames(rawFrames, W, H) {
  const frames = [], delays = [];
  const base = document.createElement('canvas');
  base.width = W; base.height = H;
  const ctx = base.getContext('2d');

  const patch = document.createElement('canvas');
  const pctx = patch.getContext('2d');

  let prevSnapshot = null;

  rawFrames.forEach((f) => {
    const d = f.dims;

    if (f.disposalType === 3) {
      prevSnapshot = ctx.getImageData(0, 0, W, H);
    }

    patch.width = d.width; patch.height = d.height;
    pctx.putImageData(new ImageData(new Uint8ClampedArray(f.patch), d.width, d.height), 0, 0);
    ctx.drawImage(patch, d.left, d.top);

    // snapshot full frame
    const snap = document.createElement('canvas');
    snap.width = W; snap.height = H;
    snap.getContext('2d').drawImage(base, 0, 0);
    frames.push(snap);
    delays.push(Math.max(20, f.delay || 100));

    // disposal
    if (f.disposalType === 2) {
      ctx.clearRect(d.left, d.top, d.width, d.height);
    } else if (f.disposalType === 3 && prevSnapshot) {
      ctx.putImageData(prevSnapshot, 0, 0);
    }
  });

  return { frames, delays };
}

/* ═══════════ Preview & info ═══════════ */
function renderPreview() {
  const img = $('#previewImg');
  if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
  const url = URL.createObjectURL(state.blob);
  img.src = url;
  img.dataset.url = url;

  const totalMs = state.delays.reduce((a, b) => a + b, 0);
  const avg = totalMs / state.delays.length;
  $('#infoName').textContent = shorten(state.fileName, 22);
  $('#infoSize').textContent = fmtSize(state.blob.size);
  $('#infoRes').textContent = `${state.width} × ${state.height}px`;
  $('#infoFps').textContent = `${(1000 / avg).toFixed(1)} fps`;
  $('#infoFrames').textContent = `${state.frames.length} frames`;
  $('#infoDur').textContent = `${(totalMs / 1000).toFixed(1)}s`;
}

function fmtSize(b) {
  if (b >= 1048576) return (b / 1048576).toFixed(2) + ' MB';
  if (b >= 1024) return (b / 1024).toFixed(1) + ' KB';
  return b + ' B';
}
function shorten(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

function downloadCurrent() {
  if (!state.blob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(state.blob);
  a.download = state.edited ? 'edited_' + state.fileName : state.fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function resetAll() {
  if (state.busy) { toast('⏳ 작업이 끝난 뒤에 가능해요'); return; }
  state.blob = null; state.frames = []; state.delays = [];
  state.edited = false;
  $('#editorScreen').hidden = true;
  $('#uploadScreen').hidden = false;
  showView('home');
}

/* ═══════════ Tool navigation ═══════════ */
const VIEWS = ['home','resize','crop','downsizing','convert','rotate','optimize','reverse','speed','cut'];

function showView(name) {
  VIEWS.forEach(v => { const el = $('#view-' + v); if (el) el.hidden = (v !== name); });
}

function initToolNav() {
  $$('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      if (tool === 'resize') prepResize();
      if (tool === 'cut') prepCut();
      showView(tool);
    });
  });
  $$('[data-back]').forEach(btn => btn.addEventListener('click', () => {
    if (!state.busy) showView('home');
  }));
}

/* ═══════════ Encoding (gif.js) ═══════════ */
async function ensureWorker() {
  if (workerBlobUrl) return workerBlobUrl;
  const txt = await fetch(GIF_WORKER_URL).then(r => r.text());
  workerBlobUrl = URL.createObjectURL(new Blob([txt], { type: 'application/javascript' }));
  return workerBlobUrl;
}

function encodeGif(frames, delays, width, height, quality) {
  return new Promise(async (resolve, reject) => {
    try {
      const ws = await ensureWorker();
      const gif = new GIF({
        workers: 2,
        quality: quality || 10,
        width, height,
        workerScript: ws,
      });
      frames.forEach((c, i) => gif.addFrame(c, { copy: true, delay: delays[i] }));
      gif.on('progress', (p) => setProgress(40 + Math.round(p * 60), 'GIF 인코딩 중… ' + Math.round(p * 100) + '%'));
      gif.on('finished', (blob) => resolve(blob));
      gif.render();
    } catch (e) { reject(e); }
  });
}

/* progress UI */
function setBusy(b) {
  state.busy = b;
  $('#progressWrap').hidden = !b;
  $$('.btn-go, .btn-back, .tool-btn, .btn-another, .btn-convert').forEach(el => el.disabled = b);
  if (!b) setProgress(0, '');
}
function setProgress(pct, txt) {
  $('#progressFill').style.width = Math.min(100, pct) + '%';
  if (txt) $('#progressText').textContent = txt;
}

/* apply a processed result */
async function applyResult(frames, delays, width, height, quality, doneMsg) {
  setProgress(30, '프레임 준비 완료 — 인코딩 시작');
  const blob = await encodeGif(frames, delays, width, height, quality);
  state.frames = frames;
  state.delays = delays;
  state.width = width;
  state.height = height;
  state.blob = blob;
  state.edited = true;
  $('#previewTitle').textContent = 'Result GIF';  // Original GIF panel is replaced
  renderPreview();
  showView('home');
  toast(doneMsg || '✅ 완료!');
}

async function runTool(fn) {
  if (state.busy) return;
  setBusy(true);
  setProgress(5, '작업 시작…');
  try {
    await fn();
  } catch (err) {
    console.error(err);
    toast('❌ 처리 중 오류가 발생했어요');
  } finally {
    setBusy(false);
  }
}

/* draw all frames through a transform */
function mapFrames(w, h, drawFn) {
  return state.frames.map((src, i) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    drawFn(c.getContext('2d'), src, i);
    if (i % 10 === 0) setProgress(5 + Math.round((i / state.frames.length) * 25), `프레임 변환 중… ${i + 1}/${state.frames.length}`);
    return c;
  });
}

/* ═══════════ Tool: Resize ═══════════ */
let lockRatio = true;

function prepResize() {
  const { width: w, height: h } = state;
  const x = $('#resizeX'), y = $('#resizeY');
  x.min = Math.max(1, Math.round(w * 0.05)); x.max = w * 3; x.value = w;
  y.min = Math.max(1, Math.round(h * 0.05)); y.max = h * 3; y.value = h;
  $('#resizeXVal').textContent = w + 'px';
  $('#resizeYVal').textContent = h + 'px';
  $('#resizeHint').textContent = `Current: ${w} × ${h}px`;
}

function initResize() {
  const x = $('#resizeX'), y = $('#resizeY');
  const lock = $('#lockBtn');

  lock.addEventListener('click', () => {
    lockRatio = !lockRatio;
    lock.textContent = lockRatio ? '🔒' : '🔓';
    lock.classList.toggle('locked', lockRatio);
  });

  x.addEventListener('input', () => {
    if (lockRatio) {
      const ny = Math.round(Number(x.value) * state.height / state.width);
      y.value = Math.min(Math.max(ny, Number(y.min)), Number(y.max));
      $('#resizeYVal').textContent = y.value + 'px';
    }
    $('#resizeXVal').textContent = x.value + 'px';
  });
  y.addEventListener('input', () => {
    if (lockRatio) {
      const nx = Math.round(Number(y.value) * state.width / state.height);
      x.value = Math.min(Math.max(nx, Number(x.min)), Number(x.max));
      $('#resizeXVal').textContent = x.value + 'px';
    }
    $('#resizeYVal').textContent = y.value + 'px';
  });

  $('#goResize').addEventListener('click', () => runTool(async () => {
    const nw = Number($('#resizeX').value), nh = Number($('#resizeY').value);
    const frames = mapFrames(nw, nh, (ctx, src) => {
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, nw, nh);
    });
    await applyResult(frames, [...state.delays], nw, nh, 10, `✅ Resize 완료 — ${nw}×${nh}px`);
  }));
}

/* ═══════════ Tool: Crop ═══════════ */
function initCrop() {
  $('#cropRatios').addEventListener('click', (e) => {
    const btn = e.target.closest('.ratio-btn');
    if (!btn) return;
    $$('#cropRatios .ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  $$('input[name=cropMode]').forEach(r => r.addEventListener('change', () => {
    $('#padColorRow').style.display = ($('input[name=cropMode]:checked').value === 'pad') ? 'flex' : 'none';
  }));

  $('#goCrop').addEventListener('click', () => runTool(async () => {
    const ratioStr = $('#cropRatios .ratio-btn.active').dataset.ratio;
    const [rw, rh] = ratioStr.split(':').map(Number);
    const targetRatio = rw / rh;
    const mode = $('input[name=cropMode]:checked').value;
    const color = $('#cropPadColor').value;
    const { width: w, height: h } = state;
    const imgRatio = w / h;

    let nw, nh;
    if (mode === 'pad') {
      // canvas that contains whole image + padding
      if (imgRatio > targetRatio) { nw = w; nh = Math.round(w / targetRatio); }
      else { nh = h; nw = Math.round(h * targetRatio); }
      const ox = Math.round((nw - w) / 2), oy = Math.round((nh - h) / 2);
      const frames = mapFrames(nw, nh, (ctx, src) => {
        ctx.fillStyle = color; ctx.fillRect(0, 0, nw, nh);
        ctx.drawImage(src, ox, oy);
      });
      await applyResult(frames, [...state.delays], nw, nh, 10, `✅ Crop(Pad) 완료 — ${ratioStr}`);
    } else {
      // zoom: crop centered region of target ratio
      if (imgRatio > targetRatio) { nh = h; nw = Math.round(h * targetRatio); }
      else { nw = w; nh = Math.round(w / targetRatio); }
      const sx = Math.round((w - nw) / 2), sy = Math.round((h - nh) / 2);
      const frames = mapFrames(nw, nh, (ctx, src) => {
        ctx.drawImage(src, sx, sy, nw, nh, 0, 0, nw, nh);
      });
      await applyResult(frames, [...state.delays], nw, nh, 10, `✅ Crop(Zoom) 완료 — ${ratioStr}`);
    }
  }));
}

/* ═══════════ Tool: Downsizing ═══════════ */
function initDownsizing() {
  $('#dsScaleVal').addEventListener('input', () => {
    $('#dsScaleShow').textContent = $('#dsScaleVal').value + '%';
  });

  $('#goDownsizing').addEventListener('click', () => runTool(async () => {
    const useScale = $('#dsScale').checked;
    const useFrames = $('#dsFrames').checked;
    const useQuality = $('#dsQuality').checked;
    if (!useScale && !useFrames && !useQuality) { toast('⚠️ 방법을 하나 이상 선택해주세요'); return; }

    let frames = state.frames, delays = [...state.delays];
    let w = state.width, h = state.height;

    if (useFrames && frames.length > 2) {
      const nf = [], nd = [];
      for (let i = 0; i < frames.length; i += 2) {
        nf.push(frames[i]);
        // merge skipped frame's delay so total duration stays the same
        nd.push(delays[i] + (delays[i + 1] || 0));
      }
      frames = nf; delays = nd;
    }

    if (useScale) {
      const sc = Number($('#dsScaleVal').value) / 100;
      const nw = Math.max(1, Math.round(w * sc)), nh = Math.max(1, Math.round(h * sc));
      frames = frames.map((src, i) => {
        const c = document.createElement('canvas');
        c.width = nw; c.height = nh;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, 0, 0, nw, nh);
        if (i % 10 === 0) setProgress(5 + Math.round((i / frames.length) * 25), `프레임 축소 중… ${i + 1}/${frames.length}`);
        return c;
      });
      w = nw; h = nh;
    } else {
      // clone canvases so state isn't shared
      frames = frames.map(src => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(src, 0, 0);
        return c;
      });
    }

    const quality = useQuality ? 22 : 10;
    const before = state.blob.size;
    await applyResult(frames, delays, w, h, quality, '');
    toast(`✅ Downsizing 완료 — ${fmtSize(before)} → ${fmtSize(state.blob.size)}`);
  }));
}

/* ═══════════ Tool: Format Convert ═══════════ */
function initConvert() {
  $('#convJpg').addEventListener('click', () => {
    if (state.busy || !state.frames.length) return;
    state.frames[0].toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = state.fileName.replace(/\.gif$/i, '') + '.jpg';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('✅ JPG 저장 완료 (첫 프레임)');
    }, 'image/jpeg', 0.92);
  });

  $('#convVideo').addEventListener('click', () => runTool(async () => {
    const { frames, delays, width: w, height: h } = state;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frames[0], 0, 0);

    const stream = canvas.captureStream(30);
    let mime = 'video/mp4';
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';

    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const done = new Promise(res => { rec.onstop = res; });
    rec.start(200);

    // play frames in real time
    for (let i = 0; i < frames.length; i++) {
      ctx.drawImage(frames[i], 0, 0);
      setProgress(Math.round((i / frames.length) * 95), `녹화 중… ${i + 1}/${frames.length}`);
      await new Promise(r => setTimeout(r, delays[i]));
    }
    await new Promise(r => setTimeout(r, 200));
    rec.stop();
    await done;

    const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = state.fileName.replace(/\.gif$/i, '') + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast(`✅ ${ext.toUpperCase()} 저장 완료 — ${fmtSize(blob.size)}`);
  }));
}

/* ═══════════ Tool: Rotate / Flip ═══════════ */
function initRotate() {
  $('#rotateGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.ratio-btn');
    if (!btn) return;
    $$('#rotateGrid .ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  $('#goRotate').addEventListener('click', () => runTool(async () => {
    const mode = $('#rotateGrid .ratio-btn.active').dataset.rot;
    const { width: w, height: h } = state;
    const swap = (mode === '90' || mode === '270');
    const nw = swap ? h : w, nh = swap ? w : h;

    const frames = mapFrames(nw, nh, (ctx, src) => {
      ctx.save();
      if (mode === '90') { ctx.translate(nw, 0); ctx.rotate(Math.PI / 2); }
      else if (mode === '180') { ctx.translate(nw, nh); ctx.rotate(Math.PI); }
      else if (mode === '270') { ctx.translate(0, nh); ctx.rotate(-Math.PI / 2); }
      else if (mode === 'flipH') { ctx.translate(nw, 0); ctx.scale(-1, 1); }
      else if (mode === 'flipV') { ctx.translate(0, nh); ctx.scale(1, -1); }
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    });

    const label = { '90': '90°', '180': '180°', '270': '270°', flipH: 'Flip H', flipV: 'Flip V' }[mode];
    await applyResult(frames, [...state.delays], nw, nh, 10, `✅ Rotate 완료 — ${label}`);
  }));
}

/* ═══════════ Tools: Optimize / Reverse ═══════════ */
function initSimpleTools() {
  $('#goOptimize').addEventListener('click', () => runTool(async () => {
    const before = state.blob.size;
    const frames = state.frames.map(src => {
      const c = document.createElement('canvas');
      c.width = state.width; c.height = state.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return c;
    });
    await applyResult(frames, [...state.delays], state.width, state.height, 10, '');
    const after = state.blob.size;
    const diff = before - after;
    toast(diff > 0
      ? `⚡ Optimize 완료 — ${fmtSize(before)} → ${fmtSize(after)} (${Math.round(diff / before * 100)}% 절감)`
      : `⚡ 이미 최적화된 파일이에요 (${fmtSize(after)})`);
  }));

  $('#goReverse').addEventListener('click', () => runTool(async () => {
    const frames = [...state.frames].reverse().map(src => {
      const c = document.createElement('canvas');
      c.width = state.width; c.height = state.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return c;
    });
    const delays = [...state.delays].reverse();
    await applyResult(frames, delays, state.width, state.height, 10, '⏪ Reverse 완료!');
  }));
}

/* ═══════════ Tool: Speed ═══════════ */
function initSpeed() {
  $('#speedSlider').addEventListener('input', () => {
    const v = Number($('#speedSlider').value) / 100;
    let label = '같은 속도';
    if (v > 1) label = '더 빠르게';
    if (v < 1) label = '더 느리게';
    $('#speedShow').textContent = `${v.toFixed(2)}× (${label})`;
  });

  $('#goSpeed').addEventListener('click', () => runTool(async () => {
    const mult = Number($('#speedSlider').value) / 100;
    const frames = state.frames.map(src => {
      const c = document.createElement('canvas');
      c.width = state.width; c.height = state.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return c;
    });
    const delays = state.delays.map(d => Math.max(20, Math.round(d / mult)));
    await applyResult(frames, delays, state.width, state.height, 10, `🐇 Speed 완료 — ${mult.toFixed(2)}×`);
  }));
}

/* ═══════════ Tool: Cut ═══════════ */
function prepCut() {
  const n = state.frames.length;
  const s = $('#cutStart'), e = $('#cutEnd');
  s.max = n; s.value = 1;
  e.max = n; e.value = n;
  $('#cutStartVal').textContent = '1';
  $('#cutEndVal').textContent = String(n);
  updateCutShow();
}

function updateCutShow() {
  const s = Number($('#cutStart').value), e = Number($('#cutEnd').value);
  const n = state.frames.length;
  const ms = state.delays.slice(s - 1, e).reduce((a, b) => a + b, 0);
  $('#cutShow').textContent = `Frame ${s} – ${e} of ${n} · ${(ms / 1000).toFixed(1)}s`;
}

function initCut() {
  const s = $('#cutStart'), e = $('#cutEnd');
  s.addEventListener('input', () => {
    if (Number(s.value) > Number(e.value)) s.value = e.value;
    $('#cutStartVal').textContent = s.value;
    updateCutShow();
  });
  e.addEventListener('input', () => {
    if (Number(e.value) < Number(s.value)) e.value = s.value;
    $('#cutEndVal').textContent = e.value;
    updateCutShow();
  });

  $('#goCut').addEventListener('click', () => runTool(async () => {
    const from = Number(s.value) - 1, to = Number(e.value); // inclusive→slice
    if (to - from < 1) { toast('⚠️ 최소 1프레임 이상 선택해주세요'); return; }
    const frames = state.frames.slice(from, to).map(src => {
      const c = document.createElement('canvas');
      c.width = state.width; c.height = state.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return c;
    });
    const delays = state.delays.slice(from, to);
    await applyResult(frames, delays, state.width, state.height, 10, `🎬 Cut 완료 — ${frames.length} frames`);
  }));
}

/* ═══════════ Toast ═══════════ */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
