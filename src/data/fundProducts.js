// 당행 펀드 및 ISA ETF 상품 데이터

// 당행 펀드 리스트
export const bankFunds = [
  {
    code: 'FUND001',
    name: '우리 글로벌배당성장 펀드',
    type: 'fund',
    category: 'equity',
    riskLevel: 'moderate',
    expectedReturn: '8-12%',
    minimumInvestment: 100000,
    managementFee: 0.85,
    features: ['해외주식', '배당중심', '분기배당'],
    recommended: true,
    description: '글로벌 우량 배당주에 투자하여 안정적인 배당 수익과 자본 이득을 추구하는 펀드',
    threeYearReturn: 9.5,
    sector: ['기술', '금융', '헬스케어']
  },
  {
    code: 'FUND002',
    name: '우리 ESG 성장 펀드',
    type: 'fund',
    category: 'equity',
    riskLevel: 'aggressive',
    expectedReturn: '10-15%',
    minimumInvestment: 100000,
    managementFee: 1.2,
    features: ['ESG', '성장주', '국내주식'],
    recommended: true,
    description: 'ESG 우수 기업 중심으로 장기 성장성이 높은 국내 주식에 투자하는 펀드',
    threeYearReturn: 12.3,
    sector: ['기술', '친환경', '헬스케어']
  },
  {
    code: 'FUND003',
    name: '우리 글로벌 채권 안정 펀드',
    type: 'fund',
    category: 'bond',
    riskLevel: 'conservative',
    expectedReturn: '4-6%',
    minimumInvestment: 100000,
    managementFee: 0.6,
    features: ['해외채권', '안정형', '월배당'],
    recommended: true,
    description: '미국 및 선진국 국채에 투자하여 안정적인 이자 수익을 제공하는 채권형 펀드',
    threeYearReturn: 5.2,
    sector: ['채권']
  },
  {
    code: 'FUND004',
    name: '우리 테크 혁신 펀드',
    type: 'fund',
    category: 'equity',
    riskLevel: 'aggressive',
    expectedReturn: '12-18%',
    minimumInvestment: 200000,
    managementFee: 1.5,
    features: ['기술주', '성장형', '미국주식'],
    recommended: true,
    description: 'AI, 반도체, 클라우드 등 혁신 기술 분야 글로벌 리더 기업에 집중 투자',
    threeYearReturn: 15.7,
    sector: ['기술']
  },
  {
    code: 'FUND005',
    name: '우리 혼합자산 균형 펀드',
    type: 'fund',
    category: 'mixed',
    riskLevel: 'moderate',
    expectedReturn: '6-9%',
    minimumInvestment: 100000,
    managementFee: 0.95,
    features: ['주식+채권', '균형형', '국내외'],
    recommended: true,
    description: '주식 50%, 채권 50% 비중으로 안정적인 수익과 적정 수준의 성장을 동시에 추구',
    threeYearReturn: 7.8,
    sector: ['혼합']
  },
  {
    code: 'FUND006',
    name: '우리 아시아 신흥국 펀드',
    type: 'fund',
    category: 'equity',
    riskLevel: 'aggressive',
    expectedReturn: '10-16%',
    minimumInvestment: 150000,
    managementFee: 1.3,
    features: ['아시아', '신흥국', '성장형'],
    recommended: false,
    description: '중국, 인도, 베트남 등 아시아 신흥국 주식에 투자하는 고성장 펀드',
    threeYearReturn: 11.2,
    sector: ['신흥국']
  },
  {
    code: 'FUND007',
    name: '우리 배당 플러스 채권 펀드',
    type: 'fund',
    category: 'mixed',
    riskLevel: 'conservative',
    expectedReturn: '5-8%',
    minimumInvestment: 100000,
    managementFee: 0.75,
    features: ['배당주+채권', '안정형', '분기배당'],
    recommended: true,
    description: '고배당주 30%, 회사채 70% 비중으로 안정적인 현금흐름을 제공',
    threeYearReturn: 6.5,
    sector: ['혼합']
  },
  {
    code: 'FUND008',
    name: '우리 헬스케어 성장 펀드',
    type: 'fund',
    category: 'equity',
    riskLevel: 'moderate',
    expectedReturn: '9-13%',
    minimumInvestment: 150000,
    managementFee: 1.1,
    features: ['헬스케어', '제약바이오', '글로벌'],
    recommended: true,
    description: '글로벌 헬스케어 및 제약바이오 기업에 투자하는 섹터 펀드',
    threeYearReturn: 10.8,
    sector: ['헬스케어']
  },
  {
    code: 'FUND009',
    name: '우리 부동산 리츠 펀드',
    type: 'fund',
    category: 'reit',
    riskLevel: 'moderate',
    expectedReturn: '7-10%',
    minimumInvestment: 200000,
    managementFee: 0.9,
    features: ['리츠', '부동산', '월배당'],
    recommended: false,
    description: '국내외 리츠(부동산 투자신탁)에 투자하여 임대수익을 제공',
    threeYearReturn: 8.3,
    sector: ['부동산']
  },
  {
    code: 'FUND010',
    name: '우리 단기 국공채 펀드',
    type: 'fund',
    category: 'bond',
    riskLevel: 'conservative',
    expectedReturn: '3-5%',
    minimumInvestment: 100000,
    managementFee: 0.3,
    features: ['국공채', '초단기', '안정형'],
    recommended: true,
    description: '만기 1년 이내 국고채와 통안채에 투자하는 초저위험 펀드',
    threeYearReturn: 4.1,
    sector: ['채권']
  }
];

// ISA 추천 ETF 리스트
export const isaETFs = [
  // 국내 주식 ETF
  {
    ticker: '069500',
    name: 'KODEX 200',
    type: 'etf',
    category: 'domestic_equity',
    index: 'KOSPI 200',
    riskLevel: 'moderate',
    expenseRatio: 0.15,
    dividendYield: 1.8,
    aum: '5조원',
    features: ['KOSPI 200 추종', '저비용', 'ISA 적합', '고유동성'],
    isaRecommended: true,
    description: 'KOSPI 200 지수를 추종하는 국내 대표 ETF',
    threeYearReturn: 8.5
  },
  {
    ticker: '102110',
    name: 'TIGER 200',
    type: 'etf',
    category: 'domestic_equity',
    index: 'KOSPI 200',
    riskLevel: 'moderate',
    expenseRatio: 0.14,
    dividendYield: 1.7,
    aum: '3조원',
    features: ['KOSPI 200 추종', '저비용'],
    isaRecommended: true,
    description: 'KOSPI 200 지수를 추종하는 대형 ETF',
    threeYearReturn: 8.4
  },
  {
    ticker: '091180',
    name: 'KODEX 자동차',
    type: 'etf',
    category: 'domestic_sector',
    index: 'FnGuide 자동차 지수',
    riskLevel: 'aggressive',
    expenseRatio: 0.45,
    dividendYield: 2.1,
    aum: '8000억원',
    features: ['섹터 ETF', '자동차', '고배당'],
    isaRecommended: false,
    description: '국내 자동차 및 부품 기업에 투자하는 섹터 ETF',
    threeYearReturn: 12.3
  },

  // 해외 주식 ETF
  {
    ticker: '360750',
    name: 'TIGER 미국S&P500',
    type: 'etf',
    category: 'overseas_equity',
    index: 'S&P 500',
    riskLevel: 'moderate',
    expenseRatio: 0.07,
    dividendYield: 1.2,
    aum: '2조원',
    features: ['S&P 500 추종', '환헤지 없음', 'ISA 적합'],
    isaRecommended: true,
    description: '미국 S&P 500 지수를 추종하는 대표 해외 ETF',
    threeYearReturn: 14.2
  },
  {
    ticker: '379800',
    name: 'KODEX 미국S&P500TR',
    type: 'etf',
    category: 'overseas_equity',
    index: 'S&P 500 Total Return',
    riskLevel: 'moderate',
    expenseRatio: 0.05,
    dividendYield: 0,
    aum: '1.5조원',
    features: ['S&P 500 추종', '배당재투자', 'ISA 적합'],
    isaRecommended: true,
    description: 'S&P 500 배당 재투자 방식의 토탈 리턴 ETF',
    threeYearReturn: 15.8
  },
  {
    ticker: '453810',
    name: 'KODEX 미국나스닥100TR',
    type: 'etf',
    category: 'overseas_equity',
    index: 'NASDAQ 100',
    riskLevel: 'aggressive',
    expenseRatio: 0.07,
    dividendYield: 0,
    aum: '1조원',
    features: ['나스닥 100 추종', '기술주', 'ISA 적합'],
    isaRecommended: true,
    description: '나스닥 100 지수를 추종하는 기술주 중심 ETF',
    threeYearReturn: 18.5
  },
  {
    ticker: '143850',
    name: 'TIGER 미국채10년선물',
    type: 'etf',
    category: 'overseas_bond',
    index: '미국 10년물 국채',
    riskLevel: 'conservative',
    expenseRatio: 0.07,
    dividendYield: 3.5,
    aum: '5000억원',
    features: ['미국채', '안정형', '금리 민감'],
    isaRecommended: true,
    description: '미국 10년물 국채 선물을 추종하는 안전자산',
    threeYearReturn: 5.2
  },

  // 국내 채권 ETF
  {
    ticker: '114260',
    name: 'KODEX 국고채3년',
    type: 'etf',
    category: 'domestic_bond',
    index: 'KIS 국고채 3년 지수',
    riskLevel: 'conservative',
    expenseRatio: 0.04,
    dividendYield: 3.2,
    aum: '1.5조원',
    features: ['국고채', '단기채', 'ISA 적합'],
    isaRecommended: true,
    description: '만기 3년 내외 국고채에 투자하는 안정형 ETF',
    threeYearReturn: 3.8
  },
  {
    ticker: '305720',
    name: 'KODEX 미국채울트라30년선물',
    type: 'etf',
    category: 'overseas_bond',
    index: '미국 30년물 국채',
    riskLevel: 'moderate',
    expenseRatio: 0.09,
    dividendYield: 4.2,
    aum: '8000억원',
    features: ['미국 장기채', '고금리', '변동성 높음'],
    isaRecommended: true,
    description: '미국 30년물 국채 선물을 추종하는 장기채 ETF',
    threeYearReturn: 6.5
  },
  {
    ticker: '148070',
    name: 'KOSEF 국고채10년',
    type: 'etf',
    category: 'domestic_bond',
    index: 'KIS 국고채 10년 지수',
    riskLevel: 'conservative',
    expenseRatio: 0.04,
    dividendYield: 3.5,
    aum: '1조원',
    features: ['국고채', '중기채', 'ISA 적합'],
    isaRecommended: true,
    description: '만기 10년 내외 국고채에 투자하는 ETF',
    threeYearReturn: 4.2
  },

  // 배당 ETF
  {
    ticker: '161510',
    name: 'ARIRANG 고배당주',
    type: 'etf',
    category: 'domestic_dividend',
    index: 'FnGuide 고배당 지수',
    riskLevel: 'moderate',
    expenseRatio: 0.25,
    dividendYield: 4.5,
    aum: '5000억원',
    features: ['고배당', '국내주식', 'ISA 적합'],
    isaRecommended: true,
    description: '국내 고배당 우량주에 투자하는 배당 ETF',
    threeYearReturn: 9.8
  },
  {
    ticker: '458730',
    name: 'TIGER 미국배당다우존스',
    type: 'etf',
    category: 'overseas_dividend',
    index: 'Dow Jones 배당지수',
    riskLevel: 'moderate',
    expenseRatio: 0.19,
    dividendYield: 3.8,
    aum: '3000억원',
    features: ['미국 배당주', '안정형'],
    isaRecommended: false,
    description: '미국 고배당 기업에 투자하는 배당 ETF',
    threeYearReturn: 11.5
  },

  // 금 & 원자재
  {
    ticker: '132030',
    name: 'KODEX 골드선물(H)',
    type: 'etf',
    category: 'commodity',
    index: '금 선물',
    riskLevel: 'moderate',
    expenseRatio: 0.45,
    dividendYield: 0,
    aum: '8000억원',
    features: ['금', '안전자산', '환헤지'],
    isaRecommended: false,
    description: '금 선물을 추종하는 대체투자 ETF',
    threeYearReturn: 7.2
  },

  // 글로벌 분산
  {
    ticker: '360140',
    name: 'TIGER 글로벌리츠',
    type: 'etf',
    category: 'overseas_reit',
    index: 'S&P 글로벌 리츠 지수',
    riskLevel: 'moderate',
    expenseRatio: 0.35,
    dividendYield: 4.8,
    aum: '2000억원',
    features: ['글로벌 리츠', '부동산', '월배당'],
    isaRecommended: false,
    description: '글로벌 부동산 투자 신탁에 투자하는 ETF',
    threeYearReturn: 8.9
  },
  {
    ticker: '371460',
    name: 'TIGER 차이나전기차SOLACTIVE',
    type: 'etf',
    category: 'overseas_sector',
    index: 'Solactive 중국전기차 지수',
    riskLevel: 'aggressive',
    expenseRatio: 0.45,
    dividendYield: 0.5,
    aum: '1500억원',
    features: ['중국', '전기차', '섹터 ETF'],
    isaRecommended: false,
    description: '중국 전기차 산업에 투자하는 테마 ETF',
    threeYearReturn: 16.8
  }
];

// 위험도별 라벨
export const riskLevelLabels = {
  conservative: '보수적',
  moderate: '중립적',
  aggressive: '공격적'
};

// 카테고리별 라벨
export const categoryLabels = {
  // 펀드 카테고리
  equity: '주식형',
  bond: '채권형',
  mixed: '혼합형',
  reit: '리츠형',

  // ETF 카테고리
  domestic_equity: '국내 주식',
  domestic_sector: '국내 섹터',
  domestic_bond: '국내 채권',
  domestic_dividend: '국내 배당',
  overseas_equity: '해외 주식',
  overseas_bond: '해외 채권',
  overseas_dividend: '해외 배당',
  overseas_reit: '해외 리츠',
  overseas_sector: '해외 섹터',
  commodity: '원자재'
};
