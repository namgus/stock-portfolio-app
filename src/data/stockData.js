export const stocks = {
  // 배당주 (보수적)
  dividendStocks: [
    {
      ticker: '005930',
      name: '삼성전자',
      sector: 'tech',
      price: 71000,
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
      price: 132000,
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
      price: 42500,
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
      price: 62000,
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
      price: 85000,
      dividendYield: 5.1,
      per: 9.2,
      roe: 12.5,
      type: 'dividend',
      description: '담배 및 건강기능식품'
    }
  ],

  // 대형주 (중립)
  largeCapStocks: [
    {
      ticker: '005930',
      name: '삼성전자',
      sector: 'tech',
      price: 71000,
      per: 12.5,
      roe: 8.2,
      type: 'largeCap',
      description: '반도체 및 전자제품 글로벌 리더'
    },
    {
      ticker: '035420',
      name: 'NAVER',
      sector: 'tech',
      price: 225000,
      per: 28.3,
      roe: 11.2,
      type: 'largeCap',
      description: '국내 최대 검색포털 및 IT기업'
    },
    {
      ticker: '005380',
      name: '현대차',
      sector: 'consumer',
      price: 190000,
      per: 7.8,
      roe: 9.5,
      type: 'largeCap',
      description: '글로벌 완성차 제조업체'
    },
    {
      ticker: '051910',
      name: 'LG화학',
      sector: 'energy',
      price: 420000,
      per: 15.2,
      roe: 7.8,
      type: 'largeCap',
      description: '배터리 및 화학 소재 선도기업'
    },
    {
      ticker: '006400',
      name: '삼성SDI',
      sector: 'energy',
      price: 385000,
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
      price: 48500,
      per: 45.2,
      roe: 5.3,
      type: 'growth',
      description: '모바일 플랫폼 선도기업'
    },
    {
      ticker: '035420',
      name: 'NAVER',
      sector: 'tech',
      price: 225000,
      per: 28.3,
      roe: 11.2,
      type: 'growth',
      description: '국내 최대 검색포털'
    },
    {
      ticker: '207940',
      name: '삼성바이오로직스',
      sector: 'healthcare',
      price: 850000,
      per: 52.8,
      roe: 8.9,
      type: 'growth',
      description: '바이오의약품 CMO'
    },
    {
      ticker: '068270',
      name: '셀트리온',
      sector: 'healthcare',
      price: 178000,
      per: 38.5,
      roe: 14.2,
      type: 'growth',
      description: '바이오시밀러 선도기업'
    },
    {
      ticker: '373220',
      name: 'LG에너지솔루션',
      sector: 'energy',
      price: 425000,
      per: 35.6,
      roe: 9.8,
      type: 'growth',
      description: '전기차 배터리 글로벌 1위'
    },
    {
      ticker: '247540',
      name: '에코프로비엠',
      sector: 'energy',
      price: 315000,
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
      price: 38500,
      type: 'etf',
      description: 'KOSPI 200 추종 ETF'
    },
    {
      ticker: '360750',
      name: 'TIGER 미국S&P500',
      sector: 'etf',
      price: 15200,
      type: 'etf',
      description: 'S&P 500 추종 ETF'
    },
    {
      ticker: '148070',
      name: 'KOSEF 국고채10년',
      sector: 'etf',
      price: 105500,
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
 * API에서 실시간 가격 데이터를 가져와 포트폴리오 업데이트
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
