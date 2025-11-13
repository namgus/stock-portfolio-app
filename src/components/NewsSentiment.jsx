import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2 } from 'lucide-react';

const NewsSentiment = ({ portfolio }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        const response = await fetch('http://localhost:3001/api/news/sentiment', {
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

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* 헤더 */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative p-8 md:p-10">
          <div className="flex items-center mb-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3 mr-4">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">뉴스 감성 분석</h2>
              <p className="text-purple-100 text-sm md:text-base mt-1">
                AI 키워드 기반 감성 분석으로 시장 심리 파악
              </p>
            </div>
          </div>
        </div>
        {/* 장식 요소 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* 전체 감성 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sentimentData.map((stock) => (
          <div
            key={stock.ticker}
            className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 transform hover:-translate-y-1 ${getSentimentColor(stock.overall_sentiment)}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{stock.stock_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{stock.ticker}</p>
              </div>
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                stock.overall_sentiment === 'positive' ? 'bg-green-100' :
                stock.overall_sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {getSentimentIcon(stock.overall_sentiment)}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">전체 감성</span>
                <span className="font-bold text-base">{getSentimentLabel(stock.overall_sentiment)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">감성 점수</span>
                <span className="font-bold text-base">{stock.overall_score.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stock.positive_count}</div>
                <div className="text-xs text-green-700 mt-1">긍정</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{stock.negative_count}</div>
                <div className="text-xs text-red-700 mt-1">부정</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">{stock.neutral_count}</div>
                <div className="text-xs text-gray-700 mt-1">중립</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 뉴스 상세 */}
      {sentimentData.map((stock) => (
        <div key={`detail-${stock.ticker}`} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-8 pb-4 border-b-2 border-purple-100">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 mr-4">
              <Newspaper className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stock.stock_name} 뉴스</h3>
          </div>

          {stock.news && stock.news.length > 0 ? (
            <div className="space-y-4">
              {stock.news.map((news, index) => (
                <div
                  key={index}
                  className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-semibold text-base hover:text-purple-600 transition-colors flex items-start gap-2 group"
                      >
                        <span className="flex-1 line-clamp-2">{news.title}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </a>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-500">{news.date}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">감성 점수: {news.score?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm transition-all duration-200 group-hover:scale-105 ${getSentimentColor(news.sentiment)}`}
                      >
                        {getSentimentIcon(news.sentiment)}
                        {getSentimentLabel(news.sentiment)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-gray-100 rounded-full p-4 mb-4">
                <Newspaper className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">뉴스가 없습니다.</p>
            </div>
          )}
        </div>
      ))}

      {/* 안내 문구 */}
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <p className="text-sm text-amber-900">
          <strong>참고:</strong> 이 감성 분석은 AI 키워드 기반 분석으로, 참고용으로만 활용하시기 바랍니다.
          실제 투자 결정 시에는 다양한 정보를 종합적으로 고려하세요.
        </p>
      </div>
    </div>
  );
};

export default NewsSentiment;
