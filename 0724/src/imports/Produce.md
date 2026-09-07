# Role
당신은 Awwwards에서 올해의 웹사이트상을 수상한 10년 차 '시니어 인터랙티브 프론트엔드 개발자'이자 'Next.js 및 WebGL(Three.js) 엑스퍼트'입니다. 아래의 명세서(PRD)를 바탕으로 완벽하게 동작하는 Next.js 프로젝트 코드를 작성해 주세요.

---

# [PRD] 3D 프루티거 에어로 스타일 인터랙티브 포트폴리오

## 1. Project Overview
- **목적:** 개발자 자신을 소개하고 압도적인 인터랙션 기술력을 어필하는 개인 포트폴리오 웹사이트
- **컨셉:** 2000년대 후반의 '프루티거 에어로(Frutiger Aero)' 스타일을 현대적으로 재해석. 
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

## 4. Component Structure
프로젝트는 컴포넌트로 모듈화됩니다. WebGL 컨텍스트 분리를 위해 3D 요소와 2D UI를 명확히 구분하세요.

| Directory/File | Component Name | Description & Interaction |
| :--- | :--- | :--- |
| `app/layout.tsx` | RootLayout | 전역 폰트 및 메타데이터 설정 |
| `app/page.tsx` | HomePage | 2D UI 섹션들과 3D Background를 겹쳐서(`z-index`) 렌더링하는 메인 페이지 |
| `components/3d/` | Scene3D | `<Canvas>`를 포함하는 R3F 최상위 컴포넌트. (Next.js SSR 에러 방지를 위해 dynamic import 적용 권장) |
| `components/3d/` | FloatingBubbles | 3D 공간 $ (x, y, z) $ 위를 부유하는 투명한 유리 구슬/물방울들. 마우스 포인터를 따라 카메라나 객체가 미세하게 반응(Parallax) |
| `components/ui/` | HeroSection | 로드 시 화면 중앙에서 떠오르는 타이틀 텍스트 (Framer Motion 활용) |
| `components/ui/` | AboutSection | 투명도(`backdrop-filter: blur()`)가 적용된 Glassmorphism 카드 레이아웃 |
| `components/ui/` | ProjectCard | CSS 3D Transform을 이용해 마우스 방향으로 기울어지는 3D Tilt 효과 적용 |

## 5. Core Interactions & Animations (상세 요구사항)
1. **Interactive 3D Background:** `Scene3D` 컴포넌트를 화면 전체에 고정(`position: fixed`)하고 맨 뒤(`z-index: -1`)에 배치하세요. 내부의 `FloatingBubbles`는 사용자의 마우스 좌표에 따라 부드럽게 회전하거나 위치가 변해야 합니다.
2. **Scroll Reveal 2D UI:** 3D 배경 위로 스크롤 되는 2D UI(About, Skills)는 화면에 나타날 때 투명도(0➜1)와 $y$축 위치(아래에서 위로)가 부드럽게 변하는 애니메이션을 적용하세요.
3. **Glossy UI Elements:** 2D UI 버튼이나 카드에도 프루티거 에어로 특유의 빛나는 선형 그라데이션(Linear Gradient) 하이라이트를 추가하세요.

## 6. Next.js & Three.js Development Guidelines (제약 및 주의사항)
- **SSR Hydration Error 방지:** `@react-three/fiber`의 `<Canvas>` 컴포넌트를 포함하는 파일은 반드시 `"use client"`를 선언하고, `app/page.tsx`에서 불러올 때 `next/dynamic`을 사용하여 `ssr: false` 옵션을 주어야 합니다.
- 불필요한 렌더링 최적화: R3F 내에서 `useFrame`을 사용할 때 성능 저하가 없도록 최적화에 신경 쓰세요.
- 모든 코드는 즉시 복사하여 프로젝트에 붙여넣었을 때 에러 없이 실행되어야 합니다.

---
위 명세서를 완벽하게 숙지했다면, 가장 먼저 프로젝트의 기본 폴더 구조를 설명하고, 3D 구현의 핵심인 `Scene3D.tsx` 및 `FloatingBubbles.tsx`를 포함하여 차례대로 전체 파일 코드를 작성해 주세요.