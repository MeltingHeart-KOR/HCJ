/* ===== 모바일 청첩장 ===== */
'use strict';

/* ─────────────────────────────────────────────
   ★ 여기만 수정하면 됩니다 (설정)
   ───────────────────────────────────────────── */
const CONFIG = {
  // 결혼식 일시 (KST). 문구.txt 기준: 2099.12.26.(토) 오후 12시
  weddingDate: '2099-12-26T12:00:00+09:00',

  // 📞 실제 전화번호로 바꿔주세요!
  groomPhone: '010-0000-0000',
  bridePhone: '010-0000-0000',

  // 계좌번호 (복사 버튼에 사용)
  groomAccount: '샤드은행 100-0000-00000 (예금주 파르벤)',
  groomAccountNum: '100-0000-00000',
  brideAccount: '크레딧은행 100-0000-0000 (예금주 페르시카)',
  brideAccountNum: '100-0000-0000',
};

/* ───────── 순수 함수 (테스트 대상) ───────── */

// 남은 시간 → {days, hours, mins, secs, past}
function calcCountdown(targetMs, nowMs) {
  let diff = targetMs - nowMs;
  const past = diff <= 0;
  if (past) diff = 0;
  const secs = Math.floor(diff / 1000) % 60;
  const mins = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);
  return { days, hours, mins, secs, past };
}

// D-day 라벨: 날짜(자정 기준) 차이로 계산 — D-3, D-DAY, 종료
function ddayLabel(targetMs, nowMs, tzOffsetMin) {
  // tzOffsetMin: KST = -540 (Date#getTimezoneOffset 형식)
  const dayOf = (ms) => Math.floor((ms - tzOffsetMin * 60000) / 86400000);
  const d = dayOf(targetMs) - dayOf(nowMs);
  if (d > 0) return 'D-' + d;
  if (d === 0) return 'D-DAY';
  return 'D+' + (-d);
}

function two(n) { return String(n).padStart(2, '0'); }

/* Node 단위 테스트용 내보내기 (브라우저에선 무시) */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcCountdown, ddayLabel, two };
}

/* ───────── 브라우저 전용 ───────── */
if (typeof document !== 'undefined') {

  const $ = (id) => document.getElementById(id);

  /* 1) 연락 버튼 — tel: 링크 연결 */
  $('callGroom').href = 'tel:' + CONFIG.groomPhone.replace(/[^0-9+]/g, '');
  $('callBride').href = 'tel:' + CONFIG.bridePhone.replace(/[^0-9+]/g, '');

  /* 2) 계좌번호 복사 */
  const toast = $('toast');
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  async function copyText(text, okMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // http 접속(사설망) 폴백
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(okMsg);
    } catch {
      showToast('복사에 실패했어요. 길게 눌러 복사해주세요.');
    }
  }

  $('copyGroom').addEventListener('click', () =>
    copyText(CONFIG.groomAccountNum, '신랑측 계좌번호가 복사되었습니다 💛'));
  $('copyBride').addEventListener('click', () =>
    copyText(CONFIG.brideAccountNum, '신부측 계좌번호가 복사되었습니다 💗'));

  /* 3) 사진 없을 때 플레이스홀더 */
  document.querySelectorAll('img[data-ph]').forEach((img) => {
    img.addEventListener('error', () => {
      const box = document.createElement('div');
      box.className = 'ph-box';
      box.innerHTML =
        '<span class="ph-ico">📷</span>' +
        '<span>사진을 넣어주세요</span>' +
        '<code>' + img.dataset.ph + '</code>';
      img.replaceWith(box);
    });
  });

  /* 4) 실시간 카운트다운 */
  const target = new Date(CONFIG.weddingDate).getTime();
  const KST_OFFSET = -540; // KST = UTC+9

  const el = {
    dday: $('dday'),
    d: $('cdDays'), h: $('cdHours'), m: $('cdMins'), s: $('cdSecs'),
    msg: $('countMsg'),
  };
  const prev = { d: null, h: null, m: null, s: null };

  function setNum(key, text) {
    if (prev[key] === text) return;
    prev[key] = text;
    el[key].textContent = text;
    el[key].classList.remove('tick');
    void el[key].offsetWidth; // 애니메이션 재시작
    el[key].classList.add('tick');
  }

  function render() {
    const now = Date.now();
    const c = calcCountdown(target, now);

    setNum('d', String(c.days));
    setNum('h', two(c.hours));
    setNum('m', two(c.mins));
    setNum('s', two(c.secs));

    const label = ddayLabel(target, now, KST_OFFSET);
    el.dday.textContent = label;
    el.dday.classList.toggle('today', label === 'D-DAY');

    if (c.past) {
      el.msg.textContent = '저희 두 사람, 부부가 되었습니다. 감사합니다 💐';
    }
  }

  render();
  setInterval(render, 1000);

  /* 5) 스크롤 등장 애니메이션 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
}
