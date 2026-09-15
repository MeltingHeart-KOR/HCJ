/* ============================================
   Smart QR — 나나컴퍼니
   모든 처리는 브라우저에서 실행 (서버 불필요)
   ============================================ */
(function () {
  "use strict";

  const form      = document.getElementById("urlForm");
  const input     = document.getElementById("urlInput");
  const result    = document.getElementById("result");
  const resultUrl = document.getElementById("resultUrl");
  const qrCanvas  = document.getElementById("qrCanvas");
  const qrWrap    = document.getElementById("qrWrap");
  const qrHidden  = document.getElementById("qrHidden");
  const errorMsg  = document.getElementById("errorMsg");
  const logoImg   = document.getElementById("logoImg");

  // 로고 파일이 없으면 텍스트 로고로 대체
  logoImg.addEventListener("error", function () {
    logoImg.hidden = true;
    document.getElementById("logoFallback").hidden = false;
  });

  /** URL 정규화: 스킴이 없으면 https:// 를 붙임 */
  function normalizeUrl(raw) {
    const t = raw.trim();
    if (!t) return null;
    if (/\s/.test(t)) return null;                    // 공백 포함 → 잘못된 URL
    if (/^https?:\/\//i.test(t)) return t;
    if (/^[\w-]+(\.[\w-]+)+/.test(t)) return "https://" + t;
    return null;
  }

  function showError(msg) {
    errorMsg.textContent = "⚠️ " + msg;
    errorMsg.hidden = false;
  }
  function clearError() {
    errorMsg.hidden = true;
  }

  /** QR 생성 → 여백 포함 캔버스에 합성 */
  function generateQR(url) {
    // 1) 라이브러리로 숨김 영역에 QR 렌더링
    qrHidden.innerHTML = "";
    new QRCode(qrHidden, {
      text: url,
      width: 640,
      height: 640,
      colorDark: "#46232b",   // 로고 톤의 다크 브라운
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    // 렌더링 결과(canvas 또는 img) 가져오기
    const srcCanvas = qrHidden.querySelector("canvas");
    const srcImg    = qrHidden.querySelector("img");

    // 2) 흰 배경 + 콰이어트 존(여백)을 넣어 최종 캔버스 합성
    const SIZE = 800, PAD = 80;
    qrCanvas.width = SIZE;
    qrCanvas.height = SIZE;
    const ctx = qrCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    const drawSource = function (source) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(source, PAD, PAD, SIZE - PAD * 2, SIZE - PAD * 2);
    };

    if (srcCanvas) {
      drawSource(srcCanvas);
    } else if (srcImg) {
      // img 렌더링 브라우저 대응: 로드 완료 후 그리기
      if (srcImg.complete) drawSource(srcImg);
      else srcImg.onload = function () { drawSource(srcImg); };
    }
  }

  /** 파일명으로 쓸 수 있게 도메인 추출 */
  function fileNameFor(url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return "smart-qr_" + host.replace(/[^\w.-]/g, "_") + ".jpg";
    } catch (e) {
      return "smart-qr.jpg";
    }
  }

  let currentUrl = "";

  // ─── 폼 제출: QR 생성 ───
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    const url = normalizeUrl(input.value);
    if (!url) {
      showError("올바른 URL을 입력해 주세요. 예: https://example.com");
      return;
    }

    if (typeof QRCode === "undefined") {
      showError("QR 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      return;
    }

    currentUrl = url;
    generateQR(url);
    resultUrl.textContent = url;
    result.hidden = false;

    // 입력창을 하단으로 내리는 상태 전환
    document.body.classList.add("generated");
    input.blur();
  });

  // ─── QR 클릭: JPG 다운로드 ───
  qrWrap.addEventListener("click", function () {
    if (!currentUrl) return;
    const a = document.createElement("a");
    a.download = fileNameFor(currentUrl);
    a.href = qrCanvas.toDataURL("image/jpeg", 0.95); // 흰 배경 위 합성이라 JPG 안전
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
})();
