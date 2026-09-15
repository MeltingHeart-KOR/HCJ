/* ============================================================
   TextRank 요약 엔진 (외부 라이브러리 없음)
   - 문장 분리 → 토큰화(한국어 조사 제거) → 유사도 그래프
   - PageRank 반복 계산 → 상위 k문장을 원문 순서로 반환
   - 브라우저(window)와 Node(module.exports) 양쪽에서 동작 → 단위 테스트 가능
   ============================================================ */
(function (root) {
  'use strict';

  // ---------- 1) 문장 분리 ----------
  function splitSentences(text) {
    if (!text) return [];
    const cleaned = String(text)
      .replace(/[\u00a0\u3000]/g, ' ')
      .replace(/\r\n?/g, '\n');

    // 줄바꿈은 공백으로 합치되, 빈 줄(문단 경계)은 마침표 역할
    const flat = cleaned
      .split(/\n{2,}/)
      .map(p => p.replace(/\n+/g, ' ').trim())
      .filter(Boolean)
      .join(' ¶ ');

    // 종결부호 뒤에서 분리 (약어 보호: 소수점/영문 약어 최소 방어)
    const parts = flat
      .split(/(?<=[.!?。！？…])\s+|\s*¶\s*/)
      .map(s => s.trim())
      .filter(s => s.length >= 10);           // 너무 짧은 조각(머리글 번호 등) 제외

    return parts;
  }

  // ---------- 2) 토큰화 ----------
  const JOSA = /(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|까지|부터|보다|처럼|이며|이고|이다|입니다|한다|했다|하는|하고)$/;
  const STOP = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'are', 'was', 'were',
    'for', 'on', 'with', 'as', 'by', 'at', 'be', 'this', 'that', 'it', 'from',
    '그리고', '그러나', '하지만', '또한', '및', '등', '수', '것', '있다', '없다',
  ]);

  function tokenize(sentence) {
    const raw = sentence.toLowerCase().match(/[a-z0-9]+|[가-힣]+|[\u4e00-\u9fff]+/g) || [];
    const out = [];
    for (let t of raw) {
      if (/[가-힣]/.test(t) && t.length >= 2) t = t.replace(JOSA, '');
      if (t.length < 1 || STOP.has(t)) continue;
      out.push(t);
    }
    return out;
  }

  // ---------- 3) 문장 유사도 (TextRank 원 논문 공식) ----------
  // sim = |공통 단어| / (log|S1| + log|S2|)
  function similarity(tokensA, tokensB) {
    if (tokensA.length < 2 || tokensB.length < 2) return 0;
    const setB = new Set(tokensB);
    const seen = new Set();
    let common = 0;
    for (const t of tokensA) {
      if (setB.has(t) && !seen.has(t)) { common++; seen.add(t); }
    }
    if (common === 0) return 0;
    const denom = Math.log(tokensA.length) + Math.log(tokensB.length);
    return denom > 0 ? common / denom : 0;
  }

  // ---------- 4) PageRank 반복 ----------
  function rankSentences(sentences, opts) {
    const { damping = 0.85, maxIter = 60, tol = 1e-5 } = opts || {};
    const n = sentences.length;
    const scores = new Array(n).fill(1 / Math.max(n, 1));
    if (n <= 1) return scores;

    const toks = sentences.map(tokenize);

    // 가중치 그래프 (대칭)
    const W = Array.from({ length: n }, () => new Array(n).fill(0));
    const rowSum = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = similarity(toks[i], toks[j]);
        if (s > 0) { W[i][j] = s; W[j][i] = s; rowSum[i] += s; rowSum[j] += s; }
      }
    }

    let cur = scores.slice();
    for (let it = 0; it < maxIter; it++) {
      const next = new Array(n).fill((1 - damping) / n);
      for (let j = 0; j < n; j++) {
        if (rowSum[j] === 0) continue;
        const c = damping * cur[j] / rowSum[j];
        const row = W[j];
        for (let i = 0; i < n; i++) if (row[i] > 0) next[i] += c * row[i];
      }
      let diff = 0;
      for (let i = 0; i < n; i++) diff += Math.abs(next[i] - cur[i]);
      cur = next;
      if (diff < tol) break;
    }
    return cur;
  }

  // ---------- 5) 요약 ----------
  // 반환: { sentences, scores, picked }  (picked = 원문 순서의 인덱스 배열)
  function summarize(text, k) {
    const sentences = splitSentences(text);
    const n = sentences.length;
    if (n === 0) return { sentences: [], scores: [], picked: [] };

    const scores = rankSentences(sentences);
    const kk = Math.max(1, Math.min(k || 3, n));

    const picked = sentences
      .map((_, i) => i)
      .sort((a, b) => scores[b] - scores[a])   // 점수 내림차순
      .slice(0, kk)
      .sort((a, b) => a - b);                  // 원문 순서로 재정렬

    return { sentences, scores, picked };
  }

  const api = { splitSentences, tokenize, similarity, rankSentences, summarize };

  if (typeof module !== 'undefined' && module.exports) module.exports = api; // Node (테스트)
  else root.TextRank = api;                                                  // 브라우저
})(typeof window !== 'undefined' ? window : globalThis);
