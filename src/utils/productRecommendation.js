// 펀드 및 ETF 추천 로직

import { bankFunds, isaETFs } from '../data/fundProducts';

/**
 * 당행 펀드 추천
 * @param {Object} userProfile - 사용자 프로파일 { riskTolerance, investmentPeriod, preferredSectors }
 * @param {number} totalInvestment - 총 투자 금액
 * @returns {Array} 추천 펀드 리스트
 */
export const recommendBankFunds = (userProfile, totalInvestment) => {
  const { riskTolerance, investmentPeriod, preferredSectors } = userProfile;

  // 1. 위험성향 매칭
  let eligibleFunds = bankFunds.filter(fund => {
    if (riskTolerance === 'conservative') {
      return fund.riskLevel === 'conservative';
    } else if (riskTolerance === 'moderate') {
      return ['conservative', 'moderate'].includes(fund.riskLevel);
    } else {
      // aggressive - 모든 펀드 가능
      return true;
    }
  });

  // 2. 투자기간 고려
  if (investmentPeriod === 'short') {
    // 단기 (1년 미만): 채권형/혼합형 우선
    eligibleFunds = eligibleFunds.sort((a, b) => {
      const order = { bond: 1, mixed: 2, equity: 3, reit: 4 };
      return (order[a.category] || 5) - (order[b.category] || 5);
    });
  } else if (investmentPeriod === 'medium') {
    // 중기 (1-3년): 혼합형/주식형
    eligibleFunds = eligibleFunds.sort((a, b) => {
      const order = { mixed: 1, equity: 2, bond: 3, reit: 4 };
      return (order[a.category] || 5) - (order[b.category] || 5);
    });
  } else {
    // 장기 (3년+): 주식형 우선
    eligibleFunds = eligibleFunds.sort((a, b) => {
      const order = { equity: 1, mixed: 2, reit: 3, bond: 4 };
      return (order[a.category] || 5) - (order[b.category] || 5);
    });
  }

  // 3. 섹터 선호도 반영
  if (preferredSectors && preferredSectors.length > 0) {
    eligibleFunds = eligibleFunds.map(fund => {
      let sectorScore = 0;
      if (fund.sector) {
        fund.sector.forEach(sector => {
          if (preferredSectors.some(ps => sector.includes(ps))) {
            sectorScore += 1;
          }
        });
      }
      return { ...fund, sectorScore };
    }).sort((a, b) => b.sectorScore - a.sectorScore);
  }

  // 4. 추천 펀드만 우선 (recommended: true)
  const recommendedFunds = eligibleFunds.filter(f => f.recommended);
  const otherFunds = eligibleFunds.filter(f => !f.recommended);
  eligibleFunds = [...recommendedFunds, ...otherFunds];

  // 5. 상위 5개 펀드 추천
  const topFunds = eligibleFunds.slice(0, 5);

  // 6. 추천 금액 산정 (총 투자금의 30-40%)
  const recommendedTotalAmount = totalInvestment * 0.35;

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
      reason: generateFundReason(fund, userProfile),
      priority: index + 1
    };
  });
};

/**
 * ISA ETF 포트폴리오 추천
 * @param {Object} userProfile - 사용자 프로파일 { riskTolerance }
 * @param {number} isaAmount - ISA 투자 금액
 * @returns {Object} ETF 포트폴리오 추천
 */
export const recommendISAETFs = (userProfile, isaAmount) => {
  const { riskTolerance } = userProfile;

  // 1. 위험성향별 자산 배분 전략
  let allocation = {};

  if (riskTolerance === 'conservative') {
    allocation = {
      domestic_equity: 0.2,  // 국내 주식 20%
      overseas_equity: 0.1,  // 해외 주식 10%
      domestic_bond: 0.4,    // 국내 채권 40%
      overseas_bond: 0.3     // 해외 채권 30%
    };
  } else if (riskTolerance === 'moderate') {
    allocation = {
      domestic_equity: 0.3,  // 국내 주식 30%
      overseas_equity: 0.3,  // 해외 주식 30%
      domestic_bond: 0.2,    // 국내 채권 20%
      overseas_bond: 0.2     // 해외 채권 20%
    };
  } else {
    // aggressive
    allocation = {
      domestic_equity: 0.3,  // 국내 주식 30%
      overseas_equity: 0.5,  // 해외 주식 50%
      domestic_bond: 0.1,    // 국내 채권 10%
      overseas_bond: 0.1     // 해외 채권 10%
    };
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
      reason: generateETFReason(selectedETF, category, riskTolerance)
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
 * @returns {string} 추천 이유
 */
const generateFundReason = (fund, userProfile) => {
  const reasons = [];

  // 위험성향 매칭
  if (fund.riskLevel === userProfile.riskTolerance) {
    reasons.push(`${fund.riskLevel === 'conservative' ? '안정적인' : fund.riskLevel === 'moderate' ? '균형잡힌' : '성장 중심의'} 투자성향에 적합`);
  }

  // 수익률
  if (fund.threeYearReturn > 10) {
    reasons.push(`최근 3년 우수한 수익률 (${fund.threeYearReturn}%)`);
  } else if (fund.threeYearReturn > 7) {
    reasons.push(`안정적인 3년 평균 수익률 (${fund.threeYearReturn}%)`);
  }

  // 수수료
  if (fund.managementFee < 0.7) {
    reasons.push(`저렴한 운용보수 (${fund.managementFee}%)`);
  }

  // 특징
  if (fund.features.includes('배당중심') || fund.features.includes('월배당') || fund.features.includes('분기배당')) {
    reasons.push('정기적인 현금흐름 제공');
  }

  return reasons.slice(0, 3).join(', ');
};

/**
 * ETF 추천 이유 생성
 * @param {Object} etf - ETF 정보
 * @param {string} category - 카테고리
 * @param {string} riskTolerance - 위험성향
 * @returns {string} 추천 이유
 */
const generateETFReason = (etf, category, riskTolerance) => {
  const reasons = [];

  // 카테고리별 이유
  if (category.includes('domestic')) {
    reasons.push('국내 시장 노출');
  } else {
    reasons.push('글로벌 분산 투자');
  }

  // 비용
  if (etf.expenseRatio < 0.15) {
    reasons.push(`초저비용 (${etf.expenseRatio}%)`);
  } else if (etf.expenseRatio < 0.3) {
    reasons.push(`저비용 (${etf.expenseRatio}%)`);
  }

  // 배당
  if (etf.dividendYield > 3) {
    reasons.push(`높은 배당수익률 (${etf.dividendYield}%)`);
  } else if (etf.dividendYield > 0) {
    reasons.push(`배당 수익 (${etf.dividendYield}%)`);
  }

  // ISA 적합성
  if (etf.isaRecommended) {
    reasons.push('ISA 최적화');
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
  recommendBankFunds,
  recommendISAETFs,
  calculateISATaxBenefit,
  simulateMonthlyInvestment
};
