# 🔳 Smart QR — URL을 QR코드로

URL을 입력하면 QR코드를 만들어 주고, **QR코드를 클릭하면 JPG 파일로 저장**되는 웹 앱입니다.
모든 처리는 브라우저에서 실행됩니다 (서버 불필요 → **GitHub Pages 배포 가능** ✅).

> 🐕 나나컴퍼니 · Smart QR

---

## ✨ 기능

- 🔗 URL 입력 → **확인** 버튼으로 QR코드 즉시 생성
- 🎬 생성 시 입력창이 하단 바로 내려가고 QR코드가 정중앙에 표시
- 💾 QR코드 **클릭 한 번**으로 JPG 다운로드 (흰 여백 포함 800×800px)
- 🧭 `example.com` 처럼 입력해도 자동으로 `https://` 를 붙여 처리
- 📱 모바일 대응 반응형

## 📁 구성

```
smart-qr/
├── index.html
├── style.css
├── app.js
├── logo.png   ← ⚠️ 로고 이미지를 이 이름으로 직접 넣어주세요
└── README.md
```

> `logo.png`가 없으면 자동으로 텍스트 로고(🐕 나나컴퍼니)로 대체됩니다.

## 🚀 실행 방법

**로컬:** `index.html` 더블클릭 (QR 라이브러리가 CDN이라 인터넷 연결 필요)

**GitHub Pages:**
1. 이 폴더를 저장소에 업로드
2. Settings → Pages → 사용 중인 브랜치 + `/ (root)` 선택 → Save
3. `https://<아이디>.github.io/<저장소>/<경로>/` 접속

## 🛠 사용 라이브러리

- [qrcode.js](https://github.com/davidshimjs/qrcodejs) (cdnjs, HTTPS) — QR 생성
