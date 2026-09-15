/* ============================================
   Smart Image Resizer — 나나컴퍼니
   모든 처리는 브라우저 Canvas에서 수행 (서버 없음)
   ============================================ */
(function () {
  'use strict';

  // ---------- DOM ----------
  const dropzone     = document.getElementById('dropzone');
  const btnUpload    = document.getElementById('btnUpload');
  const fileInput    = document.getElementById('fileInput');
  const options      = document.getElementById('options');
  const ratioGrid    = document.getElementById('ratioGrid');
  const customInputs = document.getElementById('customInputs');
  const customW      = document.getElementById('customW');
  const customH      = document.getElementById('customH');
  const padColorGroup= document.getElementById('padColorGroup');
  const padColor     = document.getElementById('padColor');
  const colorValue   = document.getElementById('colorValue');
  const btnConvert   = document.getElementById('btnConvert');
  const fileSection  = document.getElementById('fileSection');
  const fileList     = document.getElementById('fileList');
  const fileCount    = document.getElementById('fileCount');
  const btnZip       = document.getElementById('btnZip');
  const toast        = document.getElementById('toast');
  const logoImg      = document.getElementById('logoImg');
  const logoFallback = document.getElementById('logoFallback');

  // 로고 없으면 텍스트 폴백
  logoImg.addEventListener('error', function () {
    logoImg.hidden = true;
    logoFallback.hidden = false;
  });

  // ---------- 상태 ----------
  /** @type {Array<{id:number, file:File, img:HTMLImageElement|null, blob:Blob|null, outName:string, el:object, status:string}>} */
  const items = [];
  let nextId = 1;
  let currentRatio = '1:1';
  let currentMode = 'padding';
  const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  const MAX_OUT = 2400; // 출력 긴 변 최대 px

  // ---------- 토스트 ----------
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3200);
  }

  // ---------- 업로드 ----------
  btnUpload.addEventListener('click', function (e) {
    e.stopPropagation();
    fileInput.click();
  });
  dropzone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    addFiles(fileInput.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  function addFiles(fileListObj) {
    let added = 0, rejected = 0;
    Array.prototype.forEach.call(fileListObj, function (f) {
      if (ACCEPT.indexOf(f.type) === -1) { rejected++; return; }
      createItem(f);
      added++;
    });
    if (rejected > 0) showToast('🚫 이미지 파일만 업로드할 수 있어요 (' + rejected + '개 제외)');
    if (added > 0) {
      options.hidden = false;
      fileSection.hidden = false;
      updateCount();
    }
  }

  // ---------- 파일 카드 생성 ----------
  function createItem(file) {
    const id = nextId++;

    const li = document.createElement('li');
    li.className = 'file-item';

    const thumb = document.createElement('img');
    thumb.className = 'thumb';
    thumb.alt = file.name + ' 썸네일';

    const info = document.createElement('div');
    info.className = 'file-info';

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = file.name;

    const status = document.createElement('div');
    status.className = 'file-status';
    status.textContent = '대기 중 · ' + formatSize(file.size);

    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    track.appendChild(fill);

    info.appendChild(name);
    info.appendChild(status);
    info.appendChild(track);

    const btn = document.createElement('button');
    btn.className = 'btn-download';
    btn.type = 'button';
    btn.textContent = '⬇ 다운로드';
    btn.disabled = true;

    li.appendChild(thumb);
    li.appendChild(info);
    li.appendChild(btn);
    fileList.appendChild(li);

    const item = {
      id: id, file: file, img: null, blob: null, outName: '',
      status: 'waiting',
      el: { li: li, thumb: thumb, status: status, fill: fill, btn: btn }
    };
    items.push(item);

    // 썸네일 + 이미지 로드
    const url = URL.createObjectURL(file);
    thumb.src = url;
    const img = new Image();
    img.onload = function () { item.img = img; };
    img.onerror = function () {
      item.status = 'error';
      status.textContent = '이미지를 읽을 수 없어요';
      status.className = 'file-status error';
    };
    img.src = url;

    btn.addEventListener('click', function () {
      if (!item.blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(item.blob);
      a.download = item.outName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  function updateCount() {
    fileCount.textContent = '(' + items.length + '장)';
  }

  function formatSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  }

  // ---------- 옵션 ----------
  ratioGrid.addEventListener('click', function (e) {
    const btn = e.target.closest('.ratio-btn');
    if (!btn) return;
    ratioGrid.querySelectorAll('.ratio-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentRatio = btn.dataset.ratio;
    customInputs.hidden = (currentRatio !== 'custom');
  });

  document.getElementById('modePadding').addEventListener('click', function () { setMode('padding'); });
  document.getElementById('modeCrop').addEventListener('click', function () { setMode('crop'); });
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    padColorGroup.style.display = (mode === 'padding') ? '' : 'none';
  }

  padColor.addEventListener('input', function () {
    colorValue.textContent = padColor.value.toUpperCase();
  });
  document.querySelectorAll('.color-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      padColor.value = chip.dataset.color;
      colorValue.textContent = chip.dataset.color.toUpperCase();
    });
  });

  function getRatio() {
    if (currentRatio === 'custom') {
      const w = parseFloat(customW.value);
      const h = parseFloat(customH.value);
      if (!w || !h || w <= 0 || h <= 0) return null;
      return w / h;
    }
    const parts = currentRatio.split(':');
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }

  // ---------- 변환 ----------
  btnConvert.addEventListener('click', function () {
    const ratio = getRatio();
    if (ratio === null) {
      showToast('⚠️ 커스텀 비율을 올바르게 입력해주세요');
      return;
    }
    const targets = items.filter(function (it) { return it.status !== 'error'; });
    if (targets.length === 0) {
      showToast('⚠️ 변환할 이미지가 없어요');
      return;
    }
    btnConvert.disabled = true;
    btnZip.disabled = true;

    let doneCount = 0;
    targets.forEach(function (item, idx) {
      // 각 파일 독립 처리 (순차 시작하되 개별 진행)
      setTimeout(function () {
        processItem(item, ratio, function () {
          doneCount++;
          if (doneCount === targets.length) {
            btnConvert.disabled = false;
            checkAllDone();
          }
        });
      }, idx * 120);
    });
  });

  function processItem(item, ratio, onFinish) {
    const el = item.el;
    item.status = 'working';
    item.blob = null;
    el.btn.disabled = true;
    el.btn.classList.remove('ready');
    el.fill.classList.remove('done');
    el.status.className = 'file-status';

    let progress = 0;
    el.fill.style.width = '0%';
    el.status.textContent = '변환 중… 0%';

    // 프로그레스 애니메이션 (실작업은 마지막에 순간 수행되므로 시각적 진행 표시)
    const timer = setInterval(function () {
      progress += 8 + Math.random() * 14;
      if (progress >= 90) { progress = 90; clearInterval(timer); doWork(); }
      el.fill.style.width = progress + '%';
      el.status.textContent = '변환 중… ' + Math.floor(progress) + '%';
    }, 90);

    function doWork() {
      // 이미지가 아직 로드 중이면 잠시 대기
      if (!item.img) {
        let tries = 0;
        const wait = setInterval(function () {
          tries++;
          if (item.img) { clearInterval(wait); render(); }
          else if (tries > 50) { clearInterval(wait); fail('이미지 로드 실패'); }
        }, 100);
      } else {
        render();
      }
    }

    function render() {
      try {
        const img = item.img;
        const iw = img.naturalWidth, ih = img.naturalHeight;

        // 출력 캔버스 크기 계산 (긴 변 MAX_OUT 제한)
        let cw, ch;
        if (ratio >= 1) { cw = Math.min(MAX_OUT, Math.max(iw, ih)); ch = Math.round(cw / ratio); }
        else { ch = Math.min(MAX_OUT, Math.max(iw, ih)); cw = Math.round(ch * ratio); }

        const canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        if (currentMode === 'padding') {
          // 여백 채우기
          ctx.fillStyle = padColor.value;
          ctx.fillRect(0, 0, cw, ch);
          const scale = Math.min(cw / iw, ch / ih);
          const dw = iw * scale, dh = ih * scale;
          ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        } else {
          // 중앙 크롭
          const scale = Math.max(cw / iw, ch / ih);
          const sw = cw / scale, sh = ch / scale;
          const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        }

        // PNG 원본은 PNG로(투명 보존 X → padding이면 어차피 배경 채움), 그 외 JPEG
        const isPng = item.file.type === 'image/png' && currentMode === 'crop';
        const mime = isPng ? 'image/png' : 'image/jpeg';

        canvas.toBlob(function (blob) {
          if (!blob) { fail('변환 실패'); return; }
          item.blob = blob;
          const base = item.file.name.replace(/\.[^.]+$/, '');
          item.outName = 'resized_' + base + (mime === 'image/png' ? '.png' : '.jpg');
          success(blob);
        }, mime, 0.92);
      } catch (err) {
        fail('변환 중 오류 발생');
      }
    }

    function success(blob) {
      item.status = 'done';
      el.fill.style.width = '100%';
      el.fill.classList.add('done');
      el.status.textContent = '✅ 완료 · ' + formatSize(item.file.size) + ' → ' + formatSize(blob.size);
      el.status.className = 'file-status done';
      el.btn.disabled = false;
      el.btn.classList.add('ready');
      onFinish();
    }

    function fail(msg) {
      item.status = 'error';
      el.fill.style.width = '0%';
      el.status.textContent = '❌ ' + msg;
      el.status.className = 'file-status error';
      onFinish();
    }
  }

  // ---------- 일괄 다운로드 ----------
  function checkAllDone() {
    const valid = items.filter(function (it) { return it.status !== 'error'; });
    const done = valid.filter(function (it) { return it.status === 'done' && it.blob; });
    btnZip.disabled = !(done.length > 0 && done.length === valid.length);
    if (!btnZip.disabled) showToast('🎉 모든 이미지 변환 완료! 일괄 다운로드가 가능해요');
  }

  btnZip.addEventListener('click', function () {
    if (typeof JSZip === 'undefined') {
      showToast('⚠️ 압축 라이브러리를 불러오지 못했어요 (인터넷 연결 확인)');
      return;
    }
    const done = items.filter(function (it) { return it.status === 'done' && it.blob; });
    if (done.length === 0) return;

    btnZip.disabled = true;
    btnZip.textContent = '📦 압축 중…';

    const zip = new JSZip();
    const used = {};
    done.forEach(function (it) {
      // 동일 파일명 충돌 방지
      let name = it.outName;
      if (used[name]) { name = name.replace(/(\.[^.]+)$/, '_' + used[it.outName] + '$1'); }
      used[it.outName] = (used[it.outName] || 0) + 1;
      zip.file(name, it.blob);
    });

    zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(function (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'smart-image-resizer.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      btnZip.textContent = '📦 일괄 다운로드 (zip)';
      btnZip.disabled = false;
    }).catch(function () {
      showToast('⚠️ 압축 파일 생성에 실패했어요');
      btnZip.textContent = '📦 일괄 다운로드 (zip)';
      btnZip.disabled = false;
    });
  });

})();
