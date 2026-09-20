# 🚇 부산 감성 지하철 여행 가이드 (BUSAN GUIDE)

> **"波の音まで、地下鉄で。"**  
> 파도 소리가 들리는 곳까지, 지하철을 타고 떠나는 부산 감성 여행.

부산 지하철 1호선과 2호선을 중심으로 주요 관광 명소, 테마별 여행 코스, 감성 카페 및 로컬 맛집 정보를 직관적이고 인터랙티브하게 전달하는 웹 가이드 서비스입니다.

[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Motion](https://img.shields.io/badge/Motion-12.4-0055FF?logo=framer&logoColor=white)](https://motion.dev/)

---

## ✨ 주요 기능 (Key Features)

### 1. 🌊 인터랙티브 히어로 & 물결 애니메이션 (Dynamic Hero Wave)
- **수면/물결 효과**: GSAP와 SVG Path를 결합하여 바다의 역동적인 파도 느낌을 웹 화면에 감성적으로 표현.
- **배경 슬라이드쇼 & 타이핑 효과**: 부산의 낮과 밤을 담은 배경 갤러리와 여행의 설렘을 주는 타이핑 모션 인터랙션.

### 2. 💖 하트형 인터랙티브 지하철 노선도 (Interactive Heart Metro Map)
- 1호선(오렌지)과 2호선(그린)의 환승 및 동선을 **대칭형 하트 모양 SVG**로 재구성한 독창적인 디자인.
- 온천 김, 돛단배와 파도, 기차, 영화 필름 등 역별 테마를 아기자기한 핸드드로운(Hand-drawn) 두들로 시각화.
- 노선도 내 역을 클릭하면 해당 역의 맞춤형 상세 가이드 페이지로 바로 이동.

### 3. 🗺️ 5가지 테마별 여행 코스 (Theme Course Preview)
- **1호선 · 부산역 주변**: *부산 도착! 레트로 골목 산책 (초량 이바구길)*
- **2호선 · 전포 카페거리**: *트렌디 카페 & 감성 소품샵 투어*
- **1호선 · 남포 에어리어**: *활기 넘치는 로컬 맛집 & 시장 탐방 (자갈치·국제시장·BIFF)*
- **2호선 · 광안리 해변**: *오션뷰 & 광안대교 낭만 야경 코스*
- **1호선 · 온천장 에어리어**: *힐링 동래온천 & 야외 족욕 리프레시 코스*

### 4. 📍 역별 맞춤 상세 가이드 (Station Details)
- 각 역의 하이라이트 사진, 영업 정보, 추천 스폿, 교통 팁을 카드 형태와 감성적인 비주얼로 상세하게 소개.

---

## 🚉 안내 역 목록 (Featured Stations)

| 호선 | 역명 | 테마 / 주요 명소 | 상세 페이지 |
|:---:|:---|:---|:---:|
| <img src="https://placehold.co/18x18/f0a233/ffffff?text=1" alt="1호선" /> | **부산역 (釜山駅)** | KTX 환승, 초량 이바구길, 168계단 모노레일, 차이나타운 | [`pages/busan-station.html`](./pages/busan-station.html) |
| <img src="https://placehold.co/18x18/f0a233/ffffff?text=1" alt="1호선" /> | **남포역 (南浦駅)** | 자갈치시장, BIFF 광장, 국제시장, 씨앗호떡, 용두산공원 | [`pages/nampo.html`](./pages/nampo.html) |
| <img src="https://placehold.co/18x18/f0a233/ffffff?text=1" alt="1호선" /> | **온천장역 (温泉場駅)** | 동래온천 노천 족욕탕, 허심청, 금강공원 케이블카 | [`pages/oncheonjang.html`](./pages/oncheonjang.html) |
| <img src="https://placehold.co/18x18/2a2a26/ffffff?text=H" alt="환승" /> | **서면역 (西面駅)** | 1·2호선 환승 허브, 서면 젊음의 거리, 롯데백화점, 지하상가 | [`pages/seomyeon.html`](./pages/seomyeon.html) |
| <img src="https://placehold.co/18x18/4f8f3d/ffffff?text=2" alt="2호선" /> | **전포역 (田浦駅)** | 전포 카페거리, 감성 소품 편집숍, 디저트 베이커리 | [`pages/jeonpo.html`](./pages/jeonpo.html) |
| <img src="https://placehold.co/18x18/4f8f3d/ffffff?text=2" alt="2호선" /> | **광안역 (広安駅)** | 광안리 해수욕장, 광안대교 야경 & 드론쇼, 오션뷰 카페 | [`pages/gwangan.html`](./pages/gwangan.html) |

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/), [Oxlint](https://oxc.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Animation**: [GSAP 3](https://greensock.com/gsap/), [Motion (Framer Motion)](https://motion.dev/)

### Fonts & Design
- **Typography**: `Instrument Serif`, `Shippori Mincho`, `M PLUS Rounded 1c`
- **Color Palette**: 파스텔 핑크/크림 베이스 + 레트로 네이비 + 1·2호선 시그니처 컬러

---

## 📁 프로젝트 구조 (Project Structure)

```bash
Busan_Guide/
├── docs/                     # GitHub Pages 배포용 빌드 산출물
├── pages/                    # 각 역별 상세 정적 페이지
│   ├── busan-station.html    # 부산역 상세 페이지
│   ├── gwangan.html          # 광안역 상세 페이지
│   ├── jeonpo.html           # 전포역 상세 페이지
│   ├── nampo.html            # 남포역 상세 페이지
│   ├── oncheonjang.html      # 온천장역 상세 페이지
│   └── seomyeon.html         # 서면역 상세 페이지
├── public/                   # 정적 에셋 리소스
├── src/
│   ├── components/           # React UI 컴포넌트
│   │   ├── Footer.tsx        # 푸터 컴포넌트
│   │   ├── Hero.tsx          # 파도 모션 및 슬라이더 히어로 섹션
│   │   ├── Intro.tsx         # 가이드 소개 & 사용 방법
│   │   ├── MetroMap.tsx      # SVG 하트형 지하철 노선도
│   │   ├── MetroMapSection.tsx # 노선도 래퍼 섹션
│   │   ├── Nav.tsx           # 상단 내비게이션 바
│   │   ├── PickUpCard.tsx    # 코스 프리뷰 카드 컴포넌트
│   │   ├── PickUpSection.tsx # 5대 테마 코스 섹션
│   │   └── PlusGrid.tsx      # 그리드 배경 패턴 컴포넌트
│   ├── App.tsx               # 메인 애플리케이션 엔트리
│   ├── index.css             # 글로벌 스타일 및 테마 토큰 정의
│   └── main.tsx              # React DOM 렌더링 엔트리포인트
├── index.html                # 루트 HTML 템플릿
├── netlify.toml              # Netlify 배포 설정
├── package.json              # 의존성 및 스크립트 정의
├── tsconfig.json             # TypeScript 설정
└── vite.config.ts            # Vite 빌드 및 플러그인 설정
```

---

## 🚀 시작하기 (Getting Started)

### 사전 준비 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- `npm` 또는 `pnpm`, `yarn`

### 설치 및 로컬 실행 (Installation & Run)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 결과를 확인합니다.

### 빌드 (Build)

```bash
# 프로덕션 빌드 (산출물은 docs/ 폴더에 생성)
npm run build

# 코드 린트 검사
npm run lint

# 빌드 결과물 미리보기
npm run preview
```

---

## 🌐 배포 (Deployment)

### GitHub Pages
- 본 프로젝트는 `vite.config.ts`의 `build.outDir`이 `docs`로 설정되어 있습니다.
- GitHub 저장소 설정(`Settings` > `Pages`)에서 소스 브랜치를 설정하고 배포 폴더를 `/docs`로 지정하면 손쉽게 배포할 수 있습니다.

### Netlify
- 프로젝트 루트에 포함된 [`netlify.toml`](./netlify.toml) 설정을 통해 연결 즉시 자동 배포가 가능합니다.
  - **Build command**: `npm run build`
  - **Publish directory**: `dist` (또는 `docs`)

---

## 📄 라이선스 (License)

This project is licensed under the MIT License.
