# 📚 교육자료 신청 웹앱 (Educational Material Request System)

<div align="center">

![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<br/>

**학생들의 교육자료 신청 정보를 간편하게 접수받아<br/>Google 스프레드시트에 실시간으로 자동 정리·누적하는 서버리스 웹 애플리케이션입니다.**

[📋 기능 개요](#-기능-개요) · [📊 스프레드시트 DB 구조](#-데이터베이스-스키마-google-sheets) · [⚙️ 동작 원리](#-동작-원리-및-api-명세) · [🚀 설치 및 배포 가이드](#-설치-및-배포-가이드-google-apps-script)

</div>

---

## 📖 프로젝트 개요 (Overview)

**`교육자료 신청 웹앱`**은 대학 강의, 세미나, 스터디 등에서 수강생들의 교육자료(교재, 실습 키트, 강의록 등) 신청을 손쉽게 접수받기 위해 설계된 시스템입니다.

Google Apps Script(GAS)를 백엔드로 활용하여 별도의 데이터베이스 서버나 인프라 구축 없이도 **Google 스프레드시트와 직접 양방향 연동**되며, 접수된 신청 내역이 즉시 시트의 행으로 누적됩니다.

---

## ✨ 핵심 기능

1. **간편한 신청서 인터페이스**:
   - 학번, 학과, 이름, 나이 등 핵심 신청자 정보 입력
   - 모바일 및 PC 뷰포트 최적화 (`width=device-width, initial-scale=1.0`)
2. **서버사이드 유효성 검증 (Data Validation)**:
   - 클라이언트뿐만 아니라 Apps Script 서버(`code.gs`) 레벨에서 필수 항목 누락 여부를 이중 점검하여 무결한 데이터만 저장
3. **Google Sheets 실시간 동기화**:
   - `SpreadsheetApp` API를 통해 제출 즉시 지정된 시트의 최하단에 행 추가 (`appendRow`)
4. **원클릭 웹앱 배포**:
   - Google Drive 내에서 URL 하나로 즉시 배포되어 카카오톡, LMS, 이메일로 손쉽게 링크 공유 가능

---

## 📊 데이터베이스 스키마 (Google Sheets)

스프레드시트 1행에 아래 헤더를 정의하며, 신청서 제출 시 순서에 맞게 행이 추가됩니다.

| 컬럼 순서 | 헤더명 | 필드명 | 필수 여부 | 설명 및 예시 |
| :---: | :--- | :--- | :---: | :--- |
| **A** | 학번 | `studentId` | **필수** | 신청자 학번 (예: `202112345`) |
| **B** | 학과 | `dept` | **필수** | 소속 학과명 (예: `컴퓨터공학과`) |
| **C** | 이름 | `name` | **필수** | 신청자 성명 (예: `홍길동`) |
| **D** | 나이 | `age` | **필수** | 신청자 연령 (예: `24`) |

---

## ⚙️ 동작 원리 및 API 명세

### 1. 진입점: `doGet()`
사용자가 웹 앱 URL로 접근 시 호출되며, 템플릿 파일인 `index.html`을 렌더링합니다.
```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('교육자료신청')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}
```

### 2. 신청 데이터 저장: `submitForm(formData)`
클라이언트(`index.html`)에서 `google.script.run`을 통해 서버로 `formData` 객체를 전송합니다.

- **요청 객체 (Request Body)**:
  ```json
  {
    "studentId": "202112345",
    "dept": "컴퓨터공학과",
    "name": "홍길동",
    "age": "24"
  }
  ```
- **응답 객체 (Response)**:
  - 성공 시: `{ "success": true }`
  - 실패 시: `{ "success": false, "error": "모든 항목을 입력해주세요." }`

---

## 📁 프로젝트 구조 (Project Structure)

```text
0901_교육자료신청/
├── code.gs         # Google Apps Script 서버 사이드 코드 (doGet & submitForm)
├── index.html      # 사용자 신청 화면 템플릿
└── README.md       # 프로젝트 안내 및 문서화 (현재 파일)
```

---

## 🚀 설치 및 배포 가이드 (Google Apps Script)

### 1. Google 스프레드시트 생성
1. [Google Drive](https://drive.google.com/)에서 새 스프레드시트를 생성합니다.
2. 스프레드시트명을 `[신청명단] 교육자료신청` 등으로 지정합니다.
3. 첫 번째 시트의 `A1:D1` 영역에 아래 헤더를 입력합니다:
   ```text
   학번 | 학과 | 이름 | 나이
   ```

### 2. Apps Script 프로젝트 설정
1. 스프레드시트 상단 메뉴에서 **[확장 프로그램] > [Apps Script]**를 클릭합니다.
2. `코드.gs` 파일에 본 저장소의 [`code.gs`](file:///c:/Users/ryufe/OneDrive/Desktop/HCJ-root/HCJ-root/0901/0901_%EA%B5%90%EC%9C%A1%EC%9E%90%EB%A3%8C%EC%8B%A0%EC%B2%AD/code.gs) 코드를 입력합니다.
   - *스프레드시트에 종속(bound)된 스크립트일 경우 `SpreadsheetApp.getActiveSpreadsheet()`가 자동으로 연결됩니다.*
   - *독립형(Standalone) 프로젝트일 경우 `SpreadsheetApp.openById('스프레드시트_ID')`를 사용하세요.*
3. 왼쪽 파일 목록의 `+` 버튼을 누르고 **[HTML]**을 선택한 뒤 파일명을 `index`로 생성합니다.
4. 생성된 `index.html`에 클라이언트 폼 코드를 붙여넣습니다.

### 3. 웹 앱 배포 (Deployment)
1. 화면 우측 상단의 **[배포] > [새 배포]**를 선택합니다.
2. 유형 선택: **웹 앱 (Web App)**
   - **설명:** `교육자료신청 웹앱 v1.0`
   - **다음 사용자 모드로 실행:** `나(본인 Google 계정)`
   - **액세스 권한이 있는 사용자:** `모든 사용자 (Anyone)`
3. **[배포]**를 클릭하고 계정 권한을 승인합니다.
4. 발급된 **웹 앱 URL**을 복사하여 학생 및 수강생들에게 안내합니다.

---

## 💡 유지보수 및 확장 팁

- **중복 신청 방지**: 필요한 경우 `code.gs`에서 `sheet.getDataRange().getValues()`를 통해 이미 등록된 `studentId`가 있는지 확인하는 로직을 추가할 수 있습니다.
- **신청 마감 처리**: 정원 초과 또는 기한 마감 시 `doGet()`에서 마감 안내 화면을 반환하도록 설정할 수 있습니다.

---

## 📄 라이선스 (License)

This project is licensed under the [MIT License](LICENSE).
