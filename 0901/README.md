# 🍹 Favor — 음료 선호조사 반응형 설문 웹앱

<div align="center">

![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<br/>

**소비자의 음료 음용 습관과 취향 데이터를 직관적인 모바일 퍼스트 UI로 수집하고,<br/>Google Spreadsheet에 실시간으로 자동 축적하는 서버리스 설문 웹 애플리케이션입니다.**

[📋 설문 흐름 & 기능](#-주요-기능-및-설문-흐름) · [📊 스프레드시트 DB 구조](#-데이터베이스-스키마-google-sheets) · [🛠️ 기술 스택](#-기술-스택-tech-stack) · [🚀 설치 및 배포 가이드](#-설치-및-배포-가이드-google-apps-script)

</div>

---

## 📖 프로젝트 개요 (Overview)

**`Favor`**는 신제품 음료 기획 및 시장 조사를 위해 제작된 반응형 설문 웹앱입니다. 

사용자가 복잡한 로그인 없이도 스마트폰이나 PC에서 쾌적하게 설문에 참여할 수 있도록 2단계 단계형(Step-by-step) 인터페이스와 부드러운 인터랙션을 제공하며, 제출된 모든 응답은 **Google Apps Script(GAS)** API를 통해 연동된 **Google Spreadsheet**에 지연 없이 안전하게 자동 누적됩니다.

---

## ✨ 주요 기능 및 설문 흐름

```
[ 접속 ] ────────> [ STEP 1: 기본 정보 ] ────────> [ STEP 2: 음료 취향 ] ────────> [ 완료 화면 ]
웹앱 진입             · 이름, 나이, 성별              · 음료 종류, 선호 맛             · 제출 완료 안내
상단 프로그레스바     · 국적, 이메일 주소              · 온도, 당도/탄산 슬라이더        · 처음으로 리셋 버튼
(진행률 50%)          · 필수값 유효성 검사             · 카페인, 구매빈도, 건의의견      (새 설문 작성)
                                                      · 서버 비동기 전송
```

### 1. 📱 모바일 퍼스트 & 단계형(Step-by-Step) UI
- **상단 프로그레스 바**: 설문 진행 단계(Step 1 ➜ Step 2 ➜ 완료)에 따라 부드러운 그라데이션 게이지 애니메이션 제공
- **직관적인 칩(Chip) 라디오 버튼**: 선택 시 커스텀 과즙 그라데이션(`gradient-juice`)과 입체적인 확대(`scale(1.05)`) 인터랙션 적용
- **실시간 레인지 슬라이더 (Range Slider)**: 당도와 탄산감을 1~5단계로 섬세하게 조절하며 실시간으로 라벨 텍스트 변경
- **단일 페이지 전환 (SPA Experience)**: 페이지 새로고침 없이 DOM 요소를 유기적으로 전환하여 매끄러운 응답 경험 지원

### 2. 🛡️ 클라이언트 & 서버 이중 유효성 검증
- **프론트엔드 검증**: 필수 입력 필드 누락 및 이메일 형식 정규식(`^[^\s@]+@[^\s@]+\.[^\s@]+$`) 검증
- **서버사이드 방어**: Google Apps Script(`code.gs`) 내부에서 필수 키(`required`)를 재검사하여 비정상적이거나 조작된 요청 차단
- **전송 상태 피드백**: 버튼 비활성화 및 로딩 인디케이터(`전송 중...`)를 통해 중복 제출 방지

---

## 📊 데이터베이스 스키마 (Google Sheets)

설문이 제출되면 시트의 최하단에 새로운 행으로 실시간 추가됩니다.

| 컬럼 순서 | 헤더명 | 필드명 | 데이터 타입 | 설명 및 예시 |
| :---: | :--- | :--- | :---: | :--- |
| **A** | 제출시각 | `Date` | Timestamp | 서버 시각 자동 기록 (`new Date()`) |
| **B** | 이름 | `name` | String | 응답자 성명 |
| **C** | 나이 | `age` | Number | 응답자 연령대 |
| **D** | 성별 | `gender` | String | 남성 / 여성 / 기타 |
| **E** | 국적 | `nationality` | String | 응답자 국적 |
| **F** | 이메일 | `email` | String | 연락 가능한 이메일 주소 |
| **G** | 선호 음료 종류 | `drinkType` | String | 커피, 탄산음료, 주스/에이드, 차(Tea), 에너지음료 등 |
| **H** | 선호하는 맛 | `taste` | String | 달콤한, 상큼한/새콤한, 깔끔한/담백한, 쌉싸름한 등 |
| **I** | 선호 온도 | `temperature` | String | 차갑게 (ICE) / 따뜻하게 (HOT) / 상관없음 |
| **J** | 당도 선호도 | `sweetness` | Number (1~5) | 1(달지 않음) ~ 5(매우 달콤함) |
| **K** | 탄산 선호도 | `carbonation` | Number (1~5) | 1(무탄산) ~ 5(강한 탄산) |
| **L** | 카페인 선호 | `caffeine` | String | 필수 / 상관없음 / 디카페인 선호 |
| **M** | 구매 빈도 | `frequency` | String | 매일 / 주 3~4회 / 주 1~2회 / 거의 안 마심 |
| **N** | 신제품에 바라는 점 | `comment` | String | 자유 서술형 건의의견 (선택 입력) |

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend & Database
- **Backend Runtime:** [Google Apps Script (GAS)](https://developers.google.com/apps-script)
- **Database:** [Google Sheets (스프레드시트)](https://www.google.com/sheets/about/)
- **Client-Server 통신:** `google.script.run` (비동기 RPC 통신)

### Frontend & UI
- **Language:** HTML5, Vanilla JavaScript (ES6+)
- **Styling:** [Tailwind CSS CDN](https://tailwindcss.com/) (Forms & Container Queries 플러그인)
- **Design System:** Material Design 3 테마 토큰, 과즙 선형 그라데이션, 글래스모피즘
- **Typography & Icons:** Google Inter Font, [Google Material Symbols Outlined](https://fonts.google.com/icons)

---

## 📁 프로젝트 구조 (Project Structure)

```text
0901/
├── code.gs                 # Google Apps Script 서버 사이드 코드 (doGet & submitSurvey)
├── index.html              # 설문 화면 구조, Tailwind 스타일, 클라이언트 상호작용 로직
├── 0901_교육자료신청/       # [서브 프로젝트] 교육자료 신청 웹앱 폴더
└── README.md               # 프로젝트 안내 및 문서 (현재 파일)
```

---

## 🚀 설치 및 배포 가이드 (Google Apps Script)

### 1. 스프레드시트 준비
1. [Google Drive](https://drive.google.com/)에서 새 **Google 스프레드시트**를 생성합니다.
2. 1행에 아래 헤더를 순서대로 입력합니다:
   ```text
   제출시각 | 이름 | 나이 | 성별 | 국적 | 이메일 | 선호 음료 종류 | 선호하는 맛 | 선호 온도 | 당도 선호도 | 탄산 선호도 | 카페인 선호 | 구매 빈도 | 신제품에 바라는 점
   ```

### 2. Apps Script 프로젝트 생성 및 코드 반영
1. 스프레드시트 상단 메뉴에서 **[확장 프로그램] > [Apps Script]**를 클릭합니다.
2. `코드.gs` 파일에 본 프로젝트의 [`code.gs`](file:///c:/Users/ryufe/OneDrive/Desktop/HCJ-root/HCJ-root/0901/code.gs) 내용을 복사하여 붙여넣습니다.
3. 좌측 파일 탐색기 `+` 버튼 클릭 > **[HTML]** 선택 후 파일명을 `index`로 생성합니다.
4. 새로 생성된 `index.html`에 본 프로젝트의 [`index.html`](file:///c:/Users/ryufe/OneDrive/Desktop/HCJ-root/HCJ-root/0901/index.html) 내용을 복사하여 붙여넣습니다.

### 3. 웹 앱 배포 (Deploy)
1. 우측 상단 **[배포] > [새 배포]** 버튼을 클릭합니다.
2. 톱니바퀴 아이콘을 눌러 **[웹 앱]** 유형을 선택합니다.
   - **설명:** `Favor 음료 선호조사 v1`
   - **다음 사용자 모드로 실행:** `나(본인 이메일 계정)`
   - **액세스 권한이 있는 사용자:** `모든 사용자 (Anyone)`
3. **[배포]** 버튼을 누르고 최초 권한 승인 창에서 계정 접근을 허용합니다.
4. 생성된 **웹 앱 URL**을 복사하여 모바일 또는 웹 브라우저에서 테스트 및 공유합니다.

---

## 💡 주요 에러 핸들링 & UX 세부 구현

- **중복 제출 방지**: 제출 버튼 클릭 즉시 버튼을 `disabled` 처리하고 `전송 중...`으로 텍스트 변경
- **에러 메시지 팝업**: 네트워크 지연 또는 필수 항목 누락 시 인라인 경고 배너 표출
- **원클릭 초기화 (처음으로)**: 제출 완료 후 새 설문 작성을 위해 모든 필드, 슬라이더 기본값(3단계), 에러 상태를 초기화하고 Step 1 화면으로 리셋

---

## 📄 라이선스 (License)

This project is licensed under the [MIT License](LICENSE).
