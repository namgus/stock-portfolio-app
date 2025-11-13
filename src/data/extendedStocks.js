// 확장된 주식 데이터 - 100+ 국내 주요 종목
export const extendedStocks = {
  // 추가 대형 우량주
  bluechip: [
    { ticker: '000270', name: '기아', sector: 'consumer', description: '현대차그룹 자동차 제조' },
    { ticker: '051910', name: 'LG화학', sector: 'energy', description: '배터리 및 화학 소재' },
    { ticker: '068270', name: '셀트리온', sector: 'healthcare', description: '바이오시밀러 선도' },
    { ticker: '096770', name: 'SK이노베이션', sector: 'energy', description: '배터리 및 석유화학' },
    { ticker: '003550', name: 'LG', sector: 'tech', description: 'LG그룹 지주사' },
    { ticker: '000810', name: '삼성화재', sector: 'finance', description: '손해보험 1위' },
    { ticker: '018260', name: '삼성에스디에스', sector: 'tech', description: 'IT서비스 및 솔루션' },
    { ticker: '028260', name: '삼성물산', sector: 'industrial', description: '종합상사 및 건설' },
    { ticker: '009150', name: '삼성전기', sector: 'tech', description: '전자부품 제조' },
    { ticker: '003670', name: '포스코홀딩스', sector: 'materials', description: '철강 및 소재' },
    { ticker: '010140', name: '삼성중공업', sector: 'industrial', description: '조선 및 해양플랜트' },
    { ticker: '034020', name: '두산에너빌리티', sector: 'energy', description: '발전설비 제조' },
    { ticker: '011200', name: 'HMM', sector: 'industrial', description: '해운 및 물류' },
    { ticker: '047810', name: '한국항공우주', sector: 'industrial', description: '항공우주 방산' },
    { ticker: '012450', name: '한화에어로스페이스', sector: 'industrial', description: '항공우주 방산' },
  ],

  // IT/기술주
  techStocks: [
    { ticker: '000660', name: 'SK하이닉스', sector: 'tech', description: '메모리 반도체' },
    { ticker: '035420', name: 'NAVER', sector: 'tech', description: '인터넷 플랫폼' },
    { ticker: '035720', name: '카카오', sector: 'tech', description: '모바일 플랫폼' },
    { ticker: '036570', name: '엔씨소프트', sector: 'tech', description: '게임 개발' },
    { ticker: '251270', name: '넷마블', sector: 'tech', description: '모바일 게임' },
    { ticker: '112040', name: '위메이드', sector: 'tech', description: '게임 및 블록체인' },
    { ticker: '263750', name: '펄어비스', sector: 'tech', description: '게임 개발' },
    { ticker: '376300', name: '디어유', sector: 'tech', description: '웹툰 플랫폼' },
    { ticker: '095660', name: '네오위즈', sector: 'tech', description: '게임 및 플랫폼' },
    { ticker: '042700', name: '한미반도체', sector: 'tech', description: '반도체 장비' },
    { ticker: '067310', name: '하나마이크론', sector: 'tech', description: '반도체 PKG' },
    { ticker: '058470', name: '리노공업', sector: 'tech', description: '반도체 부품' },
    { ticker: '084370', name: '유진테크', sector: 'tech', description: '반도체 장비' },
    { ticker: '222800', name: '심텍', sector: 'tech', description: 'PCB 제조' },
    { ticker: '091990', name: '셀트리온헬스케어', sector: 'healthcare', description: '바이오 유통' },
  ],

  // 바이오/헬스케어
  healthcareStocks: [
    { ticker: '207940', name: '삼성바이오로직스', sector: 'healthcare', description: '바이오 CMO' },
    { ticker: '068270', name: '셀트리온', sector: 'healthcare', description: '바이오시밀러' },
    { ticker: '091990', name: '셀트리온헬스케어', sector: 'healthcare', description: '바이오 유통' },
    { ticker: '302440', name: '셀트리온제약', sector: 'healthcare', description: '제약 및 바이오' },
    { ticker: '128940', name: '한미약품', sector: 'healthcare', description: '신약 개발' },
    { ticker: '185750', name: '종근당', sector: 'healthcare', description: '제약 종합' },
    { ticker: '009420', name: '한올바이오파마', sector: 'healthcare', description: '제약' },
    { ticker: '214450', name: '파마리서치', sector: 'healthcare', description: '신약 개발' },
    { ticker: '357780', name: '솔본', sector: 'healthcare', description: '의료 AI' },
    { ticker: '141080', name: '레고켐바이오', sector: 'healthcare', description: 'ADC 신약' },
    { ticker: '196170', name: '알테오젠', sector: 'healthcare', description: '바이오베터' },
    { ticker: '214150', name: '클래시스', sector: 'healthcare', description: '의료기기' },
    { ticker: '145020', name: '휴젤', sector: 'healthcare', description: '보톡스 및 필러' },
    { ticker: '086900', name: '메디톡스', sector: 'healthcare', description: '보톡스' },
    { ticker: '039200', name: '오스코텍', sector: 'healthcare', description: '정형외과 임플란트' },
  ],

  // 2차전지/에너지
  batteryStocks: [
    { ticker: '373220', name: 'LG에너지솔루션', sector: 'energy', description: '전기차 배터리 1위' },
    { ticker: '006400', name: '삼성SDI', sector: 'energy', description: '2차전지 및 전자재료' },
    { ticker: '247540', name: '에코프로비엠', sector: 'energy', description: '양극재' },
    { ticker: '086520', name: '에코프로', sector: 'energy', description: '양극재 소재' },
    { ticker: '150840', name: '에코프로에이치엔', sector: 'energy', description: '음극재' },
    { ticker: '066970', name: '엘앤에프', sector: 'energy', description: '양극재' },
    { ticker: '064760', name: '티씨케이', sector: 'energy', description: '음극재' },
    { ticker: '137400', name: '피엔티', sector: 'energy', description: '2차전지 장비' },
    { ticker: '298050', name: '효성첨단소재', sector: 'materials', description: '탄소섬유 및 소재' },
    { ticker: '020150', name: '일진머티리얼즈', sector: 'energy', description: '동박' },
    { ticker: '093370', name: '후성', sector: 'energy', description: '전해액' },
    { ticker: '005290', name: '동진쎄미켐', sector: 'energy', description: '전해액' },
    { ticker: '336370', name: '솔루스첨단소재', sector: 'energy', description: '동박' },
    { ticker: '011790', name: 'SKC', sector: 'materials', description: '배터리 분리막' },
    { ticker: '278280', name: '천보', sector: 'energy', description: '배터리 부품' },
  ],

  // 금융주
  financeStocks: [
    { ticker: '055550', name: '신한지주', sector: 'finance', description: '금융지주' },
    { ticker: '105560', name: 'KB금융', sector: 'finance', description: '금융지주' },
    { ticker: '086790', name: '하나금융지주', sector: 'finance', description: '금융지주' },
    { ticker: '316140', name: '우리금융지주', sector: 'finance', description: '금융지주' },
    { ticker: '000810', name: '삼성화재', sector: 'finance', description: '손해보험' },
    { ticker: '032830', name: '삼성생명', sector: 'finance', description: '생명보험' },
    { ticker: '003540', name: '대신증권', sector: 'finance', description: '증권' },
    { ticker: '029780', name: '삼성카드', sector: 'finance', description: '신용카드' },
    { ticker: '004370', name: '농심', sector: 'consumer', description: '식품' },
    { ticker: '006800', name: '미래에셋증권', sector: 'finance', description: '증권' },
  ],

  // ETF
  etfs: [
    { ticker: '069500', name: 'KODEX 200', sector: 'etf', description: 'KOSPI 200 추종' },
    { ticker: '360750', name: 'TIGER 미국S&P500', sector: 'etf', description: 'S&P 500 추종' },
    { ticker: '148070', name: 'KOSEF 국고채10년', sector: 'etf', description: '국고채 ETF' },
    { ticker: '102110', name: 'TIGER 200', sector: 'etf', description: 'KOSPI 200' },
    { ticker: '114800', name: 'KODEX 인버스', sector: 'etf', description: 'KOSPI 200 인버스' },
    { ticker: '122630', name: 'KODEX 레버리지', sector: 'etf', description: 'KOSPI 200 레버리지' },
    { ticker: '229200', name: 'KODEX 코스닥150', sector: 'etf', description: '코스닥 150' },
    { ticker: '091160', name: 'KODEX 반도체', sector: 'etf', description: '반도체 테마' },
    { ticker: '091180', name: 'KODEX 자동차', sector: 'etf', description: '자동차 테마' },
    { ticker: '091170', name: 'KODEX 은행', sector: 'etf', description: '은행 테마' },
  ]
};

// 모든 종목을 하나의 배열로 통합
export const getAllExtendedStocks = () => {
  return [
    ...extendedStocks.bluechip,
    ...extendedStocks.techStocks,
    ...extendedStocks.healthcareStocks,
    ...extendedStocks.batteryStocks,
    ...extendedStocks.financeStocks,
    ...extendedStocks.etfs
  ];
};

// 섹터별 종목 조회
export const getStocksBySector = (sector) => {
  const all = getAllExtendedStocks();
  return all.filter(stock => stock.sector === sector);
};

// 티커로 종목 검색
export const findStockByTicker = (ticker) => {
  const all = getAllExtendedStocks();
  return all.find(stock => stock.ticker === ticker);
};
