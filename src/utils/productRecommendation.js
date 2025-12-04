// 펀드 및 ETF 추천 로직

import { bankFunds, isaETFs } from '../data/fundProducts';

/**
 * AI 포트폴리오 구성 분석
 * @param {Array} portfolio - AI가 생성한 포트폴리오
 * @returns {Object} 포트폴리오 분석 결과
 */
export const analyzePortfolioComposition = (portfolio) => {
  if (!portfolio || portfolio.length === 0) {
    return {
      sectorWeights: {},
      characteristics: {},
      dominantSectors: [],
      stockTypes: {},
      averageMetrics: {}
    };
  }

  // 1. 섹터별 가중치 계산
  const sectorWeights = {};
  const stockTypes = {
    dividend: 0,    // 배당주
    growth: 0,      // 성장주
    largeCap: 0,    // 대형주
    midCap: 0,      // 중형주
    etf: 0,         // ETF
    bond: 0         // 채권
  };

  // 2. 평균 지표 계산을 위한 변수
  let totalDividendYield = 0;
  let totalPER = 0;
  let validDividendCount = 0;
  let validPERCount = 0;

  portfolio.forEach(stock => {
    // 섹터별 가중치
    const sector = stock.sector || 'other';
    sectorWeights[sector] = (sectorWeights[sector] || 0) + stock.allocation;

    // 주식 타입 분류
    if (stock.type === 'etf' || stock.name.includes('ETF') || stock.name.includes('KODEX')) {
      stockTypes.etf += stock.allocation;
    } else if (stock.type === 'bond' || stock.name.includes('채권')) {
      stockTypes.bond += stock.allocation;
    } else if (stock.type === 'dividend' || (stock.dividendYield && stock.dividendYield > 3)) {
      stockTypes.dividend += stock.allocation;
    } else if (stock.type === 'growth' || stock.name.includes('성장')) {
      stockTypes.growth += stock.allocation;
    }

    // 시가총액 기준 분류
    if (stock.marketCap) {
      if (stock.marketCap > 10000000000000) { // 10조원 이상
        stockTypes.largeCap += stock.allocation;
      } else if (stock.marketCap > 1000000000000) { // 1조원 이상
        stockTypes.midCap += stock.allocation;
      }
    }

    // 평균 지표 계산
    if (stock.dividendYield && stock.dividendYield > 0) {
      totalDividendYield += stock.dividendYield * stock.allocation;
      validDividendCount += stock.allocation;
    }
    if (stock.per && stock.per > 0) {
      totalPER += stock.per * stock.allocation;
      validPERCount += stock.allocation;
    }
  });

  // 3. 지배적인 섹터 찾기 (20% 이상)
  const dominantSectors = Object.entries(sectorWeights)
    .filter(([_, weight]) => weight >= 20)
    .sort((a, b) => b[1] - a[1])
    .map(([sector, weight]) => ({ sector, weight }));

  // 4. 포트폴리오 특성 파악
  const characteristics = {
    isHighTech: (sectorWeights.tech || 0) > 30,
    isHighDividend: stockTypes.dividend > 30,
    isGrowthFocused: stockTypes.growth > 40,
    isDiversified: Object.keys(sectorWeights).length >= 4 && !dominantSectors.find(s => s.weight > 40),
    hasInternational: portfolio.some(s => s.name.includes('미국') || s.name.includes('글로벌')),
    hasBonds: stockTypes.bond > 0,
    hasETFs: stockTypes.etf > 0
  };

  // 5. 평균 지표
  const averageMetrics = {
    dividendYield: validDividendCount > 0 ? totalDividendYield / validDividendCount : 0,
    per: validPERCount > 0 ? totalPER / validPERCount : 0,
    totalAllocation: portfolio.reduce((sum, s) => sum + s.allocation, 0)
  };

  return {
    sectorWeights,
    characteristics,
    dominantSectors,
    stockTypes,
    averageMetrics
  };
};

/**
 * 펀드 섹터를 포트폴리오 섹터로 매핑
 * @param {string} fundSector - 펀드 섹터명
 * @returns {string} 포트폴리오 섹터명
 */
const mapFundSectorToPortfolioSector = (fundSector) => {
  const sectorMapping = {
    '기술': 'tech',
    '금융': 'finance',
    '헬스케어': 'healthcare',
    '소비재': 'consumer',
    '산업재': 'industrial',
    '에너지': 'energy',
    '소재': 'materials',
    '통신': 'telecom',
    '부동산': 'realestate',
    '글로벌': 'global',
    '채권': 'bond',
    '기타': 'other'
  };

  for (const [key, value] of Object.entries(sectorMapping)) {
    if (fundSector.includes(key)) {
      return value;
    }
  }
  return 'other';
};

/**
 * 당행 펀드 추천 (AI 포트폴리오 기반)
 * @param {Object} userProfile - 사용자 프로파일 { riskTolerance, investmentPeriod, preferredSectors }
 * @param {number} totalInvestment - 총 투자 금액
 * @param {Object} portfolioAnalysis - 포트폴리오 분석 결과
 * @returns {Array} 추천 펀드 리스트
 */
export const recommendBankFunds = (userProfile, totalInvestment, portfolioAnalysis = null) => {
  const { riskTolerance, investmentPeriod, preferredSectors } = userProfile;

  // 포트폴리오 분석이 없으면 기존 로직 사용
  if (!portfolioAnalysis) {
    portfolioAnalysis = {
      sectorWeights: {},
      characteristics: {},
      dominantSectors: [],
      stockTypes: {},
      averageMetrics: {}
    };
  }

  // 모든 펀드에 점수 부여
  let scoredFunds = bankFunds.map(fund => {
    let score = 0;
    let reasons = [];

    // 1. 위험성향 매칭 점수 (기본 점수)
    if (riskTolerance === 'conservative' && fund.riskLevel === 'conservative') {
      score += 20;
    } else if (riskTolerance === 'moderate') {
      if (fund.riskLevel === 'moderate') score += 20;
      else if (fund.riskLevel === 'conservative') score += 10;
    } else if (riskTolerance === 'aggressive') {
      if (fund.riskLevel === 'aggressive') score += 20;
      else if (fund.riskLevel === 'moderate') score += 15;
    }

    // 2. 포트폴리오 보완 점수 (핵심 로직)
    const { sectorWeights, characteristics, stockTypes, averageMetrics } = portfolioAnalysis;

    // 섹터 균형 점수 - 포트폴리오에 부족한 섹터를 보완
    if (fund.sector && fund.sector.length > 0) {
      fund.sector.forEach(fundSector => {
        // 섹터 매핑
        let mappedSector = mapFundSectorToPortfolioSector(fundSector);
        let currentWeight = sectorWeights[mappedSector] || 0;

        // 부족한 섹터일수록 높은 점수
        if (currentWeight < 10) {
          score += 15;
          reasons.push(`포트폴리오에 부족한 ${fundSector} 섹터 보완`);
        } else if (currentWeight < 20) {
          score += 10;
        } else if (currentWeight > 40) {
          // 과도한 섹터는 감점
          score -= 5;
        }
      });
    }

    // 3. 자산 유형 보완 점수
    if (characteristics.isGrowthFocused && fund.category === 'bond') {
      // 성장주 중심 포트폴리오에는 채권 펀드로 안정성 보완
      score += 25;
      reasons.push('성장주 중심 포트폴리오의 안정성 보완');
    }

    if (characteristics.isHighTech && !fund.sector?.includes('기술')) {
      // 기술주 편중 포트폴리오에는 비기술 섹터 펀드 추천
      score += 20;
      reasons.push('기술주 편중 완화');
    }

    if (stockTypes.dividend < 20 && fund.features?.includes('배당중심')) {
      // 배당 수익이 적은 포트폴리오에 배당 펀드 추천
      score += 15;
      reasons.push('배당 수익 보완');
    }

    // 4. 지역 분산 점수
    if (!characteristics.hasInternational && fund.name.includes('글로벌')) {
      score += 20;
      reasons.push('글로벌 분산 투자');
    }

    // 5. 투자기간 매칭
    if (investmentPeriod === 'short' && fund.category === 'bond') {
      score += 15;
    } else if (investmentPeriod === 'medium' && fund.category === 'mixed') {
      score += 15;
    } else if (investmentPeriod === 'long' && fund.category === 'equity') {
      score += 15;
    }

    // 6. 추천 펀드 보너스
    if (fund.recommended) {
      score += 10;
    }

    // 7. 수익률 점수
    if (fund.threeYearReturn > 10) {
      score += 5;
    }

    return {
      ...fund,
      score,
      matchReasons: reasons.slice(0, 3) // 상위 3개 이유만 저장
    };
  });

  // 점수 순으로 정렬
  scoredFunds.sort((a, b) => b.score - a.score);

  // 상위 5개 펀드 선택
  const topFunds = scoredFunds.slice(0, 5);

  // 추천 금액 산정 (총 투자금의 30-40%)

  return topFunds.map((fund, index) => {
    // 비중 배분: 첫 번째 40%, 두 번째 30%, 나머지 균등
    let allocationRatio;
    if (index === 0) allocationRatio = 0.4;
    else if (index === 1) allocationRatio = 0.3;
    else allocationRatio = 0.3 / (topFunds.length - 2);

    const recommendedAmount = Math.round(recommendedTotalAmount * allocationRatio);

    return {
      ...fund,
      recommendedAmount,
      reason: generateFundReason(fund, userProfile, portfolioAnalysis),
      priority: index + 1
    };
  });
};

/**
 * ISA ETF 포트폴리오 추천 (AI 포트폴리오 기반)
 * @param {Object} userProfile - 사용자 프로파일 { riskTolerance }
 * @param {number} isaAmount - ISA 투자 금액
 * @param {Object} portfolioAnalysis - 포트폴리오 분석 결과
 * @returns {Object} ETF 포트폴리오 추천
 */
export const recommendISAETFs = (userProfile, isaAmount, portfolioAnalysis = null) => {
  const { riskTolerance } = userProfile;

  // 포트폴리오 분석이 없으면 기존 로직 사용
  if (!portfolioAnalysis) {
    portfolioAnalysis = {
      sectorWeights: {},
      characteristics: {},
      dominantSectors: [],
      stockTypes: {},
      averageMetrics: {}
    };
  }

  const { sectorWeights, characteristics, stockTypes, averageMetrics } = portfolioAnalysis;

  // 1. AI 포트폴리오 기반 지능형 자산 배분
  let allocation = {};

  // 기본 위험성향별 배분을 시작점으로
  if (riskTolerance === 'conservative') {
    allocation = {
      domestic_equity: 0.2,
      overseas_equity: 0.1,
      domestic_bond: 0.4,
      overseas_bond: 0.3
    };
  } else if (riskTolerance === 'moderate') {
    allocation = {
      domestic_equity: 0.3,
      overseas_equity: 0.3,
      domestic_bond: 0.2,
      overseas_bond: 0.2
    };
  } else {
    allocation = {
      domestic_equity: 0.3,
      overseas_equity: 0.5,
      domestic_bond: 0.1,
      overseas_bond: 0.1
    };
  }

  // 2. 포트폴리오 특성에 따른 조정
  // 국내 주식만 있는 경우 해외 비중 증가
  if (!characteristics.hasInternational) {
    allocation.overseas_equity = Math.min(allocation.overseas_equity + 0.2, 0.6);
    allocation.domestic_equity = Math.max(allocation.domestic_equity - 0.1, 0.1);
  }

  // 배당주가 많은 경우 ISA에 고배당 ETF 우선 배치 (세제혜택)
  if (characteristics.isHighDividend || averageMetrics.dividendYield > 3) {
    // 채권 비중을 줄이고 배당형 주식 ETF 비중 증가
    const bondReduction = 0.1;
    allocation.domestic_bond = Math.max(allocation.domestic_bond - bondReduction, 0.1);
    allocation.domestic_equity += bondReduction * 0.5;
    allocation.overseas_equity += bondReduction * 0.5;
  }

  // 성장주 위주 포트폴리오면 안정적인 채권 비중 증가
  if (characteristics.isGrowthFocused) {
    const equityReduction = 0.15;
    allocation.domestic_equity = Math.max(allocation.domestic_equity - equityReduction * 0.4, 0.1);
    allocation.overseas_equity = Math.max(allocation.overseas_equity - equityReduction * 0.6, 0.1);
    allocation.domestic_bond += equityReduction * 0.5;
    allocation.overseas_bond += equityReduction * 0.5;
  }

  // 기술주 편중인 경우 섹터 다양화
  if (characteristics.isHighTech) {
    // 기술 ETF 대신 다른 섹터 ETF 우선
    allocation.sector_diversified = 0.15;
    allocation.overseas_equity = Math.max(allocation.overseas_equity - 0.15, 0.2);
  }

  // 2. 각 카테고리에서 최적 ETF 선택
  const recommendations = [];

  Object.keys(allocation).forEach(category => {
    if (allocation[category] === 0) return;

    const categoryETFs = isaETFs.filter(etf => etf.category === category && etf.isaRecommended);

    if (categoryETFs.length === 0) return;

    // 비용 낮은 순으로 정렬
    categoryETFs.sort((a, b) => a.expenseRatio - b.expenseRatio);

    const selectedETF = categoryETFs[0];
    const recommendedAmount = Math.round(isaAmount * allocation[category]);

    // 매수 가능 수량 계산 (가격 추정: ETF별 대략적인 가격)
    const estimatedPrice = getEstimatedETFPrice(selectedETF.ticker);
    const shares = Math.floor(recommendedAmount / estimatedPrice);

    recommendations.push({
      ...selectedETF,
      allocation: allocation[category] * 100, // 퍼센트로 변환
      recommendedAmount,
      shares,
      estimatedPrice,
      reason: generateETFReason(selectedETF, category, riskTolerance, portfolioAnalysis)
    });
  });

  // 3. 예상 수익률 계산
  const expectedReturn = calculateExpectedReturn(recommendations);

  // 4. 세제 혜택 계산
  const taxBenefit = calculateISATaxBenefit(isaAmount, expectedReturn);

  return {
    etfs: recommendations,
    totalAmount: isaAmount,
    expectedReturn,
    taxBenefit,
    strategy: getStrategyDescription(riskTolerance)
  };
};

/**
 * ISA 세제 혜택 계산
 * @param {number} investmentAmount - 투자 금액
 * @param {number} expectedReturnRate - 예상 수익률 (%)
 * @returns {Object} 세제 혜택 정보
 */
export const calculateISATaxBenefit = (investmentAmount, expectedReturnRate) => {
  // ISA 세제 혜택:
  // - 연 400만원까지 비과세
  // - 400만원 초과분 9.9% 분리과세 (일반 15.4% 대비)
  const taxFreeLimit = 4000000;
  const normalTaxRate = 0.154; // 배당소득세 15.4%
  const isaTaxRate = 0.099;     // ISA 초과분 9.9%

  // 예상 배당 수익 (연 배당률 2% 가정)
  const estimatedDividend = investmentAmount * 0.02;

  // 예상 매매 차익 (보수적으로 예상 수익률의 절반만 실현한다고 가정)
  const estimatedCapitalGain = investmentAmount * (expectedReturnRate / 100) * 0.5;

  const totalGain = estimatedDividend + estimatedCapitalGain;

  let taxSaving = 0;
  let normalTax = 0;
  let isaTax = 0;

  if (totalGain <= taxFreeLimit) {
    // 전액 비과세
    normalTax = totalGain * normalTaxRate;
    isaTax = 0;
    taxSaving = normalTax;
  } else {
    // 400만원까지 비과세 + 초과분 감면
    normalTax = totalGain * normalTaxRate;
    isaTax = (totalGain - taxFreeLimit) * isaTaxRate;
    taxSaving = normalTax - isaTax;
  }

  return {
    annualDividend: Math.round(estimatedDividend),
    estimatedCapitalGain: Math.round(estimatedCapitalGain),
    totalGain: Math.round(totalGain),
    normalTax: Math.round(normalTax),
    isaTax: Math.round(isaTax),
    taxSaving: Math.round(taxSaving)
  };
};

/**
 * 펀드 추천 이유 생성
 * @param {Object} fund - 펀드 정보
 * @param {Object} userProfile - 사용자 프로파일
 * @param {Object} portfolioAnalysis - 포트폴리오 분석 결과
 * @returns {string} 추천 이유
 */
const generateFundReason = (fund, userProfile, portfolioAnalysis = null) => {
  const reasons = [];

  // 포트폴리오 기반 추천 이유가 있으면 우선 사용
  if (fund.matchReasons && fund.matchReasons.length > 0) {
    reasons.push(...fund.matchReasons);
  }

  // 추가 이유들
  if (fund.riskLevel === userProfile.riskTolerance && reasons.length < 3) {
    reasons.push(`${fund.riskLevel === 'conservative' ? '안정적인' : fund.riskLevel === 'moderate' ? '균형잡힌' : '성장 중심의'} 투자성향에 적합`);
  }

  if (fund.threeYearReturn > 10 && reasons.length < 3) {
    reasons.push(`최근 3년 우수한 수익률 (${fund.threeYearReturn}%)`);
  }

  if (fund.managementFee < 0.7 && reasons.length < 3) {
    reasons.push(`저렴한 운용보수 (${fund.managementFee}%)`);
  }

  return reasons.slice(0, 3).join(', ');
};

/**
 * ETF 추천 이유 생성 (AI 포트폴리오 기반)
 * @param {Object} etf - ETF 정보
 * @param {string} category - 카테고리
 * @param {string} riskTolerance - 위험성향
 * @param {Object} portfolioAnalysis - 포트폴리오 분석 결과
 * @returns {string} 추천 이유
 */
const generateETFReason = (etf, category, riskTolerance, portfolioAnalysis = null) => {
  const reasons = [];

  // 포트폴리오 보완 이유 우선
  if (portfolioAnalysis) {
    const { characteristics, averageMetrics } = portfolioAnalysis;

    if (!characteristics.hasInternational && category.includes('overseas')) {
      reasons.push('포트폴리오에 부족한 해외 자산 보완');
    }

    if (characteristics.isGrowthFocused && category.includes('bond')) {
      reasons.push('성장주 중심 포트폴리오의 안정성 강화');
    }

    if (averageMetrics.dividendYield > 3 && etf.dividendYield > 3) {
      reasons.push('ISA 계좌의 배당 비과세 혜택 극대화');
    }
  }

  // 기본 이유들
  if (category.includes('domestic') && reasons.length < 3) {
    reasons.push('국내 시장 노출');
  } else if (reasons.length < 3) {
    reasons.push('글로벌 분산 투자');
  }

  if (etf.expenseRatio < 0.15 && reasons.length < 3) {
    reasons.push(`초저비용 (${etf.expenseRatio}%)`);
  }

  if (etf.dividendYield > 3 && reasons.length < 3) {
    reasons.push(`높은 배당수익률 (${etf.dividendYield}%)`);
  }

  return reasons.slice(0, 3).join(', ');
};

/**
 * 예상 수익률 계산
 * @param {Array} recommendations - ETF 추천 리스트
 * @returns {number} 가중 평균 예상 수익률
 */
const calculateExpectedReturn = (recommendations) => {
  let weightedReturn = 0;
  let totalWeight = 0;

  recommendations.forEach(etf => {
    const weight = etf.allocation / 100;
    weightedReturn += etf.threeYearReturn * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(weightedReturn * 10) / 10 : 0;
};

/**
 * ETF 가격 추정 (실제로는 API에서 가져와야 함)
 * @param {string} ticker - ETF 티커
 * @returns {number} 추정 가격
 */
const getEstimatedETFPrice = (ticker) => {
  // 실제로는 Yahoo Finance API나 KRX API에서 가져와야 하지만,
  // 여기서는 임시로 하드코딩된 가격 사용
  const prices = {
    '069500': 33000,  // KODEX 200
    '102110': 33200,  // TIGER 200
    '091180': 8500,   // KODEX 자동차
    '360750': 12500,  // TIGER 미국S&P500
    '379800': 17000,  // KODEX 미국S&P500TR
    '453810': 17500,  // KODEX 미국나스닥100TR
    '143850': 98000,  // TIGER 미국채10년선물
    '114260': 103500, // KODEX 국고채3년
    '305720': 7500,   // KODEX 미국채울트라30년선물
    '148070': 104000, // KOSEF 국고채10년
    '161510': 9800,   // ARIRANG 고배당주
    '458730': 13000,  // TIGER 미국배당다우존스
    '132030': 12000,  // KODEX 골드선물(H)
    '360140': 4500,   // TIGER 글로벌리츠
    '371460': 8000    // TIGER 차이나전기차SOLACTIVE
  };

  return prices[ticker] || 10000; // 기본값 10,000원
};

/**
 * 투자 전략 설명 생성
 * @param {string} riskTolerance - 위험성향
 * @returns {string} 전략 설명
 */
const getStrategyDescription = (riskTolerance) => {
  const strategies = {
    conservative: '안정적인 자산 배분으로 원금 보존을 최우선으로 하며, 채권 비중을 높여 변동성을 최소화합니다.',
    moderate: '주식과 채권을 균형있게 배분하여 적정 수준의 수익과 안정성을 동시에 추구합니다.',
    aggressive: '높은 성장 잠재력을 가진 주식 ETF 중심으로 배분하여 장기적인 자본 이득을 추구합니다.'
  };

  return strategies[riskTolerance] || strategies.moderate;
};

/**
 * 월 적립식 투자 시뮬레이션
 * @param {number} monthlyAmount - 월 투자 금액
 * @param {number} expectedReturn - 예상 수익률 (%)
 * @param {number} years - 투자 기간 (년)
 * @returns {Object} 시뮬레이션 결과
 */
export const simulateMonthlyInvestment = (monthlyAmount, expectedReturn, years) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / 100 / 12;

  let totalInvested = 0;
  let futureValue = 0;

  for (let month = 1; month <= months; month++) {
    totalInvested += monthlyAmount;
    futureValue = (futureValue + monthlyAmount) * (1 + monthlyRate);
  }

  const totalReturn = futureValue - totalInvested;
  const returnRate = (totalReturn / totalInvested) * 100;

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(futureValue),
    totalReturn: Math.round(totalReturn),
    returnRate: Math.round(returnRate * 10) / 10
  };
};

// Default export로 모든 함수 제공
export default {
  analyzePortfolioComposition,
  recommendBankFunds,
  recommendISAETFs,
  calculateISATaxBenefit,
  simulateMonthlyInvestment
};
