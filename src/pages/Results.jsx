import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Shield, DollarSign, PieChart as PieChartIcon, ArrowLeft, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { generatePortfolio } from '../utils/portfolioRecommendation';
import { getBatchStockPrices, isApiKeyConfigured, getLatestBusinessDate } from '../utils/publicDataApi';
import { extractStockCodes, updatePortfolioWithApiPrices } from '../data/stockData';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Results = ({ surveyData, onBack }) => {
  const initialResult = useMemo(() => generatePortfolio(surveyData), [surveyData]);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(isApiKeyConfigured());
  const [lastUpdated, setLastUpdated] = useState(null);

  // API에서 실시간 데이터 로드
  useEffect(() => {
    const loadStockPrices = async () => {
      if (!apiEnabled) {
        console.log('API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다.');
        return;
      }

      setLoading(true);
      try {
        const stockCodes = extractStockCodes(initialResult.portfolio);
        const businessDate = getLatestBusinessDate();

        console.log('주식 시세 데이터 로딩 중...', stockCodes);
        const apiPrices = await getBatchStockPrices(stockCodes, businessDate);

        if (apiPrices && Object.keys(apiPrices).length > 0) {
          const updatedPortfolio = updatePortfolioWithApiPrices(initialResult.portfolio, apiPrices);
          setResult({
            ...initialResult,
            portfolio: updatedPortfolio
          });
          setLastUpdated(new Date().toLocaleString('ko-KR'));
          console.log('주식 시세 데이터 로드 완료');
        }
      } catch (error) {
        console.error('주식 시세 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStockPrices();
  }, [apiEnabled, initialResult]);

  const chartData = result.portfolio.map((stock, index) => ({
    name: stock.name,
    value: stock.allocation,
    color: COLORS[index % COLORS.length]
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            처음으로 돌아가기
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                맞춤형 포트폴리오 추천 결과
              </h1>
              <p className="mt-2 text-lg text-gray-600">{result.strategy}</p>
            </div>
            {loading && (
              <div className="flex items-center text-primary-600">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm">실시간 데이터 로딩 중...</span>
              </div>
            )}
          </div>

          {/* API 상태 알림 */}
          {!apiEnabled && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    API 키가 설정되지 않아 샘플 데이터를 사용합니다.
                    <a
                      href="https://www.data.go.kr/data/15094808/openapi.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline ml-1"
                    >
                      공공데이터포털
                    </a>
                    에서 API 키를 발급받아 .env 파일에 설정하세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {apiEnabled && lastUpdated && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 mr-1" />
              마지막 업데이트: {lastUpdated}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">리스크 수준</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.riskLevel.level}</p>
                <p className="text-sm text-gray-500 mt-1">{result.riskLevel.description}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(result.riskLevel.score / 10) * 100}%` }}
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">{result.riskLevel.score}/10</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예상 수익률 (연)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {result.expectedReturn.min}% - {result.expectedReturn.max}%
                </p>
                <p className="text-sm text-gray-500 mt-1">장기 투자 기준</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 종목 수</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.portfolio.length}개</p>
                <p className="text-sm text-gray-500 mt-1">다양한 섹터 분산</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <PieChartIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Portfolio Chart */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">포트폴리오 구성</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercent(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">추천 종목 상세</h2>
            <div className="space-y-4">
              {result.portfolio.map((stock, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-100 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-bold text-gray-900">{stock.name}</h3>
                        <span className="ml-3 text-sm text-gray-500">({stock.ticker})</span>
                        {stock.lastUpdated && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            실시간
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{stock.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatPercent(stock.allocation)}
                      </div>
                      <div className="text-sm text-gray-500">비중</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500">현재가</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(stock.price)}원</p>
                    </div>
                    {stock.per && (
                      <div>
                        <p className="text-xs text-gray-500">PER</p>
                        <p className="text-sm font-semibold text-gray-900">{stock.per}</p>
                      </div>
                    )}
                    {stock.roe && (
                      <div>
                        <p className="text-xs text-gray-500">ROE</p>
                        <p className="text-sm font-semibold text-gray-900">{stock.roe}%</p>
                      </div>
                    )}
                    {stock.dividendYield && (
                      <div>
                        <p className="text-xs text-gray-500">배당수익률</p>
                        <p className="text-sm font-semibold text-green-600">{stock.dividendYield}%</p>
                      </div>
                    )}
                    {stock.volume && (
                      <div>
                        <p className="text-xs text-gray-500">거래량</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(stock.volume)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ISA Tax Savings Section */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ISA 절세 계좌 추천</h2>
              <div className="bg-white rounded-lg p-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">계좌 유형</h3>
                    <p className="text-lg text-primary-600 font-bold">{result.isaRecommendation.isaType}</p>
                    <p className="text-sm text-gray-600 mt-2">{result.isaRecommendation.recommendation}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">절세 혜택</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      수익금 <span className="font-bold text-green-600">{result.isaRecommendation.taxBenefit}만원</span>까지 비과세
                    </p>
                    <p className="text-sm text-gray-600">
                      예상 연간 절세액: <span className="font-bold text-green-600">{result.isaRecommendation.estimatedTaxSavings}만원</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">추천 계좌 구조</h3>
                  <p className="text-gray-700">{result.isaRecommendation.accountStructure}</p>
                  <div className="mt-3 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900 ml-2">
                        배당 수익이 발생하는 종목은 ISA 계좌에 배치하면 세금 혜택을 극대화할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">포트폴리오 총평</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{result.summary}</p>
          <div className="mt-6 pt-6 border-t">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">투자 유의사항</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>본 추천은 참고용이며, 실제 투자 결정은 본인의 책임입니다.</li>
                      <li>시장 상황에 따라 수익률은 변동될 수 있습니다.</li>
                      <li>정기적인 리밸런싱을 통해 포트폴리오를 관리하세요.</li>
                      <li>분산 투자를 통해 리스크를 관리하는 것이 중요합니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
