/* 🎯 이름 뽑기 대포 — 물리 엔진 + UI
   물리 코어(makeWorld/stepWorld)는 순수 함수로 분리 → Node 헤드리스 테스트 가능 */
'use strict';

/* ================= 물리 코어 ================= */
const W = 480, H = 800;          // 보드 가상 좌표
const R = 11;                    // 구슬 반지름
const GRAV = 1000;               // 중력 px/s²
const FIRE_INTERVAL = 0.55;      // 대포 발사 간격
const CANNON = { x: 42, y: 80 };
const SENSOR_Y = H - 45;         // 이 선을 넘으면 '떨어짐'

// 못(peg) 배치 — 지그재그 7줄
function buildPegs() {
  const pegs = [];
  for (let row = 0; row < 7; row++) {
    const y = 180 + row * 55;
    const offset = row % 2 === 0 ? 60 : 96;
    for (let x = offset; x <= 470; x += 72) pegs.push({ x, y, r: 6 });
  }
  // 풍차 축(구슬이 축 위에 얹히지 않도록 못 취급)
  pegs.push({ x: 140, y: 565, r: 7 });
  pegs.push({ x: 340, y: 565, r: 7 });
  return pegs;
}

// 회전 풍차: 중심, 반길이, 각속도(rad/s)
function buildMills() {
  return [
    { cx: 140, cy: 565, half: 62, th: 5, w: 2.4, ang: 0 },
    { cx: 340, cy: 565, half: 62, th: 5, w: -2.4, ang: Math.PI / 2 },
  ];
}

// 깔때기(고정 벽 선분)
const FUNNEL = [
  { ax: 0, ay: 635, bx: 205, by: 725, th: 6 },
  { ax: 480, ay: 635, bx: 275, by: 725, th: 6 },
];

function makeWorld(names) {
  const marbles = names.map((name, i) => ({
    name,
    hue: (i * 137) % 360,
    x: CANNON.x, y: CANNON.y, vx: 0, vy: 0,
    active: false, done: false, slow: 0,
  }));
  // 발사 순서 셔플
  const queue = marbles.slice();
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return {
    t: 0,
    fireTimer: 0.6,
    queue,
    marbles,
    pegs: buildPegs(),
    mills: buildMills(),
    finished: [],   // 떨어진 순서
    events: [],     // 렌더러용 {type, x, y, hue}
  };
}

function fireNext(world) {
  const m = world.queue.shift();
  if (!m) return;
  const ang = -0.3 + Math.random() * 0.45;       // 살짝 위 ~ 살짝 아래
  const speed = 380 + Math.random() * 260;
  m.x = CANNON.x; m.y = CANNON.y;
  m.vx = Math.cos(ang) * speed;
  m.vy = Math.sin(ang) * speed;
  m.active = true;
  world.events.push({ type: 'fire', x: CANNON.x, y: CANNON.y, hue: m.hue });
}

// 원 vs 선분(회전 포함) 충돌
function collideSegment(m, ax, ay, bx, by, th, surfW, cx, cy) {
  const abx = bx - ax, aby = by - ay;
  const len2 = abx * abx + aby * aby || 1;
  let t = ((m.x - ax) * abx + (m.y - ay) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + abx * t, py = ay + aby * t;
  let dx = m.x - px, dy = m.y - py;
  let dist = Math.hypot(dx, dy);
  const minDist = R + th;
  if (dist >= minDist) return;
  if (dist < 0.0001) { dx = 0; dy = -1; dist = 1; }
  const nx = dx / dist, ny = dy / dist;
  m.x = px + nx * minDist;
  m.y = py + ny * minDist;
  // 회전 표면 속도 (풍차): v = w × r
  let sx = 0, sy = 0;
  if (surfW) {
    const rx = px - cx, ry = py - cy;
    sx = -surfW * ry; sy = surfW * rx;
  }
  const rvx = m.vx - sx, rvy = m.vy - sy;
  const vn = rvx * nx + rvy * ny;
  if (vn < 0) {
    const e = 0.5;
    m.vx = rvx - (1 + e) * vn * nx + sx;
    m.vy = rvy - (1 + e) * vn * ny + sy;
  }
}

function stepWorld(world, dt) {
  world.t += dt;

  // 대포 발사
  if (world.queue.length > 0) {
    world.fireTimer -= dt;
    if (world.fireTimer <= 0) {
      fireNext(world);
      world.fireTimer = FIRE_INTERVAL;
    }
  }

  // 풍차 회전
  for (const mill of world.mills) mill.ang += mill.w * dt;

  const active = world.marbles.filter((m) => m.active);

  for (const m of active) {
    m.vy += GRAV * dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // 벽 / 천장
    if (m.x < R) { m.x = R; m.vx = Math.abs(m.vx) * 0.7; }
    if (m.x > W - R) { m.x = W - R; m.vx = -Math.abs(m.vx) * 0.7; }
    if (m.y < R) { m.y = R; m.vy = Math.abs(m.vy) * 0.6; }

    // 못
    for (const p of world.pegs) {
      const dx = m.x - p.x, dy = m.y - p.y;
      const dist = Math.hypot(dx, dy);
      const minD = R + p.r;
      if (dist < minD && dist > 0.0001) {
        const nx = dx / dist, ny = dy / dist;
        m.x = p.x + nx * minD;
        m.y = p.y + ny * minD;
        const vn = m.vx * nx + m.vy * ny;
        if (vn < 0) {
          const e = 0.55;
          m.vx -= (1 + e) * vn * nx;
          m.vy -= (1 + e) * vn * ny;
          // 접선 방향 랜덤 흔들림 → 예측 불가한 재미
          const jitter = Math.random() * 60 - 30;
          m.vx += -ny * jitter;
          m.vy += nx * jitter;
        }
      }
    }

    // 풍차 날개
    for (const mill of world.mills) {
      const c = Math.cos(mill.ang), s = Math.sin(mill.ang);
      collideSegment(
        m,
        mill.cx - c * mill.half, mill.cy - s * mill.half,
        mill.cx + c * mill.half, mill.cy + s * mill.half,
        mill.th, mill.w, mill.cx, mill.cy
      );
    }

    // 깔때기
    for (const f of FUNNEL) collideSegment(m, f.ax, f.ay, f.bx, f.by, f.th, 0, 0, 0);

    // 도착 감지
    if (m.y > SENSOR_Y) {
      m.active = false;
      m.done = true;
      world.finished.push({ name: m.name, hue: m.hue, t: world.t });
      world.events.push({ type: 'finish', x: m.x, y: SENSOR_Y, hue: m.hue });
      continue;
    }

    // 멈춤 방지 (구석에 끼면 툭 쳐주기)
    const sp = Math.hypot(m.vx, m.vy);
    if (sp < 25) {
      m.slow += dt;
      if (m.slow > 1.8) {
        m.vy -= 200 + Math.random() * 120;
        m.vx += (Math.random() - 0.5) * 320;
        m.slow = 0;
      }
    } else m.slow = 0;
  }

  // 구슬끼리 충돌
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (!a.active || !b.active) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist < R * 2 && dist > 0.0001) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = (R * 2 - dist) / 2;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;
        const rvx = a.vx - b.vx, rvy = a.vy - b.vy;
        const vn = rvx * nx + rvy * ny;
        if (vn > 0) {
          const jimp = ((1 + 0.85) / 2) * vn;
          a.vx -= jimp * nx; a.vy -= jimp * ny;
          b.vx += jimp * nx; b.vy += jimp * ny;
        }
      }
    }
  }
}

// Node 헤드리스 테스트용 export (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { makeWorld, stepWorld, W, H };
}

/* ================= 브라우저 UI ================= */
if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id);
  const setupScreen = $('setupScreen');
  const gameScreen = $('gameScreen');
  const nameInput = $('nameInput');
  const nameCount = $('nameCount');
  const startBtn = $('startBtn');
  const sampleBtn = $('sampleBtn');
  const clearBtn = $('clearBtn');
  const quitBtn = $('quitBtn');
  const remainChip = $('remainChip');
  const ffBtn = $('ffBtn');
  const ticker = $('ticker');
  const winnerOverlay = $('winnerOverlay');
  const winnerName = $('winnerName');
  const againBtn = $('againBtn');
  const editBtn = $('editBtn');
  const canvas = $('board');
  const ctx = canvas.getContext('2d');
  const fx = $('fx');
  const fxCtx = fx.getContext('2d');

  const SAMPLES = ['철수', '영희', '민준', '서연', '지훈', '하은', '도윤', '수아'];

  let world = null;
  let names = [];
  let speed = 1;
  let running = false;
  let particles = [];
  let confetti = [];
  let confettiOn = false;
  let lastTime = 0;
  let winnerShown = false;

  /* ----- 이름 파싱 ----- */
  function parseNames(text) {
    const raw = text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const seen = {};
    return raw.slice(0, 40).map((n) => {
      seen[n] = (seen[n] || 0) + 1;
      return seen[n] > 1 ? `${n}(${seen[n]})` : n;
    });
  }

  function refreshCount() {
    const list = parseNames(nameInput.value);
    nameCount.textContent = list.length;
    startBtn.disabled = list.length < 2;
    startBtn.textContent = list.length < 2 ? '이름을 2명 이상 입력하세요' : `🚀 발사! (${list.length}명)`;
  }

  nameInput.addEventListener('input', refreshCount);
  sampleBtn.addEventListener('click', () => {
    nameInput.value = SAMPLES.join('\n');
    refreshCount();
  });
  clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    refreshCount();
    nameInput.focus();
  });

  /* ----- 화면 전환 ----- */
  function show(el) {
    setupScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    el.classList.add('active');
  }

  function startRace() {
    world = makeWorld(names);
    particles = [];
    ticker.innerHTML = '';
    winnerShown = false;
    speed = 1;
    ffBtn.textContent = '⏩ ×1';
    winnerOverlay.hidden = true;
    confettiOn = false;
    show(gameScreen);
    fit();
    running = true;
    lastTime = performance.now();
  }

  startBtn.addEventListener('click', () => {
    names = parseNames(nameInput.value);
    if (names.length < 2) return;
    startRace();
  });

  againBtn.addEventListener('click', startRace);
  editBtn.addEventListener('click', () => {
    running = false;
    winnerOverlay.hidden = true;
    confettiOn = false;
    show(setupScreen);
  });
  quitBtn.addEventListener('click', () => {
    if (confirm('추첨을 중단할까요?')) {
      running = false;
      show(setupScreen);
    }
  });
  ffBtn.addEventListener('click', () => {
    speed = speed === 1 ? 3 : 1;
    ffBtn.textContent = `⏩ ×${speed}`;
  });

  /* ----- 캔버스 크기 ----- */
  function fit() {
    const wrap = canvas.parentElement;
    const availW = wrap.clientWidth;
    const availH = wrap.clientHeight;
    if (availW <= 0 || availH <= 0) return;
    const scale = Math.min(availW / W, availH / H);
    const cssW = Math.floor(W * scale);
    const cssH = Math.floor(H * scale);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform((cssW * dpr) / W, 0, 0, (cssH * dpr) / H, 0, 0);

    fx.width = Math.floor(window.innerWidth * dpr);
    fx.height = Math.floor(window.innerHeight * dpr);
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', fit);

  /* ----- 파티클 / 폭죽 ----- */
  function burst(x, y, hue, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 220;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
        life: 0.7 + Math.random() * 0.5, age: 0, hue,
      });
    }
  }

  function spawnConfetti() {
    const vw = window.innerWidth;
    for (let i = 0; i < 4; i++) {
      confetti.push({
        x: Math.random() * vw, y: -20,
        vx: (Math.random() - 0.5) * 60,
        vy: 120 + Math.random() * 160,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 8,
        size: 6 + Math.random() * 7,
        hue: Math.random() * 360,
      });
    }
  }

  /* ----- 렌더링 ----- */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function draw() {
    // 배경
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141a3d');
    g.addColorStop(0.6, '#101433');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 골인 지대
    const goal = ctx.createLinearGradient(0, SENSOR_Y - 10, 0, H);
    goal.addColorStop(0, 'rgba(255,181,77,0)');
    goal.addColorStop(1, 'rgba(255,181,77,0.35)');
    ctx.fillStyle = goal;
    ctx.fillRect(0, SENSOR_Y - 10, W, H - SENSOR_Y + 10);
    ctx.fillStyle = 'rgba(255,225,170,0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 마지막 도착 = 당첨', W / 2, H - 14);

    // 깔때기
    ctx.strokeStyle = '#4a5480';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    for (const f of FUNNEL) {
      ctx.beginPath();
      ctx.moveTo(f.ax, f.ay);
      ctx.lineTo(f.bx, f.by);
      ctx.stroke();
    }

    // 못
    for (const p of world.pegs) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(150,170,255,0.12)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#8fa0d8';
      ctx.fill();
    }

    // 풍차
    for (const mill of world.mills) {
      const c = Math.cos(mill.ang), s = Math.sin(mill.ang);
      ctx.strokeStyle = '#ffb54d';
      ctx.lineWidth = mill.th * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mill.cx - c * mill.half, mill.cy - s * mill.half);
      ctx.lineTo(mill.cx + c * mill.half, mill.cy + s * mill.half);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mill.cx, mill.cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd08a';
      ctx.fill();
    }

    // 대포
    ctx.save();
    ctx.translate(CANNON.x, CANNON.y);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#39406b';
    roundRect(ctx, -6, -11, 52, 22, 8);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(CANNON.x - 4, CANNON.y + 12, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#2b3157';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CANNON.x - 4, CANNON.y + 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#565f94';
    ctx.fill();

    // 구슬
    ctx.font = 'bold 11px sans-serif';
    for (const m of world.marbles) {
      if (!m.active) continue;
      const grad = ctx.createRadialGradient(m.x - 4, m.y - 4, 2, m.x, m.y, R);
      grad.addColorStop(0, `hsl(${m.hue} 90% 78%)`);
      grad.addColorStop(1, `hsl(${m.hue} 80% 52%)`);
      ctx.beginPath();
      ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 이름표
      const tw = ctx.measureText(m.name).width;
      const lx = Math.max(4 + tw / 2 + 6, Math.min(W - tw / 2 - 10, m.x));
      const ly = Math.max(16, m.y - R - 8);
      roundRect(ctx, lx - tw / 2 - 6, ly - 11, tw + 12, 16, 8);
      ctx.fillStyle = 'rgba(5,8,22,0.62)';
      ctx.fill();
      ctx.fillStyle = `hsl(${m.hue} 85% 80%)`;
      ctx.textAlign = 'center';
      ctx.fillText(m.name, lx, ly + 1);
    }

    // 파티클
    for (const p of particles) {
      const alpha = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${p.hue} 90% 65%)`;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFx(dt) {
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!confettiOn && confetti.length === 0) return;
    if (confettiOn) spawnConfetti();
    confetti = confetti.filter((c) => c.y < window.innerHeight + 30);
    for (const c of confetti) {
      c.vy += 60 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
      fxCtx.save();
      fxCtx.translate(c.x, c.y);
      fxCtx.rotate(c.rot);
      fxCtx.fillStyle = `hsl(${c.hue} 90% 62%)`;
      fxCtx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.66);
      fxCtx.restore();
    }
  }

  /* ----- 이벤트 소비 (파티클/탈락 칩) ----- */
  function consumeEvents() {
    for (const ev of world.events) {
      if (ev.type === 'fire') {
        burst(ev.x + 40, ev.y - 4, ev.hue, 10);
        if (navigator.vibrate) navigator.vibrate(15);
      } else if (ev.type === 'finish') {
        burst(ev.x, ev.y, ev.hue, 22);
        const rank = world.finished.length;
        const total = world.marbles.length;
        const isWinner = rank === total;
        const chip = document.createElement('span');
        chip.className = 'out-chip' + (isWinner ? ' win' : '');
        chip.textContent = isWinner
          ? `🏆 ${world.finished[rank - 1].name}`
          : `❌ ${rank}. ${world.finished[rank - 1].name}`;
        ticker.appendChild(chip);
        ticker.scrollLeft = ticker.scrollWidth;
      }
    }
    world.events.length = 0;
  }

  /* ----- 메인 루프 ----- */
  function loop(now) {
    requestAnimationFrame(loop);
    const rawDt = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;
    if (!running || !world) {
      drawFx(rawDt);
      return;
    }

    // 물리 (고정 타임스텝 서브스텝)
    let remain = rawDt * speed;
    const STEP = 1 / 120;
    while (remain > 0) {
      stepWorld(world, Math.min(STEP, remain));
      remain -= STEP;
    }
    consumeEvents();

    // 파티클 갱신
    for (const p of particles) {
      p.age += rawDt;
      p.vy += 500 * rawDt;
      p.x += p.vx * rawDt;
      p.y += p.vy * rawDt;
    }
    particles = particles.filter((p) => p.age < p.life);

    remainChip.textContent =
      world.queue.length + world.marbles.filter((m) => m.active).length;

    draw();
    drawFx(rawDt);

    // 당첨자 발표
    if (!winnerShown && world.finished.length === world.marbles.length) {
      winnerShown = true;
      const winner = world.finished[world.finished.length - 1];
      setTimeout(() => {
        winnerName.textContent = winner.name;
        winnerOverlay.hidden = false;
        confettiOn = true;
        if (navigator.vibrate) navigator.vibrate([80, 60, 120]);
        setTimeout(() => (confettiOn = false), 4500);
      }, 700);
    }
  }

  refreshCount();
  fit();
  requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(loop);
  });
}
