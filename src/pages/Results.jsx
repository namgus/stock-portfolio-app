import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Shield, DollarSign, PieChart as PieChartIcon, ArrowLeft, AlertCircle, Loader2, RefreshCw, Edit3, Save, X, Settings } from 'lucide-react';
import { generatePortfolio } from '../utils/portfolioRecommendation';
import { fetchStockData, getCacheStatus, clearCache } from '../utils/yahooFinanceApi';
import { extractStockCodes, updatePortfolioWithYahooData } from '../data/stockData';
import MPTAnalysis from '../components/MPTAnalysis';
import Backtesting from '../components/Backtesting';
import NewsSentiment from '../components/NewsSentiment';
import Recommendations from '../components/Recommendations';

// 모던하고 트렌디한 색상 팔레트 (그라데이션 효과를 위한 색상)
const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#14b8a6'  // Teal
];

const Results = ({ surveyData, onBack, onEditSettings }) => {
  const initialResult = useMemo(() => generatePortfolio(surveyData), [surveyData]);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

  // 포트폴리오 관리 상태
  const [portfolioData, setPortfolioData] = useState(() => {
    const saved = localStorage.getItem('portfolioData');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingStock, setEditingStock] = useState(null);
  const [editValues, setEditValues] = useState({ shares: '', buyPrice: '' });

  // 자동 새로고침 설정
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('autoRefresh');
    return saved ? JSON.parse(saved) : false;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved ? parseInt(saved) : 60; // 기본 60초
  });

  // 백엔드 서버는 항상 실행 중이므로 워밍업 불필요

  // 주식 시세 데이터 로드 (pykrx 사용)
  useEffect(() => {
    const loadStockPrices = async () => {
      setLoading(true);
      try {
        const stockCodes = extractStockCodes(initialResult.portfolio);

        console.log('주식 시세 데이터 로딩 중 (pykrx)...', stockCodes);

        // 캐시 상태 확인 및 데이터 가져오기를 동시에 실행
        const [cacheStatus, yahooData] = await Promise.all([
          getCacheStatus(),
          fetchStockData(stockCodes)
        ]);

        setCacheInfo(cacheStatus);

        if (yahooData && Object.keys(yahooData).length > 0) {
          console.log('받은 API 데이터:', yahooData);

          const updatedPortfolio = updatePortfolioWithYahooData(initialResult.portfolio, yahooData);
          console.log('업데이트된 포트폴리오:', updatedPortfolio);

          setResult({
            ...initialResult,
            portfolio: updatedPortfolio
          });

          // 업데이트 시간 설정 (이미 가져온 cacheStatus 사용)
          setLastUpdated(cacheStatus.timestamp || new Date().toLocaleString('ko-KR'));

          console.log('주식 시세 데이터 로드 완료:', Object.keys(yahooData).length, '개 종목');
        } else {
          console.warn('API 데이터가 비어있습니다.');
        }
      } catch (error) {
        console.error('백엔드 API 데이터 로드 실패:', error);
        console.error('백엔드 서버(http://localhost:3001)가 실행 중인지 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadStockPrices();
  }, [initialResult]);

  // 자동 새로고침 타이머
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(async () => {
      console.log('자동 새로고침 실행 중...');
      try {
        const stockCodes = extractStockCodes(initialResult.portfolio);
        const yahooData = await fetchStockData(stockCodes, true);

        if (yahooData && Object.keys(yahooData).length > 0) {
          const updatedPortfolio = updatePortfolioWithYahooData(initialResult.portfolio, yahooData);
          setResult({
            ...initialResult,
            portfolio: updatedPortfolio
          });

          const status = await getCacheStatus();
          setLastUpdated(status.timestamp || new Date().toLocaleString('ko-KR'));
          setCacheInfo(status);
        }
      } catch (error) {
        console.error('자동 새로고침 실패:', error);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, initialResult]);

  // 자동 새로고침 설정 저장
  useEffect(() => {
    localStorage.setItem('autoRefresh', JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem('refreshInterval', refreshInterval.toString());
  }, [refreshInterval]);

  // 수동 새로고침
  const handleRefresh = async () => {
    await clearCache();
    setLoading(true);

    try {
      const stockCodes = extractStockCodes(initialResult.portfolio);
      const yahooData = await fetchStockData(stockCodes, true); // 강제 새로고침

      if (yahooData && Object.keys(yahooData).length > 0) {
        const updatedPortfolio = updatePortfolioWithYahooData(initialResult.portfolio, yahooData);
        setResult({
          ...initialResult,
          portfolio: updatedPortfolio
        });

        const status = await getCacheStatus();
        setLastUpdated(status.timestamp || new Date().toLocaleString('ko-KR'));
        setCacheInfo(status);
      }
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 포트폴리오 데이터 관리 함수
  const handleEditStart = (ticker) => {
    const existing = portfolioData[ticker] || { shares: '', buyPrice: '' };
    setEditingStock(ticker);
    setEditValues(existing);
  };

  const handleEditSave = (ticker) => {
    const newData = {
      ...portfolioData,
      [ticker]: {
        shares: parseFloat(editValues.shares) || 0,
        buyPrice: parseFloat(editValues.buyPrice) || 0
      }
    };
    setPortfolioData(newData);
    localStorage.setItem('portfolioData', JSON.stringify(newData));
    setEditingStock(null);
  };

  const handleEditCancel = () => {
    setEditingStock(null);
    setEditValues({ shares: '', buyPrice: '' });
  };

  // 손익 계산 함수
  const calculateProfit = (stock) => {
    const data = portfolioData[stock.ticker];
    if (!data || !data.shares || !data.buyPrice) return null;

    const currentValue = stock.price * data.shares;
    const purchaseValue = data.buyPrice * data.shares;
    const profit = currentValue - purchaseValue;
    const profitPercent = (profit / purchaseValue) * 100;

    return {
      currentValue,
      purchaseValue,
      profit,
      profitPercent,
      shares: data.shares,
      buyPrice: data.buyPrice
    };
  };

  // 전체 포트폴리오 통계
  const totalStats = useMemo(() => {
    let totalCurrentValue = 0;
    let totalPurchaseValue = 0;
    let totalProfit = 0;

    result.portfolio.forEach(stock => {
      const profitData = calculateProfit(stock);
      if (profitData) {
        totalCurrentValue += profitData.currentValue;
        totalPurchaseValue += profitData.purchaseValue;
        totalProfit += profitData.profit;
      }
    });

    const totalProfitPercent = totalPurchaseValue > 0 ? (totalProfit / totalPurchaseValue) * 100 : 0;

    return {
      totalCurrentValue,
      totalPurchaseValue,
      totalProfit,
      totalProfitPercent,
      hasData: totalPurchaseValue > 0
    };
  }, [result.portfolio, portfolioData]);

  const chartData = result.portfolio.map((stock, index) => ({
    name: stock.name,
    value: stock.allocation,
    color: COLORS[index % COLORS.length]
  }));

  // 섹터별 분산도 계산
  const sectorData = useMemo(() => {
    const sectors = {};
    result.portfolio.forEach(stock => {
      const sector = stock.sector || 'other';
      if (!sectors[sector]) {
        sectors[sector] = { name: sector, value: 0, stocks: [] };
      }
      sectors[sector].value += stock.allocation;
      sectors[sector].stocks.push(stock.name);
    });

    const sectorLabels = {
      tech: 'IT/기술',
      finance: '금융',
      consumer: '소비재',
      healthcare: '헬스케어',
      energy: '에너지',
      materials: '소재',
      industrial: '산업재',
      telecom: '통신',
      etf: 'ETF',
      other: '기타'
    };

    return Object.values(sectors).map((sector, index) => ({
      ...sector,
      name: sectorLabels[sector.name] || sector.name,
      color: COLORS[index % COLORS.length]
    }));
  }, [result.portfolio]);

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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              처음으로 돌아가기
            </button>
            {onEditSettings && (
              <button
                onClick={onEditSettings}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Settings className="w-4 h-4" />
                설정 변경
              </button>
            )}
          </div>
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
                <span className="text-sm">주식 시세 데이터 로딩 중...</span>
              </div>
            )}
          </div>

          {/* 캐시 및 업데이트 정보 */}
          {lastUpdated && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 mr-1" />
                <span>마지막 업데이트: {lastUpdated}</span>
                {cacheInfo && cacheInfo.age !== null && (
                  <span className="ml-2 text-gray-500">
                    ({cacheInfo.age}시간 전)
                  </span>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>

              {/* 자동 새로고침 토글 */}
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoRefresh ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">자동 새로고침</span>
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={30}>30초</option>
                    <option value={60}>60초</option>
                    <option value={120}>2분</option>
                    <option value={300}>5분</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* 데이터 출처 정보 */}
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  pykrx 라이브러리를 통해 한국거래소(KRX)의 당일 시세 데이터를 가져옵니다.
                  장 마감 후(15:30) 최종 종가가 확정되며, 데이터는 서버에 캐시됩니다.
                  {cacheInfo && cacheInfo.isExpired && (
                    <span className="font-semibold"> (캐시가 만료되어 새로운 데이터를 가져옵니다.)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - 애니메이션 추가 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <style>
            {`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateX(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }

              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.8;
                }
              }
            `}
          </style>
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

          {/* 총 손익 카드 */}
          <div className={`bg-white rounded-xl shadow-md p-6 ${totalStats.hasData ? 'ring-2 ring-primary-200' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 평가손익</p>
                {totalStats.hasData ? (
                  <>
                    <p className={`text-2xl font-bold mt-1 ${totalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(Math.round(totalStats.totalProfit))}원
                    </p>
                    <p className={`text-sm mt-1 ${totalStats.totalProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalStats.totalProfitPercent >= 0 ? '+' : ''}{totalStats.totalProfitPercent.toFixed(2)}%
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-400 mt-1">보유 정보 입력</p>
                )}
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${totalStats.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${totalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            {totalStats.hasData && (
              <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>평가금액</span>
                  <span className="font-semibold">{formatCurrency(Math.round(totalStats.totalCurrentValue))}원</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>매수금액</span>
                  <span className="font-semibold">{formatCurrency(Math.round(totalStats.totalPurchaseValue))}원</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Portfolio Chart */}
          <div className="lg:col-span-1 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2 mr-3 shadow-md">
                <PieChartIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                포트폴리오 구성
              </h2>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {chartData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${value.toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${index})`}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2.5">
              {chartData.map((item, index) => (
                <div key={index} className="group flex items-center bg-white rounded-lg p-2.5 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200">
                  <div
                    className="w-5 h-5 rounded-md mr-3 shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 100%)` }}
                  />
                  <span className="text-sm text-gray-700 flex-1 font-medium">{item.name}</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatPercent(item.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* 섹터별 분산도 차트 */}
            <div className="mt-8 pt-8 border-t border-purple-200">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-1.5 mr-2 shadow-sm">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  섹터별 분산도
                </h3>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <defs>
                      {sectorData.map((entry, index) => (
                        <linearGradient key={`sector-gradient-${index}`} id={`sector-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }) => value >= 10 ? `${value.toFixed(0)}%` : ''}
                      outerRadius={80}
                      innerRadius={45}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`sector-${index}`}
                          fill={`url(#sector-gradient-${index})`}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value.toFixed(1)}% (${props.payload.stocks.join(', ')})`,
                        name
                      ]}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {sectorData.map((item, index) => (
                  <div key={index} className="group flex items-center bg-white rounded-lg p-2 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200">
                    <div
                      className="w-4 h-4 rounded mr-2.5 shadow-sm group-hover:shadow-md transition-shadow"
                      style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 100%)` }}
                    />
                    <span className="text-sm text-gray-700 flex-1 font-medium">{item.name}</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {formatPercent(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">추천 종목 상세</h2>
            <div className="space-y-4">
              {result.portfolio.map((stock, index) => {
                const profitData = calculateProfit(stock);
                const isEditing = editingStock === stock.ticker;

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      profitData
                        ? 'border-primary-300 bg-primary-50/20'
                        : 'border-gray-100 hover:border-primary-200 hover:bg-primary-50/30'
                    }`}
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
                      <div className="text-right ml-4 flex items-center gap-2">
                        <div>
                          <div className="text-2xl font-bold text-primary-600">
                            {formatPercent(stock.allocation)}
                          </div>
                          <div className="text-sm text-gray-500">비중</div>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => handleEditStart(stock.ticker)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="보유 정보 입력"
                          >
                            <Edit3 className="w-5 h-5 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 보유 정보 입력 폼 */}
                    {isEditing && (
                      <div className="mt-4 p-4 bg-white border-2 border-primary-400 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">보유 정보 입력</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              보유 수량
                            </label>
                            <input
                              type="number"
                              value={editValues.shares}
                              onChange={(e) => setEditValues({ ...editValues, shares: e.target.value })}
                              placeholder="예: 10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              매수가 (원)
                            </label>
                            <input
                              type="number"
                              value={editValues.buyPrice}
                              onChange={(e) => setEditValues({ ...editValues, buyPrice: e.target.value })}
                              placeholder="예: 100000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditSave(stock.ticker)}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            저장
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4 mr-2" />
                            취소
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 손익 정보 표시 */}
                    {profitData && !isEditing && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-600">보유수량</p>
                            <p className="text-sm font-semibold text-gray-900">{profitData.shares}주</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">매수가</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(profitData.buyPrice))}원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">평가금액</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(profitData.currentValue))}원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">평가손익</p>
                            <p className={`text-sm font-bold ${profitData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profitData.profit >= 0 ? '+' : ''}{formatCurrency(Math.round(profitData.profit))}원
                              <span className="ml-1 text-xs">({profitData.profitPercent >= 0 ? '+' : ''}{profitData.profitPercent.toFixed(2)}%)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">현재가</p>
                        {stock.price ? (
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(stock.price))}원</p>
                        ) : (
                          <p className="text-sm text-gray-400">로딩 중...</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">전일종가</p>
                        {stock.previousClose ? (
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(Math.round(stock.previousClose))}원</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      {(stock.dayHigh && stock.dayLow) ? (
                        <div>
                          <p className="text-xs text-gray-500">일일 범위</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(Math.round(stock.dayLow))} - {formatCurrency(Math.round(stock.dayHigh))}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">일일 범위</p>
                          <p className="text-sm text-gray-400">-</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">PER</p>
                        {stock.per ? (
                          <p className="text-sm font-semibold text-gray-900">{stock.per}</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">PBR</p>
                        {stock.priceToBook ? (
                          <p className="text-sm font-semibold text-gray-900">{stock.priceToBook}</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">배당수익률</p>
                        {stock.dividendYield ? (
                          <p className="text-sm font-semibold text-green-600">{stock.dividendYield}%</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">시가총액</p>
                        {stock.marketCap ? (
                          <p className="text-sm font-semibold text-gray-900">
                            {(stock.marketCap / 1000000000000).toFixed(1)}조원
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">거래량</p>
                        {stock.volume ? (
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(stock.volume)}</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* MPT Analysis Section */}
        <div className="mb-8">
          <MPTAnalysis portfolio={result.portfolio} />
        </div>

        {/* Backtesting Section */}
        <div className="mb-8">
          <Backtesting portfolio={result.portfolio} />
        </div>

        {/* News Sentiment Section */}
        <div className="mb-8">
          <NewsSentiment portfolio={result.portfolio} />
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-8">
          <Recommendations
            portfolio={result.portfolio}
            riskTolerance={surveyData?.riskTolerance || 'moderate'}
          />
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
