import { useState, useEffect } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { TrendingUp, Activity, Award, Loader2, HelpCircle, Info, BookOpen } from 'lucide-react';

const MPTAnalysis = ({ portfolio }) => {
  const [mptData, setMptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchMPTAnalysis = async () => {
      if (!portfolio || portfolio.length < 2) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 포트폴리오에서 ticker 추출
        const tickers = portfolio.map(stock => stock.ticker).filter(Boolean);

        if (tickers.length < 2) {
          setError('MPT 분석을 위해서는 최소 2개 이상의 종목이 필요합니다.');
          return;
        }

        console.log('MPT 분석 시작:', tickers);

        // MPT API 호출
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/mpt/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tickers }),
        });

        if (!response.ok) {
          throw new Error('MPT 분석 API 호출 실패');
        }

        const data = await response.json();
        console.log('MPT 분석 결과:', data);
        setMptData(data);
      } catch (err) {
        console.error('MPT 분석 오류:', err);
        setError(err.message || 'MPT 분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMPTAnalysis();
  }, [portfolio]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mr-3" />
          <span className="text-lg text-gray-600">MPT 분석 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12 text-red-600">
          <Activity className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!mptData) {
    return null;
  }

  const { optimal_portfolio, minimum_variance_portfolio, efficient_frontier, individual_stats, ticker_names, tickers } = mptData;

  // 효율적 투자선 데이터 포맷팅
  const frontierData = efficient_frontier.map((point, index) => ({
    volatility: point.volatility,
    return: point.return,
    name: `Portfolio ${index + 1}`,
  }));

  // 최적 포트폴리오 및 최소 변동성 포트폴리오 포인트 추가
  const specialPoints = [
    {
      volatility: optimal_portfolio.volatility,
      return: optimal_portfolio.expected_return,
      name: '최적 포트폴리오',
      type: 'optimal',
      z: 150,
    },
    {
      volatility: minimum_variance_portfolio.volatility,
      return: minimum_variance_portfolio.expected_return,
      name: '최소 변동성',
      type: 'minvar',
      z: 150,
    },
  ];

  // 개별 종목 포인트 추가
  const individualPoints = individual_stats.map(stat => ({
    volatility: stat.volatility,
    return: stat.expected_return,
    name: ticker_names[stat.ticker] || stat.ticker,
    type: 'individual',
    z: 100,
  }));

  // 모든 포인트 합치기
  const allPoints = [...specialPoints, ...individualPoints];

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold">Modern Portfolio Theory 분석</h2>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">쉬운 설명 {showExplanation ? '숨기기' : '보기'}</span>
          </button>
        </div>
        <p className="text-blue-50 text-lg">
          효율적 투자선과 최적 포트폴리오를 기반으로 한 과학적 자산 배분
        </p>
      </div>

      {/* 쉬운 설명 섹션 */}
      {showExplanation && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
          <div className="flex items-start gap-3 mb-6">
            <Info className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">MPT란 무엇인가요?</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Modern Portfolio Theory(현대 포트폴리오 이론)는 <strong>"계란을 한 바구니에 담지 말라"</strong>는 속담을
                수학적으로 증명한 이론입니다. 노벨 경제학상을 받은 해리 마코위츠 교수가 1952년에 개발했습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">핵심 아이디어</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                여러 종목에 분산 투자하면 <strong>전체 위험을 줄이면서도 수익을 높일 수 있습니다.</strong>
                주식들이 항상 같은 방향으로 움직이지 않기 때문입니다.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">효율적 투자선</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                같은 위험에서 <strong>가장 높은 수익</strong>을 내거나, 같은 수익에서 <strong>가장 낮은 위험</strong>을
                가진 포트폴리오들의 조합입니다.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">최적 포트폴리오</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                <strong>샤프 비율이 가장 높은</strong> 포트폴리오입니다. 즉, 감수한 위험 대비
                가장 효율적으로 수익을 내는 조합입니다.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">최소 변동성</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                <strong>가장 안정적인</strong> 포트폴리오입니다. 가격 변동이 적어
                심리적으로 편안하게 보유할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-gray-600" />
              주요 용어 쉽게 이해하기
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="font-semibold text-green-600 min-w-[120px]">기대 수익률</span>
                <span className="text-gray-600">과거 1년간의 데이터를 기반으로 계산한 예상 수익률 (연환산)</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-orange-600 min-w-[120px]">변동성 (위험)</span>
                <span className="text-gray-600">주가가 얼마나 크게 오르락내리락 하는지를 나타냄. 낮을수록 안정적</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-blue-600 min-w-[120px]">샤프 비율</span>
                <span className="text-gray-600">위험 대비 수익률. (수익률 - 무위험수익률) ÷ 변동성. 높을수록 효율적</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-purple-600 min-w-[120px]">상관관계</span>
                <span className="text-gray-600">두 주식이 함께 움직이는 정도. 낮을수록 분산효과가 큼</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              어떻게 계산되나요?
            </h4>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">①</span>
                <span><strong>과거 데이터 수집:</strong> 최근 1년간(약 250거래일)의 일별 주가 데이터를 가져옵니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">②</span>
                <span><strong>수익률 계산:</strong> 매일매일의 가격 변화율(%)을 계산하고, 이를 연간 수익률로 환산합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">③</span>
                <span><strong>위험 측정:</strong> 수익률의 표준편차(흔들림 정도)를 계산하여 변동성을 구합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">④</span>
                <span><strong>상관관계 분석:</strong> 종목들이 서로 얼마나 비슷하게 움직이는지 분석합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">⑤</span>
                <span><strong>최적 비중 찾기:</strong> 수학적 최적화 기법으로 샤프 비율을 최대화하는 비중을 계산합니다.</span>
              </li>
            </ol>
          </div>

          <div className="mt-6 bg-amber-100 rounded-xl p-4 border border-amber-300">
            <p className="text-sm text-amber-900 flex items-start gap-2">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>주의사항:</strong> 이 분석은 과거 데이터를 기반으로 하므로 미래 수익을 보장하지 않습니다.
                실제 투자 시에는 시장 상황, 개인의 투자 성향, 리스크 허용도를 종합적으로 고려하세요.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 최적 포트폴리오 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">최적 포트폴리오</h3>
            </div>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                샤프 비율을 최대화한 포트폴리오입니다. 위험 대비 가장 효율적으로 수익을 낼 수 있는 비중입니다.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">기대 수익률 (연)</span>
              <span className="text-green-600 font-bold">{optimal_portfolio.expected_return.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">변동성 (위험)</span>
              <span className="text-gray-900 font-semibold">{optimal_portfolio.volatility.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">샤프 비율</span>
              <span className="text-blue-600 font-bold">{optimal_portfolio.sharpe_ratio.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 최소 변동성 포트폴리오 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">최소 변동성</h3>
            </div>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                가격 변동이 가장 적은 포트폴리오입니다. 안정성을 추구하는 투자자에게 적합합니다.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">기대 수익률 (연)</span>
              <span className="text-green-600 font-bold">{minimum_variance_portfolio.expected_return.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">변동성 (위험)</span>
              <span className="text-gray-900 font-semibold">{minimum_variance_portfolio.volatility.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">샤프 비율</span>
              <span className="text-blue-600 font-bold">{minimum_variance_portfolio.sharpe_ratio.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 분석 기간 정보 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">분석 정보</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">시작일</span>
              <span className="text-gray-900 font-semibold">
                {mptData.data_period.start.substring(0, 4)}-{mptData.data_period.start.substring(4, 6)}-{mptData.data_period.start.substring(6, 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">종료일</span>
              <span className="text-gray-900 font-semibold">
                {mptData.data_period.end.substring(0, 4)}-{mptData.data_period.end.substring(4, 6)}-{mptData.data_period.end.substring(6, 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">거래일 수</span>
              <span className="text-gray-900 font-semibold">{mptData.data_period.days}일</span>
            </div>
          </div>
        </div>
      </div>

      {/* 효율적 투자선 차트 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">효율적 투자선 (Efficient Frontier)</h3>
            <p className="text-gray-600">
              동일한 위험에서 가장 높은 수익을 내거나, 동일한 수익에서 가장 낮은 위험을 가진 포트폴리오들의 집합
            </p>
          </div>
          <div className="group relative">
            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help flex-shrink-0" />
            <div className="absolute right-0 w-80 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <p className="mb-2"><strong>차트 읽는 법:</strong></p>
              <ul className="space-y-1">
                <li>• X축(오른쪽): 변동성(위험)이 클수록 오른쪽</li>
                <li>• Y축(위): 기대 수익률이 높을수록 위쪽</li>
                <li>• 별 모양: 최적 포트폴리오 (추천)</li>
                <li>• 삼각형: 최소 변동성 (안정적)</li>
                <li>• 다이아몬드: 개별 종목</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <Info className="inline h-4 w-4 mr-1" />
            <strong>TIP:</strong> 효율적 투자선 위에 있는 포트폴리오들이 최적의 조합입니다.
            같은 위험이라면 더 높은 수익을, 같은 수익이라면 더 낮은 위험을 추구하세요.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="volatility"
              name="변동성"
              unit="%"
              label={{ value: '변동성 (위험) →', position: 'bottom', offset: 40 }}
            />
            <YAxis
              type="number"
              dataKey="return"
              name="수익률"
              unit="%"
              label={{ value: '← 기대 수익률', angle: -90, position: 'left', offset: 40 }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
                      <p className="text-sm text-gray-600">수익률: <span className="font-semibold text-green-600">{data.return.toFixed(2)}%</span></p>
                      <p className="text-sm text-gray-600">변동성: <span className="font-semibold text-gray-900">{data.volatility.toFixed(2)}%</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              content={() => (
                <div className="flex justify-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-sm text-gray-600">효율적 투자선</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">최적 포트폴리오</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">최소 변동성</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <span className="text-sm text-gray-600">개별 종목</span>
                  </div>
                </div>
              )}
            />
            {/* 효율적 투자선 */}
            <Scatter
              name="효율적 투자선"
              data={frontierData}
              fill="#9ca3af"
              line={{ stroke: '#6b7280', strokeWidth: 2 }}
              shape="circle"
            />
            {/* 최적 포트폴리오 */}
            <Scatter
              name="최적 포트폴리오"
              data={specialPoints.filter(p => p.type === 'optimal')}
              fill="#22c55e"
              shape="star"
            />
            {/* 최소 변동성 */}
            <Scatter
              name="최소 변동성"
              data={specialPoints.filter(p => p.type === 'minvar')}
              fill="#3b82f6"
              shape="triangle"
            />
            {/* 개별 종목 */}
            <Scatter
              name="개별 종목"
              data={individualPoints}
              fill="#f97316"
              shape="diamond"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 최적 포트폴리오 비중 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">최적 포트폴리오 비중</h3>
            <p className="text-gray-600 text-sm">샤프 비율을 최대화한 추천 투자 비중</p>
          </div>
          <div className="group relative">
            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help flex-shrink-0" />
            <div className="absolute right-0 w-72 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <p className="mb-2"><strong>샤프 비율이란?</strong></p>
              <p>위험(변동성) 1단위당 얻을 수 있는 초과 수익률입니다. 예를 들어, 샤프 비율이 2.0이면 위험 1%를 감수할 때마다 무위험 수익률보다 2%의 추가 수익을 기대할 수 있습니다.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {optimal_portfolio.weights.map((weight, index) => {
            const ticker = tickers[index];
            const name = ticker_names[ticker] || ticker;
            const percentage = (weight * 100).toFixed(2);

            return (
              <div key={ticker || index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">{name}</span>
                  <span className="text-gray-600">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>참고:</strong> 이 비중은 과거 1년간의 데이터를 기반으로 샤프 비율을 최대화하도록 계산되었습니다.
            실제 투자 시에는 시장 상황, 개인의 투자 성향, 리스크 허용도 등을 종합적으로 고려해야 합니다.
          </p>
        </div>
      </div>

      {/* 개별 종목 통계 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">개별 종목 통계</h3>
          <div className="group relative">
            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-72 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              각 종목을 단독으로 투자했을 때의 예상 성과입니다. 포트폴리오로 조합하면 분산 효과로 더 나은 위험-수익 프로파일을 얻을 수 있습니다.
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기대 수익률 (연)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  변동성 (위험)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  샤프 비율
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {individual_stats.map((stat) => (
                <tr key={stat.ticker} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticker_names[stat.ticker] || stat.ticker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {stat.expected_return.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.volatility.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {stat.sharpe_ratio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MPTAnalysis;
