import { stocks, getSectorStocks } from '../data/stockData';

export const generatePortfolio = (surveyData) => {
  const { riskTolerance, investmentPeriod, preferredSectors, investmentAmount, userProfile } = surveyData;

  let portfolio = [];
  let strategy = '';

  // 보수적 투자자
  if (riskTolerance === 'conservative') {
    strategy = '안정적인 배당 수익을 중심으로 한 보수적 포트폴리오';
    portfolio = [
      ...selectStocks(stocks.dividendStocks, 5, preferredSectors),
      { ...stocks.etfs[2], allocation: 30 } // 국고채 ETF 30%
    ];

    // 배당주 70% 분배
    const dividendAllocation = 70;
    portfolio.forEach((stock, index) => {
      if (stock.type === 'dividend') {
        portfolio[index].allocation = dividendAllocation / 5;
      }
    });
  }
  // 중립 투자자
  else if (riskTolerance === 'moderate') {
    strategy = '안정성과 성장성의 균형을 맞춘 포트폴리오';
    const largeCapStocks = selectStocks(stocks.largeCapStocks, 3, preferredSectors);

    // 이미 선택된 종목 제외
    const selectedTickers = new Set(largeCapStocks.map(s => s.ticker));
    const availableGrowthStocks = stocks.growthStocks.filter(
      s => !selectedTickers.has(s.ticker)
    );
    const growthStocks = selectStocks(availableGrowthStocks, 2, preferredSectors);
    const etfStock = stocks.etfs[0]; // KODEX 200

    portfolio = [
      ...largeCapStocks.map(stock => ({ ...stock, allocation: 50 / 3 })),
      ...growthStocks.map(stock => ({ ...stock, allocation: 30 / 2 })),
      { ...etfStock, allocation: 20 }
    ];
  }
  // 공격적 투자자
  else if (riskTolerance === 'aggressive') {
    strategy = '높은 성장성을 추구하는 공격적 포트폴리오';
    const growthStocks = selectStocks(stocks.growthStocks, 5, preferredSectors);

    // 이미 선택된 종목 제외
    const selectedTickers = new Set(growthStocks.map(s => s.ticker));
    const availableStocks = [...stocks.growthStocks, ...stocks.largeCapStocks].filter(
      s => !selectedTickers.has(s.ticker)
    );
    const midCapStocks = selectStocks(availableStocks, 3, preferredSectors);

    portfolio = [
      ...growthStocks.map(stock => ({ ...stock, allocation: 60 / 5 })),
      ...midCapStocks.map(stock => ({ ...stock, allocation: 40 / 3 }))
    ];
  }

  // ISA 계좌 추천
  const isaRecommendation = getISARecommendation(userProfile, riskTolerance);

  // 포트폴리오 총평
  const summary = generateSummary(portfolio, riskTolerance, investmentPeriod);

  return {
    portfolio: normalizeAllocations(portfolio),
    strategy,
    isaRecommendation,
    summary,
    riskLevel: getRiskLevel(riskTolerance),
    expectedReturn: getExpectedReturn(riskTolerance, investmentPeriod)
  };
};

const selectStocks = (stockList, count, preferredSectors) => {
  let filteredStocks = [...stockList];

  // 선호 섹터 필터링
  if (preferredSectors && preferredSectors.length > 0 && !preferredSectors.includes('nopreference')) {
    const sectorFiltered = filteredStocks.filter(stock =>
      preferredSectors.includes(stock.sector)
    );

    // 선호 섹터에 종목이 충분하면 사용, 아니면 전체에서 선택
    if (sectorFiltered.length >= count) {
      filteredStocks = sectorFiltered;
    }
  }

  // 중복 제거 (ticker 기준)
  const uniqueStocks = [];
  const seenTickers = new Set();

  for (const stock of filteredStocks) {
    if (!seenTickers.has(stock.ticker)) {
      uniqueStocks.push(stock);
      seenTickers.add(stock.ticker);
    }
  }

  // 랜덤 선택하되 다양성 보장
  const selected = [];
  const shuffled = [...uniqueStocks].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    selected.push({ ...shuffled[i] });
  }

  return selected;
};

const normalizeAllocations = (portfolio) => {
  const total = portfolio.reduce((sum, stock) => sum + (stock.allocation || 0), 0);

  if (total === 0) {
    // 비율이 없으면 균등 분배
    const equalAllocation = 100 / portfolio.length;
    return portfolio.map(stock => ({ ...stock, allocation: equalAllocation }));
  }

  // 100%로 정규화
  return portfolio.map(stock => ({
    ...stock,
    allocation: (stock.allocation / total) * 100
  }));
};

const getISARecommendation = (userProfile, riskTolerance) => {
  const age = parseInt(userProfile.age) || 30;
  const income = userProfile.income;

  let isaType = '';
  let taxBenefit = 0;
  let recommendation = '';

  // ISA 자격 판단
  if (income === 'under5000') {
    isaType = 'ISA 서민형';
    taxBenefit = 400;
    recommendation = '연 소득 5,000만원 이하로 서민형 ISA 자격이 있습니다. 수익금 400만원까지 비과세 혜택을 받을 수 있습니다.';
  } else if (income === '5000to8000') {
    isaType = 'ISA 일반형';
    taxBenefit = 200;
    recommendation = '일반형 ISA 계좌를 통해 수익금 200만원까지 비과세 혜택을 받을 수 있습니다.';
  } else {
    isaType = 'ISA 일반형';
    taxBenefit = 200;
    recommendation = '일반형 ISA 계좌를 개설하여 절세 혜택을 누리세요. 일반 계좌 대비 세율이 9.9%로 낮습니다.';
  }

  // 계좌 구조 추천
  let accountStructure = '';
  if (riskTolerance === 'conservative') {
    accountStructure = 'ISA 계좌 80% (배당주 중심) + 일반계좌 20%';
  } else if (riskTolerance === 'moderate') {
    accountStructure = 'ISA 계좌 60% (배당주 + 대형주) + 일반계좌 40% (성장주)';
  } else {
    accountStructure = 'ISA 계좌 40% (안정적 배당주) + 일반계좌 60% (성장주)';
  }

  // 예상 절세액 계산 (간단한 추정)
  const estimatedProfit = taxBenefit * 2; // 예상 수익
  const normalTax = estimatedProfit * 0.154; // 일반 계좌 세율 15.4%
  const isaTax = Math.max(0, (estimatedProfit - taxBenefit) * 0.099); // ISA 세율 9.9%
  const taxSavings = Math.round(normalTax - isaTax);

  return {
    isaType,
    taxBenefit,
    recommendation,
    accountStructure,
    estimatedTaxSavings: taxSavings
  };
};

const generateSummary = (portfolio, riskTolerance, investmentPeriod) => {
  const sectorCounts = {};
  portfolio.forEach(stock => {
    sectorCounts[stock.sector] = (sectorCounts[stock.sector] || 0) + 1;
  });

  const sectorNames = {
    tech: '기술/IT',
    finance: '금융',
    consumer: '소비재',
    healthcare: '헬스케어',
    energy: '에너지',
    etf: 'ETF'
  };

  const diversification = Object.entries(sectorCounts)
    .map(([sector, count]) => `${sectorNames[sector] || sector} ${count}개`)
    .join(', ');

  let summary = `총 ${portfolio.length}개 종목으로 구성된 포트폴리오입니다. `;
  summary += `섹터 분산: ${diversification}. `;

  if (riskTolerance === 'conservative') {
    summary += '배당 수익을 중심으로 안정적인 현금 흐름을 추구합니다.';
  } else if (riskTolerance === 'moderate') {
    summary += '안정성과 성장성의 균형을 통해 중장기 자산 증식을 목표로 합니다.';
  } else {
    summary += '높은 성장 가능성을 가진 종목들로 구성하여 공격적인 수익률을 추구합니다.';
  }

  return summary;
};

const getRiskLevel = (riskTolerance) => {
  const levels = {
    conservative: { level: '낮음', score: 3, description: '안정적인 투자' },
    moderate: { level: '중간', score: 5, description: '균형잡힌 투자' },
    aggressive: { level: '높음', score: 8, description: '공격적인 투자' }
  };

  return levels[riskTolerance] || levels.moderate;
};

const getExpectedReturn = (riskTolerance, investmentPeriod) => {
  const baseReturns = {
    conservative: { min: 3, max: 6 },
    moderate: { min: 5, max: 10 },
    aggressive: { min: 8, max: 20 }
  };

  const periodMultiplier = {
    short: 0.8,
    medium: 1.0,
    long: 1.2
  };

  const base = baseReturns[riskTolerance] || baseReturns.moderate;
  const multiplier = periodMultiplier[investmentPeriod] || 1.0;

  return {
    min: Math.round(base.min * multiplier * 10) / 10,
    max: Math.round(base.max * multiplier * 10) / 10
  };
};
