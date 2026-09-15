// ⚖️ BMI 계산기
(function () {
  'use strict';

  // ===== 계산 로직 (테스트 가능하도록 분리) =====
  const BMI = {
    // BMI = 몸무게(kg) / 키(m)²
    calc(heightCm, weightKg) {
      const m = heightCm / 100;
      return weightKg / (m * m);
    },
    // 표준체중: 남 = 키(m)²×22, 여 = 키(m)²×21
    stdWeight(heightCm, gender) {
      const m = heightCm / 100;
      const k = gender === 'male' ? 22 : 21;
      return m * m * k;
    },
    // 대한비만학회(아시아·태평양) 기준
    category(bmi) {
      if (bmi < 18.5) return { name: '저체중', color: '#60a5fa' };
      if (bmi < 23)   return { name: '정상',   color: '#34d399' };
      if (bmi < 25)   return { name: '과체중', color: '#fbbf24' };
      if (bmi < 30)   return { name: '비만',   color: '#fb923c' };
      return { name: '고도비만', color: '#f87171' };
    },
    // 게이지 위치(%) — 세그먼트 구간별 선형 매핑
    // 저체중(15~18.5)→0~20% | 정상(18.5~23)→20~44% | 과체중(23~25)→44~60%
    // 비만(25~30)→60~84% | 고도비만(30~35)→84~100%
    gaugePos(bmi) {
      const b = Math.min(35, Math.max(15, bmi));
      if (b < 18.5) return ((b - 15) / 3.5) * 20;
      if (b < 23)   return 20 + ((b - 18.5) / 4.5) * 24;
      if (b < 25)   return 44 + ((b - 23) / 2) * 16;
      if (b < 30)   return 60 + ((b - 25) / 5) * 24;
      return 84 + ((b - 30) / 5) * 16;
    },
    // 목표까지 차이 (양수 = 증량 필요, 음수 = 감량 필요)
    diff(targetKg, currentKg) {
      return targetKg - currentKg;
    },
  };

  // Node 단위 테스트용 export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BMI;
    return;
  }

  // ===== DOM =====
  const $ = (id) => document.getElementById(id);
  const chipsBox = $('genderChips');
  const heightInput = $('heightInput');
  const weightInput = $('weightInput');
  const calcBtn = $('calcBtn');

  let gender = null;

  // 성별 칩
  chipsBox.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    gender = chip.dataset.gender;
    chipsBox.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    if (navigator.vibrate) navigator.vibrate(10);
    validate();
  });

  // 입력 검증
  function validate() {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    const ok = gender && h >= 100 && h <= 250 && w >= 20 && w <= 300;
    calcBtn.disabled = !ok;
    calcBtn.textContent = ok ? 'BMI 계산하기 ⚖️' : '정보를 모두 입력하세요';
  }
  heightInput.addEventListener('input', validate);
  weightInput.addEventListener('input', validate);

  // 숫자 카운트업
  function countUp(el, to, decimals, suffix) {
    const dur = 700;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (to * eased).toFixed(decimals) + (suffix || '');
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // 목표 카드 렌더
  function renderTarget(wEl, dEl, targetKg, currentKg) {
    wEl.textContent = targetKg.toFixed(1) + ' kg';
    const diff = BMI.diff(targetKg, currentKg);
    dEl.classList.remove('diff-lose', 'diff-gain', 'diff-ok');
    if (Math.abs(diff) < 0.05) {
      dEl.textContent = '✅ 달성!';
      dEl.classList.add('diff-ok');
    } else if (diff < 0) {
      dEl.textContent = '▼ ' + Math.abs(diff).toFixed(1) + ' kg 감량';
      dEl.classList.add('diff-lose');
    } else {
      dEl.textContent = '▲ ' + diff.toFixed(1) + ' kg 증량';
      dEl.classList.add('diff-gain');
    }
  }

  // 계산 실행
  calcBtn.addEventListener('click', () => {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (!gender || !h || !w) return;

    const bmi = BMI.calc(h, w);
    const std = BMI.stdWeight(h, gender);
    const cat = BMI.category(bmi);

    // 결과 표시
    $('resultSection').classList.remove('hidden');
    countUp($('bmiValue'), bmi, 1);

    const catEl = $('bmiCategory');
    catEl.textContent = cat.name;
    catEl.style.background = cat.color;

    // 게이지 마커
    requestAnimationFrame(() => {
      $('gaugeMarker').style.left = BMI.gaugePos(bmi).toFixed(1) + '%';
    });

    $('stdInfo').textContent =
      '표준체중: ' + std.toFixed(1) + ' kg (' + (gender === 'male' ? '남성 ×22' : '여성 ×21') + ' 기준)';

    // 90 / 100 / 110% 목표
    renderTarget($('w90'),  $('d90'),  std * 0.9, w);
    renderTarget($('w100'), $('d100'), std,       w);
    renderTarget($('w110'), $('d110'), std * 1.1, w);

    if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    $('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
