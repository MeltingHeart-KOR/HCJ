/**
 * Favor - 음료 선호조사 설문 웹앱 (서버 사이드)
 * DB 헤더: 제출시각 | 이름 | 나이 | 성별 | 국적 | 이메일 |
 *          선호 음료 종류 | 선호하는 맛 | 선호 온도 | 당도 선호도 |
 *          탄산 선호도 | 카페인 선호 | 구매 빈도 | 신제품에 바라는 점
 */

// 웹앱 접속 시 index.html 화면 반환
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Favor - 음료 선호조사')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// 설문 데이터를 시트에 저장
function submitSurvey(data) {
  try {
    // 스프레드시트에 종속(bound)된 스크립트일 경우
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ※ 독립형 스크립트라면 위 줄 대신 아래 줄 사용 (ID 교체)
    // const ss = SpreadsheetApp.openById('여기에_스프레드시트_ID_입력');

    const sheet = ss.getSheets()[0];

    // 서버 측 유효성 검사 (이중 방어)
    const required = ['name', 'age', 'gender', 'nationality', 'email',
                      'drinkType', 'taste', 'temperature', 'sweetness',
                      'carbonation', 'caffeine', 'frequency'];
    for (const key of required) {
      if (!data[key]) {
        return { success: false, error: '필수 항목이 누락되었습니다.' };
      }
    }

    // ★ 헤더 순서와 동일하게 저장
    sheet.appendRow([
      new Date(),                      // 제출시각 (서버 자동 기록)
      data.name.trim(),                // 이름
      data.age,                        // 나이
      data.gender,                     // 성별
      data.nationality.trim(),         // 국적
      data.email.trim(),               // 이메일
      data.drinkType,                  // 선호 음료 종류
      data.taste,                      // 선호하는 맛
      data.temperature,                // 선호 온도
      data.sweetness,                  // 당도 선호도 (1~5)
      data.carbonation,                // 탄산 선호도 (1~5)
      data.caffeine,                   // 카페인 선호
      data.frequency,                  // 구매 빈도
      data.comment ? data.comment.trim() : ''  // 신제품에 바라는 점 (선택)
    ]);

    return { success: true };
  } catch (e) {
    return { success: false, error: '저장 중 오류가 발생했습니다: ' + e.message };
  }
}
