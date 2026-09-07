/**
 * 팀 MT 2박3일 경주 코스 웹앱
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('GYEONGJU MT 2박3일 ｜ 팀 MT 가이드')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
