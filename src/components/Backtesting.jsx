import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Award, Target, Loader2, Calendar } from 'lucide-react';

const Backtesting = ({ portfolio }) => {
  const [backtestData, setBacktestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runBacktest = async () => {
      if (!portfolio || portfolio.length < 1) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 포트폴리오에서 ticker와 비중 추출
        const tickers = portfolio.map(stock => stock.ticker).filter(Boolean);
        const allocations = portfolio.map(stock => stock.allocation / 100);

        // 비중 정규화 (합계 1.0으로)
        const totalAllocation = allocations.reduce((sum, a) => sum + a, 0);
        const weights = allocations.map(a => a / totalAllocation);

        if (tickers.length < 1) {
          setError('백테스팅을 위한 종목 정보가 부족합니다.');
          return;
        }

        console.log('백테스팅 시작:', tickers, weights);

        // 백테스팅 API 호출
        const response = await fetch('http://localhost:3001/api/backtest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tickers,
            weights,
            initialInvestment: 10000000, // 1000만원
          }),
        });

        if (!response.ok) {
          throw new Error('백테스팅 API 호출 실패');
        }

        const data = await response.json();
        console.log('백테스팅 결과:', data);
        setBacktestData(data);
      } catch (err) {
        console.error('백테스팅 오류:', err);
        setError(err.message || '백테스팅 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    runBacktest();
  }, [portfolio]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mr-3" />
          <span className="text-lg text-gray-600">백테스팅 실행 중...</span>
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

  if (!backtestData) {
    return null;
  }

  const { metrics, history, benchmark, monthly_returns, individual_performance, ticker_names } = backtestData;

  // 수익률이 양수인지 음수인지
  const isProfit = metrics.total_return >= 0;

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-8 w-8 mr-3" />
          <h2 className="text-3xl font-bold">포트폴리오 백테스팅</h2>
        </div>
        <p className="text-purple-50 text-lg">
          과거 1년간 이 포트폴리오의 실제 성과를 시뮬레이션한 결과입니다
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 수익률 */}
        <div className={`bg-white rounded-xl shadow-md p-6 border-2 ${isProfit ? 'border-green-200' : 'border-red-200'}`}>
          <div className="flex items-center mb-4">
            {isProfit ? (
              <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">총 수익률</h3>
          </div>
          <p className={`text-3xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.total_return >= 0 ? '+' : ''}{metrics.total_return.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {metrics.profit >= 0 ? '+' : ''}{metrics.profit.toLocaleString()}원
          </p>
        </div>

        {/* 연간 수익률 (CAGR) */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">연간 수익률</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.cagr.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">CAGR</p>
        </div>

        {/* 샤프 비율 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">샤프 비율</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {metrics.sharpe_ratio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-2">위험 대비 수익</p>
        </div>

        {/* 최대 손실 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-200">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">최대 손실</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {metrics.max_drawdown.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">MDD</p>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">상세 통계</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">초기 투자금</p>
            <p className="text-lg font-semibold text-gray-900">
              {metrics.initial_investment.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">최종 자산</p>
            <p className="text-lg font-semibold text-gray-900">
              {metrics.final_value.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">변동성</p>
            <p className="text-lg font-semibold text-gray-900">
              {metrics.volatility.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">승률</p>
            <p className="text-lg font-semibold text-gray-900">
              {metrics.win_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 포트폴리오 가치 변화 차트 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">포트폴리오 가치 변화</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={history} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              label={{ value: '날짜', position: 'bottom', offset: 40 }}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              label={{ value: '포트폴리오 가치 (원)', angle: -90, position: 'insideLeft', offset: 10 }}
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900">{data.date}</p>
                      <p className="text-sm text-gray-600">
                        가치: <span className="font-semibold text-purple-600">{data.value.toLocaleString()}원</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        수익률: <span className={`font-semibold ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.return >= 0 ? '+' : ''}{data.return.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 벤치마크 비교 */}
      {benchmark && (
        <div className={`rounded-2xl shadow-lg p-8 ${benchmark.outperformed ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">벤치마크 비교</h3>
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">벤치마크</p>
                <p className="text-lg font-semibold text-gray-900">{benchmark.benchmark_name}</p>
                <p className="text-2xl font-bold text-gray-700 mt-2">
                  +{benchmark.benchmark_return.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">내 포트폴리오</p>
                <p className="text-lg font-semibold text-gray-900">추천 포트폴리오</p>
                <p className={`text-2xl font-bold mt-2 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.total_return >= 0 ? '+' : ''}{metrics.total_return.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">초과 수익</p>
                <p className={`text-lg font-semibold ${benchmark.outperformed ? 'text-green-600' : 'text-orange-600'}`}>
                  {benchmark.outperformed ? '벤치마크 초과' : '벤치마크 미달'}
                </p>
                <p className={`text-2xl font-bold mt-2 ${benchmark.excess_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {benchmark.excess_return >= 0 ? '+' : ''}{benchmark.excess_return.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 개별 종목 성과 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">개별 종목 성과</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변동성</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기여도</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {individual_performance.map((perf) => (
                <tr key={perf.ticker} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticker_names[perf.ticker] || perf.ticker}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${perf.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {perf.total_return >= 0 ? '+' : ''}{perf.total_return.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {perf.volatility.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${perf.contribution >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {perf.contribution >= 0 ? '+' : ''}{perf.contribution.toFixed(2)}%p
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 월별 수익률 */}
      {monthly_returns && monthly_returns.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">월별 수익률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly_returns} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: '월', position: 'bottom', offset: 40 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                label={{ value: '수익률 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900">{data.month}</p>
                        <p className={`text-sm font-semibold ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.return >= 0 ? '+' : ''}{data.return.toFixed(2)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="return"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 주의사항 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <div className="flex">
          <Calendar className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-yellow-900 mb-2">백테스팅 주의사항</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 과거 성과가 미래 수익을 보장하지 않습니다</li>
              <li>• 백테스팅은 거래 비용, 세금, 슬리피지를 고려하지 않습니다</li>
              <li>• 실제 투자 시에는 시장 상황과 개인 상황을 고려해야 합니다</li>
              <li>• 이 결과는 참고용이며, 투자 결정의 유일한 기준이 되어서는 안 됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtesting;
