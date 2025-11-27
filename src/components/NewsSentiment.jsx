import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const NewsSentiment = ({ portfolio }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStocks, setExpandedStocks] = useState({});

  useEffect(() => {
    const fetchNewsSentiment = async () => {
      if (!portfolio || portfolio.length === 0) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tickers = portfolio.map(stock => stock.ticker).filter(Boolean);

        if (tickers.length === 0) {
          setError('분석할 종목이 없습니다.');
          return;
        }

        console.log('뉴스 감성 분석 시작:', tickers);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/news/sentiment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tickers, maxNews: 10 }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('API 에러 응답:', data);
          throw new Error(data.error || '뉴스 감성 분석 API 호출 실패');
        }

        console.log('뉴스 감성 분석 결과:', data);
        setSentimentData(data.results);
      } catch (err) {
        console.error('뉴스 감성 분석 오류:', err);
        setError(err.message || '뉴스 감성 분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsSentiment();
  }, [portfolio]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  const getSentimentLabel = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '긍정';
      case 'negative':
        return '부정';
      default:
        return '중립';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mr-3" />
          <span className="text-lg text-gray-600">뉴스 감성 분석 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12 text-red-600">
          <Newspaper className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!sentimentData || sentimentData.length === 0) {
    return null;
  }

  const toggleStock = (ticker) => {
    setExpandedStocks(prev => ({
      ...prev,
      [ticker]: !prev[ticker]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* 헤더 - 컴팩트 버전 */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-2 mr-3">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">뉴스 감성 분석</h2>
              <p className="text-purple-100 text-sm mt-0.5">
                AI 키워드 기반 시장 심리 분석
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 감성 요약 - 컴팩트 버전 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sentimentData.map((stock) => (
          <div
            key={stock.ticker}
            className={`group rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-2 cursor-pointer ${getSentimentColor(stock.overall_sentiment)}`}
            onClick={() => toggleStock(stock.ticker)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{stock.stock_name}</h3>
                <p className="text-xs text-gray-500">{stock.ticker}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  stock.overall_sentiment === 'positive' ? 'bg-green-100' :
                  stock.overall_sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {getSentimentIcon(stock.overall_sentiment)}
                </div>
                {expandedStocks[stock.ticker] ?
                  <ChevronUp className="h-4 w-4 text-gray-500" /> :
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">감성 점수</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{stock.overall_score.toFixed(1)}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  stock.overall_sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  stock.overall_sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {getSentimentLabel(stock.overall_sentiment)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-600">{stock.positive_count}</div>
                <div className="text-xs text-green-700">긍정</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-600">{stock.negative_count}</div>
                <div className="text-xs text-red-700">부정</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-600">{stock.neutral_count}</div>
                <div className="text-xs text-gray-700">중립</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 뉴스 상세 - 접을 수 있는 버전 */}
      {sentimentData.map((stock) => (
        expandedStocks[stock.ticker] && (
          <div key={`detail-${stock.ticker}`} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-fadeIn">
            <div className="flex items-center mb-5 pb-3 border-b border-purple-100">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2 mr-3">
                <Newspaper className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{stock.stock_name} 뉴스</h3>
            </div>

            {stock.news && stock.news.length > 0 ? (
              <div className="space-y-3">
                {stock.news.map((news, index) => (
                  <div
                    key={index}
                    className="group border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <a
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 font-medium text-sm hover:text-purple-600 transition-colors flex items-start gap-2 group"
                        >
                          <span className="flex-1 line-clamp-2">{news.title}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </a>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{news.date}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">점수: {news.score?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getSentimentColor(news.sentiment)}`}
                        >
                          {getSentimentLabel(news.sentiment)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block bg-gray-100 rounded-full p-3 mb-3">
                  <Newspaper className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">뉴스가 없습니다.</p>
              </div>
            )}
          </div>
        )
      ))}

      {/* 안내 문구 - 컴팩트 버전 */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="text-xs text-amber-900">
          <strong>참고:</strong> AI 키워드 기반 분석 결과이며 참고용입니다. 투자 결정 시 다양한 정보를 종합적으로 고려하세요.
        </p>
      </div>
    </div>
  );
};

export default NewsSentiment;
