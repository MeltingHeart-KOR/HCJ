# 🌙 GYEONGJU MT 2박 3일 · 팀 MT 올인원 가이드 웹앱

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Canvas API](https://img.shields.io/badge/Canvas_API-Particle_FX-000000?style=for-the-badge&logo=html5&logoColor=white)

<br/>

**부산 출발 1시간, 천년의 고도 경주에서 펼쳐지는 2박 3일 팀 MT(리트릿) 종합 코스 & 인터랙티브 웹 가이드입니다.**

[🗓️ 2박 3일 코스](#-2박-3일-타임라인-요약) · [✨ 인터랙티브 비주얼 & 엔지니어링](#-인터랙티브-비주얼--프론트엔드-엔지니어링) · [📱 주요 가이드 섹션](#-주요-가이드-섹션) · [🚀 실행 및 배포 가이드](#-실행-및-배포-가이드-getting-started)

</div>

---

## 📖 프로젝트 소개 (Overview)

> **"볼거리 · 먹거리 · 바비큐 · 레크리에이션까지 한눈에 확인하는 완벽한 팀 MT 솔루션"**

**`GYEONGJU MT`** 웹앱은 팀 단위 워크숍이나 대학생·동아리 MT를 경주로 떠날 때 필요한 모든 정보(타임라인 일정, 숙박 팁, 예산안, 준비물 체크리스트, 비상 대안 코스)를 직관적이고 감성적인 웹 인터페이스로 제공하기 위해 제작되었습니다.

단일 HTML 파일 기반의 경량 아키텍처로 브라우저에서 즉시 실행 가능하며, **Google Apps Script(GAS)** 환경에 배포하여 URL 링크 하나로 팀원 전체에게 배포·공유할 수 있도록 최적화되어 있습니다.

---

## ✨ 인터랙티브 비주얼 & 프론트엔드 엔지니어링

### 1. 🌌 경주의 밤을 담은 순수 CSS/SVG 일러스트레이션 히어로
- **풍부한 일러스트레이션 애니메이션**:
  - 밤하늘 그라데이션 (`#0b0d2a` ~ `#c96a3f`)과 깜빡이는 밤하늘 별무리 (`@keyframes twinkle`)
  - 은은하게 발광하는 보름달 (`@keyframes moonGlow`)
  - 경주 왕릉의 유려한 능선과 첨성대 불빛 창문 SVG 실루엣 (`<path>`, `<animate>`)
  - 캠프파이어 모닥불 플리커링 (`@keyframes fireFlicker`) 및 자유롭게 비행하는 반딧불이 (`@keyframes fly`)
- **실시간 마우스 패럴랙스 (Parallax Effect)**:
  - 마우스 움직임에 따라 타이틀 레이어와 첨성대 실루엣 레이어가 서로 반대 방향으로 미세하게 시차 이동
  - `requestAnimationFrame` 스로틀링과 비반응형 변수 캐싱으로 60fps 무지연 렌더링 보장
- **무한 롤링 키워드 티커 (Ticker Track)**:
  - BBQ, 황리단길, 동궁과 월지, 레크리에이션 등 주요 키워드가 하단에 연속 스크롤

### 2. 🎆 Canvas 기반 인터랙티브 클릭 불꽃 파티클 시스템
- 화면 어디든 클릭/터치할 때 터지는 **불꽃 링(Shockwave Ring)**과 **이모지 버스트(Emoji Burst: 🔥, ✨, 🏕️, 🍖, ⭐, 🎉)** 파티클
- **성능 최적화 적용**:
  - **오프스크린 캔버스 스프라이트 사전 렌더링(Off-screen Sprite Caching)**: 매 프레임 이모지 폰트를 그리는 대신 사전 캐싱된 비트맵을 복사하여 CPU/GPU 부담 최소화
  - **루프 자동 시작/정지**: 파티클이 존재할 때만 `requestAnimationFrame` 루프를 구동하고, 파티클 수명이 다하면 렌더 루프를 자동 정지하여 배터리/메모리 절약

### 3. 🎯 완벽한 스크롤 & 카드 인터랙션
- **IntersectionObserver 카드 리빌**: 사용자의 스크롤 위치에 맞춰 콘텐츠 카드가 부드럽게 솟아오르며 페이드인 (`.card.show`)
- **GAS 샌드박스 안전 내비게이션**: Google Apps Script의 iframe 샌드박스 보안 제약으로 인한 앵커 태그 해시 점프 오류를 방지하고자 `data-target`과 `window.scrollTo`를 사용한 무결점 스무스 스크롤 구현
- **접근성 지원**: `prefers-reduced-motion: reduce` 미디어 쿼리를 감지하여 모션에 민감한 사용자를 위해 애니메이션 자동 비활성화

---

## 🗓️ 2박 3일 타임라인 요약

```
[Day 1] 이동 & 바비큐 (첫날 밤 아이스브레이킹)
  10:00 부산 출발 (시외버스 / 카풀)
  12:00 황리단길 점심 & 길거리 간식
  14:00 대릉원 · 첨성대 · 동궁과 월지 단체사진 📸
  17:00 대형마트 단체 장보기
  18:00 펜션 체크인 & 바비큐 파티 🍖
  21:00 레크리에이션 1부 (아이스브레이킹 게임)
  23:00 야식 라면 & 자유시간

[Day 2] 액티비티 & 메인 이벤트 (MT의 하이라이트)
  09:30 해장 콩나물국 / 순두부찌개
  11:00 보문호수 액티비티 (자전거 / 오리배 / 경주월드 택1)
  13:00 보문단지 단체 쌈밥정식 점심
  15:00 황리단길 사진 미션 러닝맨 (벌칙 필수 😈)
  18:00 조별 요리 대회 (설거지 내기)
  20:00 메인 레크리에이션 (장기자랑, 마피아, 음주/무음주 게임)
  24:00 불멍 🔥 & 새벽 감성 토크

[Day 3] 정리 & 귀가 (깔끔한 마무리)
  10:00 기상 & 펜션 대청소 및 분리수거 (보증금 회수 필수!)
  11:00 체크아웃 & 해장 점심 (경주 밀면)
  12:30 카페 단체사진 정리 & MVP 시상식 🏆
  14:00 부산 출발 → 15:30 도착 및 해산
```

---

## 📱 주요 가이드 섹션

| 섹션 | 구분 | 주요 내용 및 특징 |
| :--- | :--- | :--- |
| **DAY 1~3** | `Schedule` | 시간대별 이동, 식사, 액티비티, 파티 상세 동선 및 단체 행동 팁 |
| **STAY** | `숙박 가이드` | 보문단지·천북면 20~30인 단체 독채 펜션 탐색 기준 및 필수 체크 항목(MT 소음 허용, 바비큐 시설, 보증금 조건) |
| **BUDGET** | `예산표` | 20명 기준 1인당 약 11만원 내외 산출 내역 (교통, 숙박 2박, 식비, 액티비티) |
| **CHECKLIST** | `준비물` | 신분증, 상비약, 보조배터리, 멀티탭, 블루투스 스피커 등 클릭 시 취소선이 그어지는 반응형 체크리스트 |
| **PLAN B** | `대안 코스` | 날씨나 일정 변경 시 고려 가능한 인근 대체 코스 (남해/사천 바다 코스, 밀양 계곡 물놀이) |

---

## 📁 프로젝트 구조 (Project Structure)

```text
0831/
├── Code.gs         # Google Apps Script 서버 코드 (doGet() 진입점 및 뷰포트/타이틀 설정)
├── index.html      # HTML 구조 + 임베디드 CSS 스타일 + Canvas/DOM JS 인터랙션 올인원
└── README.md       # 프로젝트 안내 및 문서화 (현재 파일)
```

---

## 🚀 실행 및 배포 가이드 (Getting Started)

### 1. 로컬 환경에서 바로 실행하기 (Local Browser)
외부 라이브러리 의존성 없이 순수 웹 표준 기술로만 작성되어 브라우저에서 바로 열 수 있습니다.
- Windows 파일 탐색기에서 `0831/index.html` 파일을 더블 클릭하여 실행하거나,
- VS Code / IDE의 `Live Server` 확장을 통해 실행:
  ```bash
  # npx serve 등으로 정적 서빙 실행 예시
  npx serve 0831
  ```

### 2. Google Apps Script (GAS) 웹앱으로 배포하기
1. [Google Drive](https://drive.google.com/)에서 **새로 만들기 > 더보기 > Google Apps Script**를 생성합니다.
2. `코드.gs`에 본 프로젝트의 `Code.gs` 내용을 붙여넣습니다.
3. 좌측 `+` 버튼을 눌러 HTML 파일(`index.html`)을 추가하고, 본 프로젝트의 `index.html` 내용을 복사하여 붙여넣습니다.
4. 우측 상단 **[배포] > [새 배포]**를 클릭합니다.
   - 유형 선택: **웹 앱 (Web App)**
   - 다음 사용자 모드로 실행: **나 (Me)**
   - 액세스 권한: **모든 사용자 (Anyone)**
5. 발급된 웹 앱 URL을 복사하여 팀원들에게 메신저(카카오톡, 슬랙 등)로 공유합니다.

---

## 💡 브라우저 호환성 (Browser Support)

- Chrome, Edge, Safari, Firefox 최신 버전 지원
- iOS Safari 및 Android Chrome 모바일 뷰포트 완벽 대응 (`height: 100dvh`, 반응형 그리드)
- WebGL 없이 2D Canvas 및 순수 CSS 트랜스폼으로 구동되어 저사양 모바일 기기에서도 원활하게 작동

---

## 📄 라이선스 (License)

This project is licensed under the [MIT License](LICENSE).
