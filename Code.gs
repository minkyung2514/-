/**
 * AI 오답노트 & 학습 플래너 Google Apps Script (GAS) 백엔드
 */

// 1. 웹 앱 접속 시 실행 (HTML 페이지 랜더링)
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('AI 오답노트 & 학습 플래너')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 2. HTML 파일 포함용 헬퍼 함수
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 3. 오답 데이터 저장 API (시트 DB에 기록)
function saveWrongAnswer(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('WrongAnswers');
    
    // 시트가 없으면 기본 헤더 자동 생성
    if (!sheet) {
      sheet = ss.insertSheet('WrongAnswers');
      sheet.appendRow(['ID', '학교급', '과목', '단원', '난이도', '오답내용', '등록일시']);
    }
    
    var id = 'ERR_' + new Date().getTime();
    var timestamp = new Date().toLocaleString();
    
    sheet.appendRow([
      id,
      data.schoolLevel,
      data.subject,
      data.unit,
      data.difficulty,
      data.content,
      timestamp
    ]);
    
    return { status: 'success', message: '오답 데이터가 성공적으로 저장되었습니다.', id: id };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

// 4. 저장된 오답 목록 및 취약점 통계 데이터 불러오기 API
function getWrongAnswers(schoolLevel) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('WrongAnswers');
    if (!sheet) return { status: 'success', data: [], statistics: {} };
    
    var rows = sheet.getDataRange().getValues();
    var result = [];
    var unitCount = {};
    
    // 헤더 제외하고 데이터 추출
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!schoolLevel || row[1] === schoolLevel) {
        var item = {
          id: row[0],
          schoolLevel: row[1],
          subject: row[2],
          unit: row[3],
          difficulty: row[4],
          content: row[5],
          date: row[6]
        };
        result.push(item);
        
        // 단원별 취약점 통계 계산
        unitCount[row[3]] = (unitCount[row[3]] || 0) + 1;
      }
    }
    
    return { status: 'success', data: result, statistics: unitCount };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

// 5. 모의 AI OCR 분석 및 단원 추론 함수
function processAIOCR(imageText) {
  // 간단한 키워드 기반 단원 분류 규칙 모의 시뮬레이션
  var result = {
    detectedSubject: '수학',
    detectedUnit: '기초 개념',
    confidence: '94%'
  };
  
  if (imageText.indexOf('미분') !== -1 || imageText.indexOf('접선') !== -1) {
    result.detectedSubject = '수학 II';
    result.detectedUnit = '미분법';
  } else if (imageText.indexOf('적분') !== -1 || imageText.indexOf('넓이') !== -1) {
    result.detectedSubject = '수학 II';
    result.detectedUnit = '적분법';
  } else if (imageText.indexOf('분수') !== -1 || imageText.indexOf('소수') !== -1) {
    result.detectedSubject = '초등 수학';
    result.detectedUnit = '분수와 소수';
  } else if (imageText.indexOf('방정식') !== -1) {
    result.detectedSubject = '중등 수학';
    result.detectedUnit = '일차방정식';
  }
  
  return result;
}
