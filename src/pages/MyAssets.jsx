import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, ArrowLeft, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { fetchStockData } from '../utils/yahooFinanceApi';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// 샘플 자산 데이터
const SAMPLE_ASSETS = [
  {
    ticker: '005930',
    name: '삼성전자',
    shares: 50,
    buyPrice: 95000,
    sector: 'tech'
  },
  {
    ticker: '035420',
    name: 'NAVER',
    shares: 10,
    buyPrice: 240000,
    sector: 'tech'
  },
  {
    ticker: '005380',
    name: '현대차',
    shares: 20,
    buyPrice: 260000,
    sector: 'consumer'
  },
  {
    ticker: '006400',
    name: '삼성SDI',
    shares: 5,
    buyPrice: 310000,
    sector: 'energy'
  },
  {
    ticker: '035720',
    name: '카카오',
    shares: 30,
    buyPrice: 68000,
    sector: 'tech'
  },
  {
    ticker: '069500',
    name: 'KODEX 200',
    shares: 100,
    buyPrice: 57000,
    sector: 'etf'
  }
];

const MyAssets = ({ onBack }) => {
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('myAssets');
    return saved ? JSON.parse(saved) : SAMPLE_ASSETS;
  });

  const [loading, setLoading] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [editingAsset, setEditingAsset] = useState(null);
  const [editValues, setEditValues] = useState({ shares: '', buyPrice: '' });

  // 실시간 시세 로드
  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        const tickers = assets.map(a => a.ticker);
        const data = await fetchStockData(tickers);
        if (data) {
          setStockPrices(data);
        }
      } catch (error) {
        console.error('시세 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [assets]);

  // 자산 저장
  useEffect(() => {
    localStorage.setItem('myAssets', JSON.stringify(assets));
  }, [assets]);

  // 자산 계산
  const enrichedAssets = useMemo(() => {
    return assets.map(asset => {
      const currentPrice = stockPrices[asset.ticker]?.price || asset.buyPrice;
      const currentValue = currentPrice * asset.shares;
      const purchaseValue = asset.buyPrice * asset.shares;
      const profit = currentValue - purchaseValue;
      const profitPercent = (profit / purchaseValue) * 100;

      return {
        ...asset,
        currentPrice,
        currentValue,
        purchaseValue,
        profit,
        profitPercent
      };
    });
  }, [assets, stockPrices]);

  // 총 자산 통계
  const totalStats = useMemo(() => {
    const totalCurrentValue = enrichedAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalPurchaseValue = enrichedAssets.reduce((sum, a) => sum + a.purchaseValue, 0);
    const totalProfit = totalCurrentValue - totalPurchaseValue;
    const totalProfitPercent = (totalProfit / totalPurchaseValue) * 100;

    return {
      totalCurrentValue,
      totalPurchaseValue,
      totalProfit,
      totalProfitPercent
    };
  }, [enrichedAssets]);

  // 섹터별 자산 분포
  const sectorData = useMemo(() => {
    const sectors = {};
    enrichedAssets.forEach(asset => {
      const sector = asset.sector || 'other';
      if (!sectors[sector]) {
        sectors[sector] = { name: sector, value: 0 };
      }
      sectors[sector].value += asset.currentValue;
    });

    const sectorLabels = {
      tech: 'IT/기술',
      finance: '금융',
      consumer: '소비재',
      healthcare: '헬스케어',
      energy: '에너지',
      etf: 'ETF',
      other: '기타'
    };

    return Object.entries(sectors).map(([key, data], index) => ({
      name: sectorLabels[key] || key,
      value: data.value,
      color: COLORS[index % COLORS.length]
    }));
  }, [enrichedAssets]);

  // 편집 기능
  const handleEditStart = (asset) => {
    setEditingAsset(asset.ticker);
    setEditValues({ shares: asset.shares, buyPrice: asset.buyPrice });
  };

  const handleEditSave = (ticker) => {
    setAssets(prev => prev.map(a =>
      a.ticker === ticker
        ? { ...a, shares: parseFloat(editValues.shares) || 0, buyPrice: parseFloat(editValues.buyPrice) || 0 }
        : a
    ));
    setEditingAsset(null);
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
    setEditValues({ shares: '', buyPrice: '' });
  };

  const handleDeleteAsset = (ticker) => {
    if (confirm('이 자산을 삭제하시겠습니까?')) {
      setAssets(prev => prev.filter(a => a.ticker !== ticker));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value));
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
            돌아가기
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                내 자산 현황
              </h1>
              <p className="mt-2 text-lg text-gray-600">실시간 평가 손익을 확인하세요</p>
            </div>
            {loading && (
              <div className="flex items-center text-primary-600">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm">시세 업데이트 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 총 자산 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">총 평가금액</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(totalStats.totalCurrentValue)}원</p>
            <p className="text-sm mt-2 opacity-75">{enrichedAssets.length}개 종목 보유</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600">총 매수금액</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalStats.totalPurchaseValue)}원</p>
          </div>

          <div className={`bg-white rounded-xl shadow-md p-6 ring-2 ${totalStats.totalProfit >= 0 ? 'ring-green-200' : 'ring-red-200'}`}>
            <p className="text-sm text-gray-600">총 평가손익</p>
            <p className={`text-2xl font-bold mt-2 ${totalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(totalStats.totalProfit)}원
            </p>
            <p className={`text-sm mt-1 ${totalStats.totalProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalStats.totalProfitPercent >= 0 ? '+' : ''}{totalStats.totalProfitPercent.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-primary-600 mb-2" />
              <p className="text-sm text-gray-600">자산 관리</p>
            </div>
          </div>
        </div>

        {/* 차트와 자산 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 자산 분포 차트 */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">자산 구성</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={enrichedAssets.map((a, i) => ({ name: a.name, value: a.currentValue, color: COLORS[i % COLORS.length] }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {enrichedAssets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatCurrency(value)}원`} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-bold text-gray-900 mb-4">섹터별 분포</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => name}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`sector-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatCurrency(value)}원`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 자산 목록 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">보유 자산 상세</h2>
            <div className="space-y-4">
              {enrichedAssets.map((asset, index) => {
                const isEditing = editingAsset === asset.ticker;

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      asset.profit >= 0 ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{asset.name}</h3>
                          <span className="text-sm text-gray-500">({asset.ticker})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => handleEditStart(asset)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.ticker)}
                              className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="p-4 bg-white border-2 border-primary-400 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">보유 수량</label>
                            <input
                              type="number"
                              value={editValues.shares}
                              onChange={(e) => setEditValues({ ...editValues, shares: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">매수가</label>
                            <input
                              type="number"
                              value={editValues.buyPrice}
                              onChange={(e) => setEditValues({ ...editValues, buyPrice: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(asset.ticker)}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            저장
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-600">보유수량</p>
                            <p className="text-sm font-semibold text-gray-900">{asset.shares}주</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">매수가</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(asset.buyPrice)}원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">현재가</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(asset.currentPrice)}원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">평가금액</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(asset.currentValue)}원</p>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg ${asset.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {asset.profit >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                              )}
                              <span className="text-sm font-medium text-gray-700">평가손익</span>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${asset.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {asset.profit >= 0 ? '+' : ''}{formatCurrency(asset.profit)}원
                              </p>
                              <p className={`text-sm ${asset.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {asset.profitPercent >= 0 ? '+' : ''}{asset.profitPercent.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAssets;
