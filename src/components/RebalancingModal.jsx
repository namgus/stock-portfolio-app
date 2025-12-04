import { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Minus, DollarSign, PieChart, Building2 } from 'lucide-react';
import { categoryLabels, riskLevelLabels } from '../data/fundProducts';

const RebalancingModal = ({
  isOpen,
  onClose,
  portfolio,
  portfolioData,
  totalInvestment,
  fundRecommendations,
  isaRecommendations,
  userProfile
}) => {
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'funds', 'isa'

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // ESC 키로 모달 닫기
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  // 리밸런싱 데이터 계산
  const rebalancingData = useMemo(() => {
    if (!portfolio || !portfolioData || !totalInvestment) return [];

    return portfolio.map(stock => {
      const holdings = portfolioData[stock.ticker];
      const currentPrice = stock.price;

      // 현재 보유 금액
      const currentValue = holdings?.shares && holdings?.buyPrice
        ? holdings.shares * currentPrice
        : 0;

      // 현재 비중
      const currentAllocation = totalInvestment > 0
        ? (currentValue / totalInvestment) * 100
        : 0;

      // 목표 비중
      const targetAllocation = stock.allocation || 0;

      // 비중 차이
      const allocationDiff = targetAllocation - currentAllocation;

      // 필요 금액
      const requiredAmount = (allocationDiff / 100) * totalInvestment;

      // 필요 수량
      const requiredShares = currentPrice > 0 ? Math.floor(Math.abs(requiredAmount) / currentPrice) : 0;

      // 제안 타입
      let suggestion = '유지';
      if (allocationDiff > 2) suggestion = '매수';
      else if (allocationDiff < -2) suggestion = '매도';

      return {
        ...stock,
        currentValue,
        currentAllocation,
        targetAllocation,
        allocationDiff,
        requiredAmount,
        requiredShares,
        suggestion
      };
    });
  }, [portfolio, portfolioData, totalInvestment]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* 모달 컨텐츠 */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                포트폴리오 리밸런싱 분석
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                목표 비중 대비 현재 자산 배분 분석 및 추천
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'stocks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              개별 주식
            </span>
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'funds'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              당행 펀드
            </span>
          </button>
          <button
            onClick={() => setActiveTab('isa')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'isa'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              ISA ETF
            </span>
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'stocks' && (
            <StocksTab
              rebalancingData={rebalancingData}
              totalInvestment={totalInvestment}
            />
          )}
          {activeTab === 'funds' && (
            <FundsTab
              fundRecommendations={fundRecommendations}
              userProfile={userProfile}
            />
          )}
          {activeTab === 'isa' && (
            <ISATab
              isaRecommendations={isaRecommendations}
              userProfile={userProfile}
            />
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 개별 주식 탭 컴포넌트
const StocksTab = ({ rebalancingData, totalInvestment }) => {
  const totalRebalanceAmount = useMemo(() => {
    return rebalancingData.reduce((sum, item) => sum + Math.abs(item.requiredAmount), 0);
  }, [rebalancingData]);

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">총 투자금액</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalInvestment?.toLocaleString() || 0}원
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">리밸런싱 필요 금액</p>
          <p className="text-2xl font-bold text-green-600">
            {totalRebalanceAmount.toLocaleString()}원
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">조정 종목 수</p>
          <p className="text-2xl font-bold text-purple-600">
            {rebalancingData.filter(item => item.suggestion !== '유지').length}개
          </p>
        </div>
      </div>

      {/* 테이블 (데스크톱) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">종목명</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">목표 비중</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">현재 비중</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">차이</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">필요 수량</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">필요 금액</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">제안</th>
            </tr>
          </thead>
          <tbody>
            {rebalancingData.map((item, index) => (
              <tr
                key={item.ticker}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  item.suggestion === '매수' ? 'bg-green-50/30' :
                  item.suggestion === '매도' ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.ticker}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-blue-600">
                    {item.targetAllocation.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-gray-700">
                    {item.currentAllocation.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-semibold ${
                    item.allocationDiff > 0 ? 'text-green-600' :
                    item.allocationDiff < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.allocationDiff > 0 ? '+' : ''}{item.allocationDiff.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    {item.requiredAmount > 0 ? '+' : item.requiredAmount < 0 ? '-' : ''}
                    {item.requiredShares}주
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-medium text-gray-700">
                    {item.requiredAmount > 0 ? '+' : ''}
                    {item.requiredAmount.toLocaleString()}원
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <SuggestionBadge suggestion={item.suggestion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 카드 (모바일) */}
      <div className="md:hidden space-y-4">
        {rebalancingData.map((item) => (
          <div
            key={item.ticker}
            className={`p-4 rounded-lg border-2 ${
              item.suggestion === '매수' ? 'border-green-200 bg-green-50' :
              item.suggestion === '매도' ? 'border-red-200 bg-red-50' :
              'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.ticker}</p>
              </div>
              <SuggestionBadge suggestion={item.suggestion} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">목표 비중</p>
                <p className="font-semibold text-blue-600">{item.targetAllocation.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">현재 비중</p>
                <p className="font-semibold text-gray-700">{item.currentAllocation.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">필요 수량</p>
                <p className="font-semibold text-gray-700">
                  {item.requiredAmount > 0 ? '+' : item.requiredAmount < 0 ? '-' : ''}
                  {item.requiredShares}주
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">필요 금액</p>
                <p className="font-semibold text-gray-700">
                  {item.requiredAmount > 0 ? '+' : ''}
                  {(item.requiredAmount / 10000).toFixed(0)}만원
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 당행 펀드 탭 컴포넌트
const FundsTab = ({ fundRecommendations, userProfile }) => {
  if (!fundRecommendations || fundRecommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">추천 가능한 펀드가 없습니다.</p>
      </div>
    );
  }

  const totalRecommendedAmount = fundRecommendations.reduce((sum, fund) => sum + fund.recommendedAmount, 0);

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 고객님의 투자성향 <strong>({riskLevelLabels[userProfile.riskTolerance]})</strong>에 맞는 펀드를 추천해드립니다.
        </p>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">추천 펀드 수</p>
          <p className="text-2xl font-bold text-purple-600">{fundRecommendations.length}개</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">추천 투자 금액</p>
          <p className="text-2xl font-bold text-green-600">{(totalRecommendedAmount / 10000).toLocaleString()}만원</p>
        </div>
      </div>

      {/* 펀드 카드 */}
      <div className="space-y-4">
        {fundRecommendations.map((fund, index) => (
          <div key={fund.code} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{fund.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{fund.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">위험도</p>
                <p className="text-sm font-semibold text-gray-900">
                  {riskLevelLabels[fund.riskLevel]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">기대수익률</p>
                <p className="text-sm font-semibold text-green-600">{fund.expectedReturn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">운용보수</p>
                <p className="text-sm font-semibold text-gray-900">{fund.managementFee}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">3년 수익률</p>
                <p className="text-sm font-semibold text-blue-600">{fund.threeYearReturn}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {fund.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">추천 투자 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {(fund.recommendedAmount / 10000).toLocaleString()}만원
              </p>
              <p className="text-xs text-blue-700 mt-2">
                추천 이유: {fund.reason}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                상세 보기
              </button>
              <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                적립식 시뮬레이션
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 펀드 투자 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💰 펀드 투자 시 예상 포트폴리오</h4>
        <p className="text-sm text-gray-600">
          개별 주식 60% + 펀드 40% 구성으로 분산투자 효과를 극대화할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

// ISA ETF 탭 컴포넌트
const ISATab = ({ isaRecommendations, userProfile }) => {
  if (!isaRecommendations || !isaRecommendations.etfs || isaRecommendations.etfs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">추천 가능한 ETF가 없습니다.</p>
      </div>
    );
  }

  const { etfs, totalAmount, expectedReturn, taxBenefit, strategy } = isaRecommendations;

  return (
    <div className="space-y-6">
      {/* ISA 세제 혜택 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          ISA 계좌로 세금 혜택 받으며 투자하세요
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          연 400만원 비과세 + 초과분 9.9% 분리과세 (일반 15.4% 대비)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">예상 배당수익</p>
            <p className="text-sm font-bold text-gray-900">
              {(taxBenefit.annualDividend / 10000).toLocaleString()}만원
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">예상 매매차익</p>
            <p className="text-sm font-bold text-gray-900">
              {(taxBenefit.estimatedCapitalGain / 10000).toLocaleString()}만원
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">일반 세금</p>
            <p className="text-sm font-bold text-red-600">
              {(taxBenefit.normalTax / 10000).toLocaleString()}만원
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">절세 효과</p>
            <p className="text-sm font-bold text-green-600">
              {(taxBenefit.taxSaving / 10000).toLocaleString()}만원
            </p>
          </div>
        </div>
      </div>

      {/* 투자 전략 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">📊 추천 투자 전략</h4>
        <p className="text-sm text-gray-700">{strategy}</p>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">총 투자금액</p>
          <p className="text-2xl font-bold text-blue-600">
            {(totalAmount / 10000).toLocaleString()}만원
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">예상 수익률</p>
          <p className="text-2xl font-bold text-green-600">{expectedReturn}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">추천 ETF 수</p>
          <p className="text-2xl font-bold text-purple-600">{etfs.length}개</p>
        </div>
      </div>

      {/* ETF 카드 */}
      <div className="space-y-4">
        {etfs.map((etf, index) => (
          <div key={etf.ticker} className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-sm font-bold rounded">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{etf.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    {etf.ticker}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{etf.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">카테고리</p>
                <p className="text-sm font-semibold text-gray-900">
                  {categoryLabels[etf.category]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">비용</p>
                <p className="text-sm font-semibold text-green-600">{etf.expenseRatio}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">배당수익률</p>
                <p className="text-sm font-semibold text-blue-600">{etf.dividendYield}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">3년 수익률</p>
                <p className="text-sm font-semibold text-purple-600">{etf.threeYearReturn}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {etf.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">추천 비중</p>
                  <p className="text-lg font-bold text-purple-600">{etf.allocation.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">투자 금액</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(etf.recommendedAmount / 10000).toLocaleString()}만원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">매수 수량</p>
                  <p className="text-lg font-bold text-gray-900">{etf.shares}주</p>
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-3">
                추천 이유: {etf.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h4 className="font-bold text-lg mb-2">ISA 계좌로 시작하세요</h4>
        <p className="text-sm mb-4 text-blue-50">
          연간 최대 {(taxBenefit.taxSaving / 10000).toLocaleString()}만원의 세금을 절약할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            ISA 계좌 개설하기
          </button>
          <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold">
            정기매수 설정
          </button>
        </div>
      </div>
    </div>
  );
};

// 제안 배지 컴포넌트
const SuggestionBadge = ({ suggestion }) => {
  const styles = {
    '매수': 'bg-green-100 text-green-700 border-green-300',
    '매도': 'bg-red-100 text-red-700 border-red-300',
    '유지': 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const icons = {
    '매수': <TrendingUp className="w-4 h-4" />,
    '매도': <TrendingDown className="w-4 h-4" />,
    '유지': <Minus className="w-4 h-4" />
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${styles[suggestion]}`}>
      {icons[suggestion]}
      {suggestion}
    </span>
  );
};

export default RebalancingModal;
