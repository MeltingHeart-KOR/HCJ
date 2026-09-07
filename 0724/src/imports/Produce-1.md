# Role
당신은 Awwwards에서 올해의 웹사이트상을 수상한 10년 차 '시니어 인터랙티브 프론트엔드 개발자'이자 'Next.js 및 WebGL(Three.js) 엑스퍼트'입니다. 아래의 명세서(PRD)를 바탕으로 완벽하게 동작하는 Next.js 프로젝트 코드를 작성해 주세요.

---

# [PRD] 류지민 - 3D 프루티거 에어로 스타일 인터랙티브 포트폴리오

## 1. Project Overview
- **목적:** 예비 프론트엔드 개발자 '류지민'을 소개하고 압도적인 인터랙션 기술력을 어필하는 개인 포트폴리오 웹사이트
- **컨셉:** 2000년대 후반의 '프루티거 에어로(Frutiger Aero)' 스타일을 현대적으로 재해석 (투명한 3D 유리, 물방울, 광택).
- **특징:** Three.js를 활용하여 빛을 반사하는 3D 유리 질감(Aero Glass)과 물방울 객체를 구현하고, 스크롤 및 마우스 움직임에 반응하는 고도화된 웹 인터랙션 적용.

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router 방식 사용)
- **3D Rendering:** `three`, `@react-three/fiber` (R3F), `@react-three/drei`
- **Animation & Styling:** Framer Motion, GSAP, CSS Modules 또는 Tailwind CSS
- **Icons/Fonts:** Lucide React, 둥글고 유려한 산세리프 폰트

## 3. Design System (3D Modern Frutiger Aero)
- **Color Palette:** Primary (Clear Sky Blue), Secondary (Emerald Green), Accent (Glossy White)
- **3D Materials (핵심):**
  - `@react-three/fiber`의 `<meshPhysicalMaterial>`을 사용하여 **투명한 유리와 물방울 질감** 구현.
  - 속성 가이드: `transmission: 1` (완전 투명), `roughness: 0` (매끄러움), `thickness`와 `ior` (빛 굴절률)을 조절하여 배경이 비치는 리얼한 물방울 느낌 연출.
  - 조명: `<ambientLight>`와 `<directionalLight>`를 결합하고, `<Environment>`(HDRI)를 사용해 표면에 빛이 맺히는 광택(Glossy) 극대화.

## 4. Content Layout & Typography Strategy (About Me 섹션 상세)
단순한 텍스트 나열을 피하고, 가독성과 심미성을 높이기 위해 `AboutSection.tsx`의 레이아웃을 다음과 같이 구성하세요.

**[A. 전체 레이아웃 구조]**
- 전체를 감싸는 커다란 투명 Glassmorphism 카드 레이아웃 (반투명 흰색 배경, 블러 효과, 은은한 테두리).
- PC 화면에서는 **2단 분할(2-Column Layout)** 사용:
  - **Left Column:** "Who am I?"라는 커다란 유광(Glossy) 타이틀과 지민 님을 상징하는 3D 물방울 또는 아이콘 배치.
  - **Right Column:** 10줄의 텍스트를 4개의 문단(Paragraph)으로 나누어 세로로 배치. (모바일에서는 1단으로 스택되도록 반응형 처리).

**[B. 텍스트 분할 및 키워드 하이라이팅]**
텍스트는 다음 4개의 블록으로 나누고, `<span>` 태그를 활용해 핵심 키워드에 에메랄드 그린(Emerald Green) 색상이나 광택 효과로 포인트를 주세요.

1. **(Intro)** "안녕하세요! 맑고 투명한 코드와 유려한 인터랙션을 사랑하는 <span className="...">예비 프론트엔드 개발자 류지민</span>입니다. 올해 26세인 저는 <span className="...">경성대학교 컴퓨터공학과</span> 4학년에 재학 중이며, 끊임없이 배우고 성장하는 것을 즐깁니다." 
2. **(Vision)** "전공 지식을 바탕으로 탄탄한 소프트웨어 아키텍처를 고민하며, 사용자에게 <span className="...">시각적인 즐거움</span>을 주는 웹 경험을 만드는 데 관심이 많습니다. 현재는 글로벌 역량을 키우고 실무에 최적화된 개발자로 도약하기 위해 <span className="...">'K-Move 프로그램'</span>에 열정적으로 참여하고 있습니다. <span className="...">글로벌 무대</span>에서 다양한 사람들과 협업하며, 제 코드로 전 세계 사용자들과 소통하는 것이 저의 큰 목표입니다." 
3. **(Hobby)** "평소에는 <span className="...">게임</span>을 즐겨하며, 게임 속에서 발견하는 흥미로운 <span className="...">UI/UX</span>와 <span className="...">화려한 이펙트</span>들을 웹 브라우저 상에 구현해보는 것을 좋아합니다." 
4. **(Attitude)** "<span className="...">맑은 물방울처럼</span>, 어떤 개발 환경이나 팀원들과도 유연하고 투명하게 섞일 수 있는 소통 능력을 갖추고 있습니다. 복잡한 에러와 문제를 <span className="...">게임 퀘스트를 깨듯</span> 즐겁게 해결하고, 마침내 버그를 잡아냈을 때의 짜릿함을 동력 삼아 코드를 작성합니다. 기술의 한계를 두지 않고 새로운 프레임워크와 <span className="...">3D 웹 기술(WebGL)</span>까지 탐구하며 저만의 개발 스펙트럼을 넓혀가고 있습니다. 저의 포트폴리오를 통해 제가 그려나갈 무한한 가능성과 개발에 대한 진심을 느껴보시길 바랍니다." 

## 5. Component Structure
프로젝트는 컴포넌트로 모듈화됩니다. WebGL 컨텍스트 분리를 위해 3D 요소와 2D UI를 명확히 구분하세요.

| Directory/File | Component Name | Description & Interaction |
| :--- | :--- | :--- |
| `app/layout.tsx` | RootLayout | 전역 폰트 및 메타데이터 설정 |
| `app/page.tsx` | HomePage | 2D UI 섹션들과 3D Background를 겹쳐서(`z-index`) 렌더링하는 메인 페이지 |
| `components/3d/` | Scene3D | `<Canvas>`를 포함하는 R3F 최상위 컴포넌트. |
| `components/3d/` | FloatingBubbles | 3D 공간 $ (x, y, z) $ 위를 부유하는 투명한 유리 구슬/물방울들. |
| `components/ui/` | HeroSection | 로드 시 화면 중앙에서 떠오르는 타이틀 텍스트 애니메이션 |
| `components/ui/` | AboutSection | 4번 항목의 **2단 레이아웃 및 텍스트 분할**이 적용된 Glassmorphism 카드 컴포넌트 |
| `components/ui/` | SkillsSection | 스크롤 시 나타나는 기술 스택 섹션 |
| `components/ui/` | ProjectCard | CSS 3D Transform을 이용해 마우스 방향으로 기울어지는 3D Tilt 효과 적용 |

## 6. Core Interactions & Animations (상세 요구사항)
1. **Interactive 3D Background:** `Scene3D` 컴포넌트를 화면 전체에 고정(`position: fixed`)하고 맨 뒤(`z-index: -1`)에 배치하세요. 내부의 `FloatingBubbles`는 사용자의 마우스 좌표에 따라 부드럽게 회전하거나 위치가 미세하게 변해야 합니다(Parallax).
2. **Text Stagger Animation:** `AboutSection`이 스크롤되어 화면에 나타날 때, Framer Motion의 `staggerChildren` 기능을 사용하여 4개의 텍스트 문단이 **아래에서 위로 시차를 두고 하나씩 부드럽게 페이드인** 되도록 구현하세요. (가독성을 위해 `line-height`와 `gap`을 여유롭게 설정)
3. **Scroll Reveal 2D UI:** 3D 배경 위로 스크롤 되는 2D UI(About, Skills)는 화면에 나타날 때 투명도(0➜1)와 $y$축 위치가 부드럽게 변하는 애니메이션을 적용하세요.
4. **3D Tilt Hover Effect:** `ProjectCard`에 마우스를 올리면 마우스 방향을 따라 카드가 미세하게 기울어지는 입체 효과를 구현해 주세요.
5. **Glossy UI Elements:** 2D UI 버튼이나 카드에도 프루티거 에어로 특유의 빛나는 선형 그라데이션(Linear Gradient) 하이라이트를 추가하세요.

## 7. Next.js & Three.js Development Guidelines (제약 및 주의사항)
- **SSR Hydration Error 방지:** `@react-three/fiber`의 `<Canvas>` 컴포넌트를 포함하는 파일은 반드시 `"use client"`를 선언하고, `app/page.tsx`에서 불러올 때 `next/dynamic`을 사용하여 `ssr: false` 옵션을 주어야 합니다.
- 불필요한 렌더링 최적화: R3F 내에서 `useFrame`을 사용할 때 성능 저하가 없도록 최적화에 신경 쓰세요.
- 모든 코드는 즉시 복사하여 프로젝트에 붙여넣었을 때 에러 없이 실행되어야 합니다.

---
