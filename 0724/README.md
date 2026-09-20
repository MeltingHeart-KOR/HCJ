# 🫧 3D Frutiger Aero Interactive Portfolio

<div align="center">

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r185-000000?style=for-the-badge&logo=three.dot.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4-0055FF?style=for-the-badge&logo=framer&logoColor=white)

<br/>

**맑은 코드와 유려한 인터랙션으로 빛나는 웹 경험을 만드는 프론트엔드 개발자 류지민(Jimin Ryu)의 개인 포트폴리오 웹사이트입니다.**

[✨ 데모 둘러보기](#-주요-섹션-구성) · [🚀 시작하기](#-시작하기-getting-started) · [🛠 기술 스택](#-기술-스택-tech-stack) · [💡 핵심 최적화](#-핵심-엔지니어링--성능-최적화-포인트)

</div>

---

## 📖 프로젝트 소개 (Overview)

> **"맑은 물방울처럼 유연하고 투명하게, 빛나는 인터랙션으로 소통합니다."**

2000년대 후반의 유려하고 청량한 감성인 **'프루티거 에어로(Frutiger Aero)'** 비주얼 디자인을 현대적인 웹 표준 기술(React 19, Three.js, R3F, Framer Motion)로 재해석한 인터랙티브 포트폴리오 프로젝트입니다.

배경의 3D 뷰포트에서는 빛을 투과·반사하는 투명한 유리 질감의 물방울들이 마우스 움직임에 반응하여 유영하며, 전면의 2D 레이어에서는 모던 글래스모피즘(Glassmorphism) UI와 부드러운 스크롤 인터랙션이 조화를 이룹니다.

---

## ✨ 핵심 기능 및 특징 (Key Features)

### 1. 🌐 WebGL 3D Interactive Background
- **Three.js & React Three Fiber (`@react-three/fiber`, `@react-three/drei`)** 기반 3D 씬 구성
- **물리 기반 유리 질감 (`MeshPhysicalMaterial`)**:
  - `transmission: 1` (완전 투명성), `ior: 1.45` (물/유리 굴절률), `roughness: 0`, `clearcoat: 1` 설정을 통해 투명하고 맑은 물방울 시각 효과 구현
  - City HDRI 환경광 및 다방향 라이팅(Ambient, Directional, Point Light)으로 극대화된 유광(Glossy) 하이라이트
- **부드러운 마우스 패럴랙스 (Parallax)**:
  - 마우스 좌표를 실시간 추적하여 3D 버블 그룹의 회전 각도를 선형 보간(Lerp) 방식으로 제어
- **반짝이는 스파클 파티클 (Sparkle Point Cloud)**:
  - 3차원 공간 전체에 무작위 분포된 포인트 클라우드로 몽환적인 분위기 연출

### 2. 💎 모던 프루티거 에어로 & 글래스모피즘 디자인 시스템
- **유리 질감 카드 (`.glass-card`)**: `backdrop-filter: blur(20px)`와 반투명 경계선, 상단 광택 레이어로 입체감 부여
- **글래시 버튼 (`.glossy-btn`)**: 입체적인 내부 그림자(inset shadow)와 그라데이션 하이라이트, 호버 인터랙션
- **컬러 팔레트**: Deep Sky Blue (`#041a4a` ~ `#2fb5f5`), Light Cyan (`#b8eaff`), Emerald Green (`#00c97a`)

### 3. 🎴 인터랙티브 3D 틸트 카드 (3D Tilt Effect)
- Projects 섹션의 프로젝트 카드에 CSS 3D Transform(`perspective`, `rotateX`, `rotateY`) 적용
- 마우스 커서 위치에 비례하여 카드가 실시간으로 기울어지는 인터랙티브 카드 경험 제공

### 4. 🎬 부드러운 모션 & 미디어 경험
- **Framer Motion 스크롤 리빌 & 텍스트 스태거**: 화면 진입 시 문단별 순차적 페이드인 애니메이션 (`staggerChildren`)
- **인터랙티브 인트로 비디오 플레이어**: 글래스모피즘 프레임 및 커스텀 재생/일시정지 오버레이 컨트롤러

---

## 🛠 기술 스택 (Tech Stack)

### Frontend & Core
- **Library / Framework:** [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/)
- **Language:** [TypeScript 5.7](https://www.typescriptlang.org/)

### 3D Graphics & WebGL
- **3D Engine:** [Three.js r185](https://threejs.org/)
- **R3F Ecosystem:** [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei)

### Styling & Animation
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), Vanilla CSS (Custom Design Tokens)
- **Animation:** [Framer Motion 12](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Code Quality & Bundler
- **Formatter & Linter:** [oxfmt](https://oxc-project.github.io/)
- **Minifier:** Terser

---

## 💡 핵심 엔지니어링 & 성능 최적화 포인트

| 최적화 항목 | 적용 내용 및 효과 |
| :--- | :--- |
| **비반응형 마우스 트래킹** | React State 대신 `useRef`와 `requestAnimationFrame`을 사용하여 마우스 이동 시 컴포넌트 불필요한 리렌더링을 100% 방지 |
| **가변 세그먼트 LOD** | 버블 반지름 크기(`radius`)에 비례해 지오메트리 세그먼트를 16~48 사이로 동적 할당하여 고사양 GPU 병목 현상 완화 |
| **WebGL Context 복구 안전장치** | `webglcontextlost` 및 `webglcontextrestored` 이벤트를 리스닝하여 예기치 않은 GPU 컨텍스트 유실 대응 |
| **Z-Index 레이어 분리** | 고정형 3D 백그라운드 캔버스(`position: fixed; pointer-events: none`)와 2D UI 돔트리를 명확히 분리하여 렌더링 성능 및 마우스 이벤트 전달 보장 |

---

## 📁 프로젝트 구조 (Project Structure)

```text
0724/
├── public/                     # 정적 미디어 에셋 (프로필 이미지, 인트로 비디오 등)
│   ├── intro-video.mp4
│   └── profile.jpg
├── src/
│   ├── components/
│   │   ├── 3d/                 # Three.js 3D 그래픽스 컴포넌트
│   │   │   ├── FloatingBubbles.tsx  # 물리 기반 유리 물방울 및 스파클 파티클
│   │   │   └── Scene3D.tsx          # R3F Canvas 씬 마운트 및 마우스 패럴랙스
│   │   └── ui/                 # 2D 글래스모피즘 UI 섹션 컴포넌트
│   │       ├── AboutSection.tsx     # 자기소개 및 핵심 가치 (Stagger 애니메이션)
│   │       ├── HeroSection.tsx      # 헤어로 타이틀 및 CTA 인터랙션
│   │       ├── ProjectCard.tsx      # 3D 틸트 인터랙션 프로젝트 카드
│   │       ├── SkillsSection.tsx    # 유광 아이콘 기술 스택 그리드
│   │       └── VideoSection.tsx     # 소개 비디오 플레이어
│   ├── imports/                # 기획 명세서(PRD) 및 원본 에셋 문서
│   │   ├── Produce.md
│   │   └── Produce-1.md
│   ├── App.tsx                 # 최상위 레이아웃 구성
│   ├── index.css               # 프루티거 에어로 디자인 토큰 및 글래스모피즘 스타일
│   ├── main.tsx                # React DOM 진입점
│   └── vite-env.d.ts
├── index.html                  # HTML 템플릿 및 메타데이터
├── package.json                # 의존성 및 실행 스크립트 정의
├── tsconfig.json               # TypeScript 컴파일러 설정
└── vite.config.ts              # Vite 빌드, 포트 및 Tailwind 플러그인 설정
```

---

## 🖥 주요 섹션 구성

1. **Hero Section**
   - 그라데이션 타이틀, 감성적인 서브카피, About / Projects 바로가기 유광 버튼, 스크롤 인디케이터
2. **About Me ("Who am I?")**
   - 글래스모피즘 링 프로필 이미지, 4가지 핵심 가치(Intro, Vision, Hobby, Attitude)와 에메랄드 하이라이팅
3. **Video Section**
   - 포트폴리오 데모 비디오를 재생할 수 있는 반투명 미디어 플레이어
4. **Skills Section**
   - MSN/아쿠아 감성의 하이라이트 원형 뱃지와 주요 기술 스택 목록(React, TypeScript, Three.js, Next.js, C#, Unity 등)
5. **Projects Section**
   - 3D Frutiger Aero Portfolio, 실시간 전략 주사위 게임(Unity/Photon), 3D 지뢰 찾기(Next.js) 등 틸트 카드
6. **Footer**
   - 저작권 표기 및 제작 기술 스택 명시

---

## 🚀 시작하기 (Getting Started)

### 요구 사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18.0.0 이상 권장)
- npm, pnpm 또는 yarn

### 설치 (Installation)

```bash
# 0724 디렉터리로 이동
cd 0724

# 의존성 패키지 설치
npm install
```

### 실행 (Development)

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 포트폴리오를 확인할 수 있습니다.

### 빌드 (Build)

```bash
# 프로덕션 번들 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

### 코드 포맷팅 (Format)

```bash
npm run format
```

---

## 👤 개발자 소개 (Author)

- **이름:** 류지민 (Jimin Ryu)
- **학력:** 경성대학교 컴퓨터공학과
- **관심 분야:** 인터랙티브 웹 디자인, 3D WebGL (Three.js), 부드러운 사용자 경험 (UI/UX), 게임 인터랙션
- **목표:** 'K-Move 프로그램'을 통해 글로벌 무대에서 전 세계 사용자들에게 시각적 즐거움과 신뢰성을 주는 프론트엔드 개발자

---

## 📄 라이선스 (License)

This project is licensed under the [MIT License](LICENSE).
