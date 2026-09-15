/* 🎚️ 오디오 편집기 — 포맷 변환 · 볼륨 · Trim (전부 브라우저 내 처리) */
'use strict';

/* ===== PURE:BEGIN (Node 단위 테스트 대상 — DOM 비의존 순수 함수) ===== */

/** float(-1~1) → 16bit PCM 정수 (클리핑 포함) */
function f2i16(x) {
  x = Math.max(-1, Math.min(1, x));
  return x < 0 ? Math.round(x * 32768) : Math.round(x * 32767);
}

/** Float32 채널 배열 → 16bit PCM WAV(ArrayBuffer) */
function encodeWavPCM16(channels, sampleRate) {
  const numCh = channels.length;
  const len = channels[0].length;
  const blockAlign = numCh * 2;
  const dataSize = len * blockAlign;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true); ws(8, 'WAVE');
  ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * blockAlign, true); v.setUint16(32, blockAlign, true);
  v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, dataSize, true);
  let o = 44;
  for (let i = 0; i < len; i++)
    for (let c = 0; c < numCh; c++) { v.setInt16(o, f2i16(channels[c][i]), true); o += 2; }
  return buf;
}

/** 초 → "m:ss.d" */
function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  let s = (sec - m * 60).toFixed(1);
  if (parseFloat(s) < 10) s = '0' + s;
  if (parseFloat(s) >= 60) return (m + 1) + ':00.0';
  return m + ':' + s;
}

/**
 * Trim 범위 보정 — start < end 최소 간격 유지
 * changed: 'start' | 'end' (방금 움직인 쪽이 우선권을 잃음)
 */
function clampTrim(start, end, dur, minGap, changed) {
  minGap = Math.min(minGap, dur);
  start = Math.max(0, Math.min(start, dur));
  end = Math.max(0, Math.min(end, dur));
  if (end - start < minGap) {
    if (changed === 'start') start = Math.max(0, end - minGap);
    else end = Math.min(dur, start + minGap);
    if (end - start < minGap) { // 양끝에 몰린 경우 재보정
      if (changed === 'start') end = Math.min(dur, start + minGap);
      else start = Math.max(0, end - minGap);
    }
  }
  return [start, end];
}

/** Trim + 게인 적용 → 새 Float32 채널 배열 */
function applyGainTrim(channels, sampleRate, start, end, gain) {
  const len = channels[0].length;
  const s0 = Math.max(0, Math.floor(start * sampleRate));
  const s1 = Math.min(len, Math.max(s0 + 1, Math.round(end * sampleRate)));
  return channels.map(ch => {
    const out = new Float32Array(s1 - s0);
    for (let i = s0; i < s1; i++) out[i - s0] = ch[i] * gain;
    return out;
  });
}

/* ===== PURE:END ===== */

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const drop = $('drop'), fileInput = $('fileInput'), uploadSec = $('uploadSec'),
  editorSec = $('editorSec'), decoding = $('decoding'),
  fileName = $('fileName'), fileInfo = $('fileInfo'), btnNewFile = $('btnNewFile'),
  waveCanvas = $('waveCanvas'), btnPlay = $('btnPlay'), btnStop = $('btnStop'),
  curTime = $('curTime'), selDur = $('selDur'),
  trimStartEl = $('trimStart'), trimEndEl = $('trimEnd'),
  trimStartLabel = $('trimStartLabel'), trimEndLabel = $('trimEndLabel'),
  volSlider = $('volSlider'), volLabel = $('volLabel'),
  btnBake = $('btnBake'), btnRestore = $('btnRestore'),
  fmtMp3 = $('fmtMp3'), bitrateRow = $('bitrateRow'), bitrate = $('bitrate'),
  outName = $('outName'), btnExport = $('btnExport'),
  encProgWrap = $('encProgWrap'), encProg = $('encProg'),
  mp3Note = $('mp3Note'), toast = $('toast');

/* ---------- 상태 ---------- */
let audioCtx = null;
let origBuffer = null;   // 원본 (복원용)
let buffer = null;       // 현재 작업 버퍼
let trimS = 0, trimE = 0;
let volume = 1.0;
let peaks = null;        // 파형 캐시
let srcNode = null, gainNode = null;
let playing = false, playCtxStart = 0, rafId = 0;
let lastUrl = null;
let toastTimer = 0;
const MIN_GAP = 0.05;

/* ---------- 유틸 ---------- */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function vibe(ms) { if (navigator.vibrate) navigator.vibrate(ms); }
function ensureCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function getChannels(buf) {
  const chs = [];
  for (let c = 0; c < buf.numberOfChannels; c++) chs.push(buf.getChannelData(c));
  return chs;
}
function fmtBytes(n) {
  if (n > 1048576) return (n / 1048576).toFixed(1) + ' MB';
  if (n > 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

/* ---------- 업로드 & 디코딩 ---------- */
drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => {
  e.preventDefault(); drop.classList.remove('over');
  if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadFile(fileInput.files[0]);
  fileInput.value = '';
});

async function loadFile(file) {
  decoding.classList.remove('hidden');
  try {
    const ab = await file.arrayBuffer();
    const buf = await ensureCtx().decodeAudioData(ab);
    origBuffer = buf;
    setBuffer(buf, true);
    fileName.textContent = file.name;
    fileInfo.textContent =
      fmtTime(buf.duration) + ' · ' + buf.sampleRate.toLocaleString() + ' Hz · ' +
      (buf.numberOfChannels === 1 ? '모노' : buf.numberOfChannels + 'ch') + ' · ' + fmtBytes(file.size);
    outName.value = file.name.replace(/\.[^.]+$/, '') + '-edited';
    uploadSec.classList.add('hidden');
    editorSec.classList.remove('hidden');
    vibe(20);
    showToast('✅ 불러오기 완료');
  } catch (e) {
    showToast('⚠️ 디코딩 실패 — 지원하지 않거나 손상된 파일입니다');
  }
  decoding.classList.add('hidden');
}

function setBuffer(buf, resetVol) {
  stopPlay();
  buffer = buf;
  trimS = 0; trimE = buf.duration;
  trimStartEl.max = trimEndEl.max = buf.duration.toFixed(2);
  trimStartEl.value = 0; trimEndEl.value = buf.duration;
  if (resetVol) { volume = 1; volSlider.value = 100; volLabel.textContent = '100%'; }
  peaks = null;
  syncTrimUI();
  drawWave();
}

/* ---------- 파형 ---------- */
function computePeaks(w) {
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / w));
  const p = new Array(w);
  for (let x = 0; x < w; x++) {
    let mn = 1, mx = -1;
    const s = x * step, e = Math.min(data.length, s + step);
    for (let i = s; i < e; i += Math.max(1, (step / 50) | 0)) {
      const v = data[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    p[x] = [mn, mx];
  }
  return p;
}

function drawWave(playPos) {
  if (!buffer) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = waveCanvas.clientWidth, cssH = waveCanvas.clientHeight;
  if (waveCanvas.width !== (cssW * dpr) | 0) { waveCanvas.width = cssW * dpr; waveCanvas.height = cssH * dpr; peaks = null; }
  if (!peaks) peaks = computePeaks(cssW);
  const ctx = waveCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const x0 = (trimS / buffer.duration) * cssW;
  const x1 = (trimE / buffer.duration) * cssW;

  // 선택 구간 배경
  ctx.fillStyle = 'rgba(124,108,255,.16)';
  ctx.fillRect(x0, 0, x1 - x0, cssH);

  // 파형
  const mid = cssH / 2, amp = mid * 0.92 * Math.min(volume, 2);
  for (let x = 0; x < peaks.length; x++) {
    const inSel = x >= x0 && x <= x1;
    ctx.fillStyle = inSel ? '#8f83ff' : 'rgba(255,255,255,.22)';
    const y1 = mid + peaks[x][0] * amp, y2 = mid + peaks[x][1] * amp;
    ctx.fillRect(x, Math.min(y1, y2), 1, Math.max(1, Math.abs(y2 - y1)));
  }

  // 구간 경계선
  ctx.fillStyle = '#4ecdc4';
  ctx.fillRect(x0 - 1, 0, 2, cssH);
  ctx.fillRect(x1 - 1, 0, 2, cssH);

  // 재생 헤드
  if (playPos !== undefined) {
    const px = (playPos / buffer.duration) * cssW;
    ctx.fillStyle = '#ffb84d';
    ctx.fillRect(px - 1, 0, 2, cssH);
  }
}
window.addEventListener('resize', () => { peaks = null; drawWave(); });

/* ---------- Trim ---------- */
function syncTrimUI() {
  trimStartLabel.textContent = fmtTime(trimS);
  trimEndLabel.textContent = fmtTime(trimE);
  selDur.textContent = fmtTime(trimE - trimS);
}
function onTrim(changed) {
  stopPlay();
  let s = parseFloat(trimStartEl.value), e = parseFloat(trimEndEl.value);
  [s, e] = clampTrim(s, e, buffer.duration, MIN_GAP, changed);
  trimS = s; trimE = e;
  trimStartEl.value = s; trimEndEl.value = e;
  syncTrimUI();
  drawWave();
}
trimStartEl.addEventListener('input', () => onTrim('start'));
trimEndEl.addEventListener('input', () => onTrim('end'));

/* ---------- 볼륨 ---------- */
volSlider.addEventListener('input', () => {
  volume = parseInt(volSlider.value, 10) / 100;
  volLabel.textContent = volSlider.value + '%';
  if (gainNode) gainNode.gain.value = volume;
  drawWave(playing ? currentPlayPos() : undefined);
});

/* ---------- 재생 ---------- */
function currentPlayPos() {
  return Math.min(trimE, trimS + (audioCtx.currentTime - playCtxStart));
}
function play() {
  ensureCtx();
  stopPlay();
  srcNode = audioCtx.createBufferSource();
  srcNode.buffer = buffer;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  srcNode.connect(gainNode).connect(audioCtx.destination);
  srcNode.start(0, trimS, trimE - trimS);
  playCtxStart = audioCtx.currentTime;
  playing = true;
  btnPlay.textContent = '⏸ 일시정지';
  const tick = () => {
    if (!playing) return;
    const pos = currentPlayPos();
    curTime.textContent = fmtTime(pos - trimS);
    drawWave(pos);
    rafId = requestAnimationFrame(tick);
  };
  tick();
  srcNode.onended = () => { if (playing) stopPlay(); };
}
function stopPlay() {
  playing = false;
  cancelAnimationFrame(rafId);
  if (srcNode) { try { srcNode.onended = null; srcNode.stop(); } catch (e) {} srcNode = null; }
  gainNode = null;
  btnPlay.textContent = '▶ 구간 재생';
  curTime.textContent = '0:00.0';
  if (buffer) drawWave();
}
btnPlay.addEventListener('click', () => (playing ? stopPlay() : play()));
btnStop.addEventListener('click', stopPlay);

/* ---------- 편집 적용 / 복원 ---------- */
btnBake.addEventListener('click', () => {
  const chs = applyGainTrim(getChannels(buffer), buffer.sampleRate, trimS, trimE, volume);
  const nb = ensureCtx().createBuffer(chs.length, chs[0].length, buffer.sampleRate);
  chs.forEach((ch, i) => nb.copyToChannel(ch, i));
  setBuffer(nb, true);
  vibe(25);
  showToast('✅ 편집이 파형에 반영됐습니다');
});
btnRestore.addEventListener('click', () => {
  if (!origBuffer) return;
  setBuffer(origBuffer, true);
  showToast('↩️ 원본으로 복원됐습니다');
});
btnNewFile.addEventListener('click', () => {
  stopPlay();
  editorSec.classList.add('hidden');
  uploadSec.classList.remove('hidden');
});

/* ---------- 포맷 선택 ---------- */
document.querySelectorAll('input[name="fmt"]').forEach(r =>
  r.addEventListener('change', () => bitrateRow.classList.toggle('hidden', !fmtMp3.checked)));
if (typeof lamejs === 'undefined') {
  fmtMp3.disabled = true;
  mp3Note.textContent = '⚠️ MP3 인코더(CDN) 로드 실패 — 인터넷 연결을 확인하세요. WAV 내보내기는 가능합니다.';
}

/* ---------- 내보내기 ---------- */
function encodeMp3Chunked(channels, sampleRate, kbps, onProg, done) {
  const ch = channels.length >= 2 ? [channels[0], channels[1]] : [channels[0]]; // 3ch+ → 스테레오
  const enc = new lamejs.Mp3Encoder(ch.length, sampleRate, kbps);
  const BLOCK = 1152, total = ch[0].length, out = [];
  let i = 0;
  (function step() {
    const t0 = performance.now();
    while (i < total && performance.now() - t0 < 30) {
      const n = Math.min(BLOCK, total - i);
      const l = new Int16Array(n);
      const r = ch[1] ? new Int16Array(n) : null;
      for (let j = 0; j < n; j++) {
        l[j] = f2i16(ch[0][i + j]);
        if (r) r[j] = f2i16(ch[1][i + j]);
      }
      const d = r ? enc.encodeBuffer(l, r) : enc.encodeBuffer(l);
      if (d.length) out.push(d);
      i += n;
    }
    onProg(i / total);
    if (i < total) setTimeout(step, 0);
    else {
      const d = enc.flush();
      if (d.length) out.push(d);
      done(new Blob(out, { type: 'audio/mpeg' }));
    }
  })();
}

btnExport.addEventListener('click', () => {
  if (!buffer) return;
  stopPlay();
  const useMp3 = fmtMp3.checked;
  const name = (outName.value.trim() || 'edited-audio').replace(/[\\/:*?"<>|]/g, '_');
  const chs = applyGainTrim(getChannels(buffer), buffer.sampleRate, trimS, trimE, volume);

  btnExport.disabled = true;
  encProgWrap.classList.remove('hidden');
  encProg.style.width = '5%';

  const finish = (blob, ext) => {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = lastUrl;
    a.download = name + '.' + ext;
    a.click();
    encProg.style.width = '100%';
    setTimeout(() => { encProgWrap.classList.add('hidden'); encProg.style.width = '0%'; }, 800);
    btnExport.disabled = false;
    vibe([30, 40, 30]);
    showToast('⬇️ ' + name + '.' + ext + ' (' + fmtBytes(blob.size) + ') 다운로드!');
  };

  if (useMp3) {
    encodeMp3Chunked(chs, buffer.sampleRate, parseInt(bitrate.value, 10),
      p => { encProg.style.width = Math.round(p * 100) + '%'; },
      blob => finish(blob, 'mp3'));
  } else {
    setTimeout(() => {
      const wav = encodeWavPCM16(chs, buffer.sampleRate);
      finish(new Blob([wav], { type: 'audio/wav' }), 'wav');
    }, 30);
  }
});

/* Node 단위 테스트용 export (브라우저에선 무시됨) */
if (typeof module !== 'undefined') {
  module.exports = { f2i16, encodeWavPCM16, fmtTime, clampTrim, applyGainTrim };
}
