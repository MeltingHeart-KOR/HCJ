/**
 * 교육자료신청 웹앱 - 서버 사이드 코드
 * DB 헤더: 학번 | 학과 | 이름 | 나이
 */

// 웹앱 접속 시 index.html 화면 반환
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('교육자료신청')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// 폼 데이터를 시트에 저장
function submitForm(formData) {
  try {
    // 스프레드시트에 종속(bound)된 스크립트일 경우
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ※ 독립형 스크립트라면 위 줄 대신 아래 줄 사용 (ID 교체)
    // const ss = SpreadsheetApp.openById('여기에_스프레드시트_ID_입력');

    const sheet = ss.getSheets()[0]; // 첫 번째 시트 사용

    // 서버 측 유효성 검사 (이중 방어)
    if (!formData.studentId || !formData.dept || !formData.name || !formData.age) {
      return { success: false, error: '모든 항목을 입력해주세요.' };
    }

    // ★ 헤더 순서와 동일하게 저장: 학번 | 학과 | 이름 | 나이
    sheet.appendRow([
      formData.studentId.trim(),
      formData.dept.trim(),
      formData.name.trim(),
      formData.age.trim()
    ]);

    return { success: true };
  } catch (e) {
    return { success: false, error: '저장 중 오류가 발생했습니다: ' + e.message };
  }
}
