export const stocks = {
  // 배당주 (보수적)
  dividendStocks: [
    {
      ticker: '005930',
      name: '삼성전자',
      sector: 'tech',
      dividendYield: 2.5,
      per: 12.5,
      roe: 8.2,
      type: 'dividend',
      description: '반도체 및 전자제품 글로벌 리더'
    },
    {
      ticker: '000660',
      name: 'SK하이닉스',
      sector: 'tech',
      dividendYield: 1.8,
      per: 15.3,
      roe: 7.5,
      type: 'dividend',
      description: '메모리 반도체 전문 기업'
    },
    {
      ticker: '055550',
      name: '신한지주',
      sector: 'finance',
      dividendYield: 4.2,
      per: 5.8,
      roe: 9.1,
      type: 'dividend',
      description: '국내 대표 금융지주사'
    },
    {
      ticker: '105560',
      name: 'KB금융',
      sector: 'finance',
      dividendYield: 4.8,
      per: 6.2,
      roe: 10.3,
      type: 'dividend',
      description: '국민은행 중심의 금융지주'
    },
    {
      ticker: '033780',
      name: 'KT&G',
      sector: 'consumer',
      dividendYield: 5.1,
      per: 9.2,
      roe: 12.5,
      type: 'dividend',
      description: '담배 및 건강기능식품'
    },
    {
      ticker: '086790',
      name: '하나금융지주',
      sector: 'finance',
      dividendYield: 4.5,
      per: 5.5,
      roe: 9.8,
      type: 'dividend',
      description: '하나은행 중심의 금융지주'
    },
    {
      ticker: '316140',
      name: '우리금융지주',
      sector: 'finance',
      dividendYield: 4.3,
      per: 5.2,
      roe: 8.9,
      type: 'dividend',
      description: '우리은행 중심의 금융지주'
    },
    {
      ticker: '015760',
      name: '한국전력',
      sector: 'energy',
      dividendYield: 3.2,
      per: 8.1,
      roe: 5.5,
      type: 'dividend',
      description: '국내 전력 공급 독점 기업'
    },
    {
      ticker: '017670',
      name: 'SK텔레콤',
      sector: 'telecom',
      dividendYield: 4.8,
      per: 7.8,
      roe: 11.2,
      type: 'dividend',
      description: '국내 1위 통신사'
    },
    {
      ticker: '030200',
      name: 'KT',
      sector: 'telecom',
      dividendYield: 5.2,
      per: 6.9,
      roe: 10.5,
      type: 'dividend',
      description: '국내 2위 통신사'
    },
    {
      ticker: '032830',
      name: '삼성생명',
      sector: 'finance',
      dividendYield: 3.8,
      per: 7.2,
      roe: 8.1,
      type: 'dividend',
      description: '국내 1위 생명보험사'
    },
    {
      ticker: '010130',
      name: '고려아연',
      sector: 'materials',
      dividendYield: 2.9,
      per: 9.5,
      roe: 12.8,
      type: 'dividend',
      description: '비철금속 제련 선도기업'
    },
    {
      ticker: '009540',
      name: '한국조선해양',
      sector: 'industrial',
      dividendYield: 3.5,
      per: 10.2,
      roe: 9.3,
      type: 'dividend',
      description: '조선 및 해양 플랜트'
    },
    {
      ticker: '010950',
      name: 'S-Oil',
      sector: 'energy',
      dividendYield: 4.1,
      per: 8.8,
      roe: 10.9,
      type: 'dividend',
      description: '석유 정제 및 석유화학'
    },
    {
      ticker: '012330',
      name: '현대모비스',
      sector: 'consumer',
      dividendYield: 3.2,
      per: 9.1,
      roe: 8.7,
      type: 'dividend',
      description: '자동차 부품 선도기업'
    }
  ],

  // 대형주 (중립)
  largeCapStocks: [
    {
      ticker: '005930',
      name: '삼성전자',
      sector: 'tech',
      per: 12.5,
      roe: 8.2,
      type: 'largeCap',
      description: '반도체 및 전자제품 글로벌 리더'
    },
    {
      ticker: '035420',
      name: 'NAVER',
      sector: 'tech',
      per: 28.3,
      roe: 11.2,
      type: 'largeCap',
      description: '국내 최대 검색포털 및 IT기업'
    },
    {
      ticker: '005380',
      name: '현대차',
      sector: 'consumer',
      per: 7.8,
      roe: 9.5,
      type: 'largeCap',
      description: '글로벌 완성차 제조업체'
    },
    {
      ticker: '051910',
      name: 'LG화학',
      sector: 'energy',
      per: 15.2,
      roe: 7.8,
      type: 'largeCap',
      description: '배터리 및 화학 소재 선도기업'
    },
    {
      ticker: '006400',
      name: '삼성SDI',
      sector: 'energy',
      per: 18.5,
      roe: 6.5,
      type: 'largeCap',
      description: '2차전지 및 전자재료'
    }
  ],

  // 성장주 (공격적)
  growthStocks: [
    {
      ticker: '035720',
      name: '카카오',
      sector: 'tech',
      per: 45.2,
      roe: 5.3,
      type: 'growth',
      description: '모바일 플랫폼 선도기업'
    },
    {
      ticker: '035420',
      name: 'NAVER',
      sector: 'tech',
      per: 28.3,
      roe: 11.2,
      type: 'growth',
      description: '국내 최대 검색포털'
    },
    {
      ticker: '207940',
      name: '삼성바이오로직스',
      sector: 'healthcare',
      per: 52.8,
      roe: 8.9,
      type: 'growth',
      description: '바이오의약품 CMO'
    },
    {
      ticker: '068270',
      name: '셀트리온',
      sector: 'healthcare',
      per: 38.5,
      roe: 14.2,
      type: 'growth',
      description: '바이오시밀러 선도기업'
    },
    {
      ticker: '373220',
      name: 'LG에너지솔루션',
      sector: 'energy',
      per: 35.6,
      roe: 9.8,
      type: 'growth',
      description: '전기차 배터리 글로벌 1위'
    },
    {
      ticker: '247540',
      name: '에코프로비엠',
      sector: 'energy',
      per: 42.1,
      roe: 18.5,
      type: 'growth',
      description: '양극재 소재 전문기업'
    }
  ],

  // ETF
  etfs: [
    {
      ticker: '069500',
      name: 'KODEX 200',
      sector: 'etf',
      type: 'etf',
      description: 'KOSPI 200 추종 ETF'
    },
    {
      ticker: '360750',
      name: 'TIGER 미국S&P500',
      sector: 'etf',
      type: 'etf',
      description: 'S&P 500 추종 ETF'
    },
    {
      ticker: '148070',
      name: 'KOSEF 국고채10년',
      sector: 'etf',
      type: 'etf',
      description: '국고채 10년물 ETF'
    }
  ]
};

export const getSectorStocks = (sector) => {
  const allStocks = [
    ...stocks.dividendStocks,
    ...stocks.largeCapStocks,
    ...stocks.growthStocks
  ];

  return allStocks.filter(stock => stock.sector === sector);
};

/**
 * Yahoo Finance API에서 실시간 가격 데이터를 가져와 포트폴리오 업데이트
 * @param {Array} portfolio - 포트폴리오 배열
 * @param {Object} yahooData - Yahoo Finance에서 가져온 데이터
 * @returns {Array} 업데이트된 포트폴리오
 */
export const updatePortfolioWithYahooData = (portfolio, yahooData) => {
  if (!yahooData || Object.keys(yahooData).length === 0) {
    return portfolio;
  }

  return portfolio.map(stock => {
    const apiData = yahooData[stock.ticker];
    if (apiData && apiData.price) {
      return {
        ...stock,
        price: apiData.price,
        previousClose: apiData.previousClose,
        open: apiData.open,
        dayHigh: apiData.dayHigh,
        dayLow: apiData.dayLow,
        volume: apiData.volume,
        marketCap: apiData.marketCap,
        fiftyTwoWeekHigh: apiData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: apiData.fiftyTwoWeekLow,
        dividendYield: apiData.dividendYield || stock.dividendYield,
        per: apiData.trailingPE || stock.per,
        priceToBook: apiData.priceToBook,
        lastUpdated: apiData.lastUpdated
      };
    }
    return stock;
  });
};

/**
 * API에서 실시간 가격 데이터를 가져와 포트폴리오 업데이트 (이전 버전 호환)
 * @param {Array} portfolio - 포트폴리오 배열
 * @param {Object} apiPrices - API에서 가져온 가격 데이터
 * @returns {Array} 업데이트된 포트폴리오
 */
export const updatePortfolioWithApiPrices = (portfolio, apiPrices) => {
  if (!apiPrices || Object.keys(apiPrices).length === 0) {
    return portfolio;
  }

  return portfolio.map(stock => {
    const apiData = apiPrices[stock.ticker];
    if (apiData && apiData.closePrice) {
      return {
        ...stock,
        price: apiData.closePrice,
        marketPrice: apiData.marketPrice,
        highPrice: apiData.highPrice,
        lowPrice: apiData.lowPrice,
        volume: apiData.volume,
        lastUpdated: apiData.baseDate
      };
    }
    return stock;
  });
};

/**
 * 포트폴리오에서 모든 고유 종목코드 추출
 * @param {Array} portfolio - 포트폴리오 배열
 * @returns {Array} 고유 종목코드 배열
 */
export const extractStockCodes = (portfolio) => {
  const codes = new Set();
  portfolio.forEach(stock => {
    if (stock.ticker) {
      codes.add(stock.ticker);
    }
  });
  return Array.from(codes);
};

/**
 * 모든 주식 데이터를 하나의 배열로 통합 (확장 데이터 포함)
 * @returns {Array} 모든 주식 배열
 */
export const getAllStocks = () => {
  return [
    ...stocks.dividendStocks,
    ...stocks.largeCapStocks,
    ...stocks.growthStocks,
    ...stocks.etfs
  ];
};

/**
 * 티커로 주식 검색
 * @param {string} ticker - 종목 코드
 * @returns {Object|null} 주식 객체 또는 null
 */
export const findStockByTicker = (ticker) => {
  const allStocks = getAllStocks();
  return allStocks.find(stock => stock.ticker === ticker) || null;
};
