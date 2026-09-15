/* ═══════════════════════════════════════════
   🚪 자리 비움 안내 화면 — 로직
   ═══════════════════════════════════════════ */
'use strict';

/* ─── DOM 참조 ─── */
const $ = (id) => document.getElementById(id);

const setupScreen   = $('setupScreen');
const displayScreen = $('displayScreen');

const inputSchedule = $('inputSchedule');
const inputReturn   = $('inputReturn');
const inputMessage  = $('inputMessage');
const btnConfirm    = $('btnConfirm');

const nowClock        = $('nowClock');
const dSchedule       = $('dSchedule');
const dReturn         = $('dReturn');
const dCountdown      = $('dCountdown');
const dCountdownLabel = $('dCountdownLabel');
const dMessage        = $('dMessage');

let timerId = null;        // 카운트다운 인터벌
let returnDate = null;     // 복귀 목표 시각 (Date)
let wakeLock = null;       // 화면 꺼짐 방지

/* ═══ ① 설정 화면 ═══ */

/* 일정 프리셋 칩 */
$('scheduleChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  inputSchedule.value = chip.dataset.value;
  validate();
});

/* 시간 프리셋 칩 (+N분) */
$('timeChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const t = new Date(Date.now() + Number(chip.dataset.min) * 60000);
  inputReturn.value =
    String(t.getHours()).padStart(2, '0') + ':' +
    String(t.getMinutes()).padStart(2, '0');
  validate();
});

/* 필수값 검증 → 버튼 활성화 */
function validate() {
  btnConfirm.disabled = !(inputSchedule.value.trim() && inputReturn.value);
}
inputSchedule.addEventListener('input', validate);
inputReturn.addEventListener('input', validate);

/* 기본값: 30분 뒤 복귀 */
(function initDefault() {
  const t = new Date(Date.now() + 30 * 60000);
  inputReturn.value =
    String(t.getHours()).padStart(2, '0') + ':' +
    String(t.getMinutes()).padStart(2, '0');
  validate();
})();

/* ═══ ② 확인 → 안내 화면 표시 ═══ */
btnConfirm.addEventListener('click', () => {
  const schedule = inputSchedule.value.trim();
  const [hh, mm] = inputReturn.value.split(':').map(Number);

  /* 복귀 시각 계산: 이미 지난 시간이면 다음 날로 간주 */
  returnDate = new Date();
  returnDate.setHours(hh, mm, 0, 0);
  if (returnDate <= new Date()) returnDate.setDate(returnDate.getDate() + 1);

  /* 화면 채우기 */
  dSchedule.textContent = schedule;
  dReturn.innerHTML =
    '🕒 <b>' + inputReturn.value + '</b>에 돌아옵니다' +
    (isTomorrow(returnDate) ? ' <small>(내일)</small>' : '');
  dMessage.textContent = inputMessage.value.trim();

  setupScreen.classList.add('hidden');
  displayScreen.classList.remove('hidden');

  startTimer();
  requestWakeLock();
  requestFullscreen();
});

function isTomorrow(d) {
  const now = new Date();
  return d.getDate() !== now.getDate() ||
         d.getMonth() !== now.getMonth();
}

/* ═══ 타이머: 현재 시각 + 카운트다운 (1초마다) ═══ */
function startTimer() {
  tick();
  timerId = setInterval(tick, 1000);
}

function tick() {
  const now = new Date();

  /* 좌상단 현재 시각 */
  nowClock.textContent =
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');

  /* 카운트다운 */
  let diff = Math.floor((returnDate - now) / 1000);

  if (diff <= 0) {
    dCountdown.textContent = '곧 돌아옵니다!';
    dCountdown.classList.add('soon');
    dCountdownLabel.textContent = '예정 시간이 지났습니다';
    return;
  }

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  dCountdown.textContent =
    String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');

  /* 5분 이하 남으면 맥동 강조 */
  dCountdown.classList.toggle('soon', diff <= 300);
  dCountdownLabel.textContent = '남은 시간';
}

/* ═══ 종료: 안내 화면 두 번 탭 ═══ */
displayScreen.addEventListener('dblclick', exitDisplay);

/* 모바일 더블탭 (dblclick 미지원 브라우저 대비) */
let lastTap = 0;
displayScreen.addEventListener('touchend', () => {
  const now = Date.now();
  if (now - lastTap < 350) exitDisplay();
  lastTap = now;
});

function exitDisplay() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  releaseWakeLock();
  exitFullscreen();
  displayScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
  dCountdown.classList.remove('soon');
}

/* ═══ 화면 꺼짐 방지 (Wake Lock API) ═══ */
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (e) { /* 미지원/거부 시 무시 — 기능엔 지장 없음 */ }
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

/* 탭 전환 후 복귀 시 Wake Lock 재획득 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' &&
      !displayScreen.classList.contains('hidden')) {
    requestWakeLock();
  }
});

/* ═══ 전체 화면 ═══ */
function requestFullscreen() {
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen;
  if (fn) fn.call(el).catch(() => {});
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}
