/* ═══════════════════════════════════════════
   글자수 세기 — 핵심 로직
   규칙: 한글·전각 문자 = 2byte, 영문·숫자·기호·공백 = 1byte
   ═══════════════════════════════════════════ */
'use strict';

const $ = (id) => document.getElementById(id);

const input = $('textInput');
const toast = $('toast');

/* ─── byte 계산 (EUC-KR 방식) ───
   ASCII(U+0000~U+007F) = 1byte, 그 외(한글·한자·전각 등) = 2byte */
function charBytes(ch) {
  return ch.codePointAt(0) <= 0x7f ? 1 : 2;
}

function countBytes(str) {
  let bytes = 0;
  for (const ch of str) bytes += charBytes(ch);
  return bytes;
}

/* ─── 한글 판별 (완성형 + 자모) ─── */
const KOREAN_RE = /[\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FF]/;

/* ─── 숫자 포맷 ─── */
const fmt = (n) => n.toLocaleString('ko-KR');

/* ─── 통계 계산 & 렌더 ─── */
function update() {
  const text = input.value;

  let chars = 0, bytes = 0, korean = 0, spaces = 0;
  let charsNoSpace = 0, bytesNoSpace = 0;

  for (const ch of text) {
    const b = charBytes(ch);
    chars++;
    bytes += b;
    if (/\s/.test(ch)) {
      spaces++;
    } else {
      charsNoSpace++;
      bytesNoSpace += b;
    }
    if (KOREAN_RE.test(ch)) korean++;
  }

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines = text === '' ? 0 : text.split('\n').length;

  setStat('statChars', fmt(chars));
  setStat('statBytes', fmt(bytes));
  setStat('statCharsNoSpace', fmt(charsNoSpace));
  setStat('statBytesNoSpace', fmt(bytesNoSpace));
  setStat('statKorean', fmt(korean));
  setStat('statWords', fmt(words));
  setStat('statLines', fmt(lines));
  setStat('statSpaces', fmt(spaces));

  updateLimit(90, bytes);
  updateLimit(2000, bytes);
  updateLimit(4000, bytes);
}

function setStat(id, value) {
  const el = $(id);
  if (el.textContent !== value) {
    el.textContent = value;
    const card = el.closest('.stat');
    if (card) {
      card.classList.remove('bump');
      void card.offsetWidth; // 리플로우로 애니메이션 재시작
      card.classList.add('bump');
    }
  }
}

/* ─── 제한 게이지 ─── */
function updateLimit(limit, bytes) {
  const val = $('lv' + limit);
  const fill = $('lf' + limit);
  const pct = Math.min(100, (bytes / limit) * 100);

  val.textContent = fmt(bytes) + ' / ' + fmt(limit);
  fill.style.width = pct + '%';

  val.classList.remove('ok', 'warn', 'over');
  fill.classList.remove('warn', 'over');

  if (bytes > limit) {
    val.classList.add('over'); fill.classList.add('over');
    val.textContent += ' (초과!)';
  } else if (bytes > limit * 0.9) {
    val.classList.add('warn'); fill.classList.add('warn');
  } else if (bytes > 0) {
    val.classList.add('ok');
  }
}

/* ─── 토스트 ─── */
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

/* ─── 버튼 ─── */
$('clearBtn').addEventListener('click', () => {
  input.value = '';
  update();
  input.focus();
  showToast('🗑 지웠습니다');
});

$('copyBtn').addEventListener('click', async () => {
  if (!input.value) return showToast('복사할 내용이 없습니다');
  try {
    await navigator.clipboard.writeText(input.value);
    showToast('📄 복사 완료!');
  } catch {
    input.select();
    document.execCommand('copy');
    showToast('📄 복사 완료!');
  }
});

$('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return showToast('클립보드가 비어 있습니다');
    input.value += text;
    update();
    showToast('📋 붙여넣기 완료!');
  } catch {
    showToast('브라우저 설정에서 클립보드 권한을 허용해 주세요');
    input.focus();
  }
});

/* ─── 실시간 반영 ─── */
input.addEventListener('input', update);
update();
