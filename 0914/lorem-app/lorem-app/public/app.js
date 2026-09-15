/* ═══════════════════════════════════════════
   ✒️ Lorem Ipsum 생성기
   - 마스터 텍스트(5000자)를 한 번 생성해두고
     슬라이더는 그 일부를 잘라 보여주는 방식
     → 슬라이더를 움직여도 앞부분 내용이 바뀌지 않아 안정적
   ═══════════════════════════════════════════ */

const MIN_LEN = 10;
const MAX_LEN = 5000;
const DEFAULT_LEN = 150;

/* ── 고전 Lorem Ipsum 단어 은행 ── */
const WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
  'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore',
  'magna','aliqua','enim','ad','minim','veniam','quis','nostrud',
  'exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo',
  'consequat','duis','aute','irure','in','reprehenderit','voluptate',
  'velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint',
  'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia',
  'deserunt','mollit','anim','id','est','laborum','at','vero','eos',
  'accusamus','iusto','odio','dignissimos','ducimus','blanditiis',
  'praesentium','voluptatum','deleniti','atque','corrupti','quos',
  'quas','molestias','excepturi','obcaecati','provident','similique',
  'mollitia','animi','perferendis','doloribus','asperiores','repellat',
  'nam','libero','tempore','cum','soluta','nobis','eligendi','optio',
  'cumque','nihil','impedit','quo','minus','quod','maxime','placeat',
  'facere','possimus','omnis','voluptas','assumenda','repellendus',
  'temporibus','autem','quibusdam','officiis','debitis','rerum',
  'necessitatibus','saepe','eveniet','voluptates','repudiandae',
  'recusandae','itaque','earum','hic','tenetur','a','sapiente',
  'delectus','reiciendis','voluptatibus','maiores','alias','perspiciatis',
  'unde','iste','natus','error','accusantium','doloremque','laudantium',
  'totam','rem','aperiam','eaque','ipsa','quae','ab','illo','inventore',
  'veritatis','quasi','architecto','beatae','vitae','dicta','explicabo',
  'aspernatur','aut','odit','fugit','consequuntur','magni','dolores',
  'ratione','sequi','nesciunt','neque','porro','quisquam','dolorem',
  'adipisci','numquam','eius','modi','tempora','incidunt','magnam',
  'quaerat','minima','nostrum','exercitationem','ullam','corporis',
  'suscipit','laboriosam','aliquid','commodi','consequatur','quam'
];

/* ── 유틸 ── */
const rand = (n) => Math.floor(Math.random() * n);
const pick = () => WORDS[rand(WORDS.length)];
const cap  = (w) => w.charAt(0).toUpperCase() + w.slice(1);

/**
 * 자연스러운 문장 구조(쉼표·마침표·문단)를 갖춘
 * targetLen 이상의 Lorem Ipsum 마스터 텍스트 생성
 */
function buildMaster(targetLen) {
  // 관용적인 고정 도입부
  let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
  let sentenceWords = 8;                 // 현재 문장에 쌓인 단어 수
  let sentenceLimit = 10 + rand(8);      // 이번 문장의 목표 길이
  let sentencesInPara = 1;
  let paraLimit = 4 + rand(3);           // 문단당 문장 수

  while (text.length < targetLen + 60) { // 여유분 확보 후 슬라이스
    if (sentenceWords >= sentenceLimit) {
      // 문장 종료
      text += '.';
      sentencesInPara++;
      if (sentencesInPara >= paraLimit) {
        text += '\n\n';                  // 문단 나누기
        sentencesInPara = 0;
        paraLimit = 4 + rand(3);
      } else {
        text += ' ';
      }
      text += cap(pick());
      sentenceWords = 1;
      sentenceLimit = 8 + rand(10);
    } else if (sentenceWords > 3 && Math.random() < 0.12) {
      // 가끔 쉼표
      text += ', ' + pick();
      sentenceWords++;
    } else {
      text += ' ' + pick();
      sentenceWords++;
    }
  }
  return text;
}

/**
 * 마스터에서 정확히 n글자 잘라내기
 * - 마지막 글자가 공백/쉼표/개행이면 마침표로 치환해 마무리를 다듬음
 *   (글자 수는 정확히 n으로 유지)
 */
function sliceExact(master, n) {
  let out = master.slice(0, n);
  const last = out.charAt(n - 1);
  if (last === ' ' || last === ',' || last === '\n') {
    out = out.slice(0, n - 1) + '.';
  }
  return out;
}

const countWords = (t) => (t.trim().match(/[A-Za-z]+/g) || []).length;

/* ── DOM ── */
const slider    = document.getElementById('lenSlider');
const lenValue  = document.getElementById('lenValue');
const loremText = document.getElementById('loremText');
const statChars = document.getElementById('statChars');
const statWords = document.getElementById('statWords');
const copyBtn   = document.getElementById('copyBtn');
const regenBtn  = document.getElementById('regenBtn');
const presetsEl = document.getElementById('presets');
const toast     = document.getElementById('toast');

/* ── 상태 ── */
let master = buildMaster(MAX_LEN);       // 5000자 이상 마스터 텍스트

/* ── 렌더링 ── */
function render() {
  const n = parseInt(slider.value, 10);
  const text = sliceExact(master, n);

  loremText.textContent = text;
  lenValue.textContent  = n.toLocaleString();
  statChars.textContent = `${text.length.toLocaleString()}자`;
  statWords.textContent = `${countWords(text).toLocaleString()} 단어`;

  // 슬라이더 채움(webkit 트랙 그라데이션)
  const pct = ((n - MIN_LEN) / (MAX_LEN - MIN_LEN)) * 100;
  slider.style.setProperty('--fill', pct + '%');

  // 숫자 bump 애니메이션
  lenValue.classList.remove('bump');
  void lenValue.offsetWidth;
  lenValue.classList.add('bump');

  // 프리셋 활성 표시
  presetsEl.querySelectorAll('.preset-btn').forEach((b) => {
    b.classList.toggle('active', parseInt(b.dataset.len, 10) === n);
  });
}

/* ── 이벤트 ── */
slider.addEventListener('input', render);

presetsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.preset-btn');
  if (!btn) return;
  slider.value = btn.dataset.len;
  render();
  if (navigator.vibrate) navigator.vibrate(8);
});

regenBtn.addEventListener('click', () => {
  master = buildMaster(MAX_LEN);
  render();
  showToast('🎲 새로운 텍스트를 생성했어요');
});

copyBtn.addEventListener('click', async () => {
  const text = loremText.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 복사되었습니다!');
  } catch {
    // 클립보드 API 실패 시 폴백
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('📋 복사되었습니다!');
  }
});

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

/* ── 초기화: 기본 150자 ── */
slider.value = DEFAULT_LEN;
render();
