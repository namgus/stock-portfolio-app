import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Target, Loader2, ChevronDown, ChevronUp, BookOpen, Info, HelpCircle } from 'lucide-react';

const Recommendations = ({ portfolio, riskTolerance = 'moderate' }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
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

        console.log('AI 추천 요청:', { tickers, riskTolerance });

        const response = await fetch('http://localhost:3001/api/recommendations/hybrid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            portfolio: tickers,
            riskTolerance: riskTolerance,
            topK: 5
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('API 에러 응답:', data);
          throw new Error(data.error || 'AI 추천 API 호출 실패');
        }

        console.log('AI 추천 결과:', data);
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error('AI 추천 오류:', err);
        setError(err.message || 'AI 추천 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [portfolio, riskTolerance]);

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 0.3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.7) return '강력 추천';
    if (score >= 0.5) return '추천';
    if (score >= 0.3) return '고려 가능';
    return '참고';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mr-3" />
          <span className="text-lg text-gray-600">AI 추천 분석 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12 text-red-600">
          <Sparkles className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* 헤더 */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3 mr-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">AI 포트폴리오 추천</h2>
                <p className="text-purple-100 text-sm md:text-base mt-1">
                  하이브리드 AI 알고리즘 기반 맞춤 종목 추천
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium hidden md:inline">쉬운 설명 {showExplanation ? '숨기기' : '보기'}</span>
              <span className="text-sm font-medium md:hidden">{showExplanation ? '숨기기' : '보기'}</span>
            </button>
          </div>
        </div>
        {/* 장식 요소 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* 쉬운 설명 섹션 */}
      {showExplanation && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
          <div className="flex items-start gap-3 mb-6">
            <Info className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI 추천 시스템이란?</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                AI 추천 시스템은 <strong>넷플릭스가 영화를 추천하는 방식</strong>과 유사하게, 여러분의 투자 성향과
                포트폴리오를 분석하여 가장 적합한 종목을 찾아드립니다.
                세 가지 똑똑한 AI 알고리즘이 협력하여 최적의 추천을 만들어냅니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">특징 기반 분석</h4>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                현재 포트폴리오의 <strong>섹터, 리스크, 배당률, 기술적 지표</strong> 등 14가지 특징을 분석합니다.
              </p>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>예시:</strong> 삼성전자를 보유하고 있다면, 기술주이면서도 배당을 주는 유사한 특성의 종목을 찾습니다.
                </p>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  가중치 50%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">투자자 패턴 학습</h4>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                <strong>비슷한 성향의 투자자들</strong>이 어떤 종목을 함께 보유하는지 패턴을 학습합니다.
              </p>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-900">
                  <strong>예시:</strong> 보수적 투자자들이 KB금융과 함께 많이 보유하는 종목을 찾습니다.
                </p>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  가중치 30%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-pink-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">인기도 분석</h4>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                <strong>많은 투자자들이 선택</strong>하는 검증된 종목을 파악합니다.
              </p>
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-sm text-pink-900">
                  <strong>예시:</strong> KODEX 200, TIGER 미국S&P500처럼 대중적으로 인정받은 종목을 찾습니다.
                </p>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  가중치 20%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-gray-600" />
              점수는 어떻게 해석하나요?
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-600 border-2 border-green-200 min-w-[100px] text-center">
                  70점 이상
                </span>
                <span className="text-gray-700"><strong>강력 추천</strong> - 모든 기준에서 높은 점수를 받은 종목입니다. 적극적으로 고려해보세요.</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border-2 border-blue-200 min-w-[100px] text-center">
                  50-69점
                </span>
                <span className="text-gray-700"><strong>추천</strong> - 포트폴리오에 추가를 고려할 만한 좋은 선택입니다.</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-yellow-50 text-yellow-600 border-2 border-yellow-200 min-w-[100px] text-center">
                  30-49점
                </span>
                <span className="text-gray-700"><strong>고려 가능</strong> - 추가 분석 후 투자를 검토해보세요.</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-gray-50 text-gray-600 border-2 border-gray-200 min-w-[100px] text-center">
                  30점 미만
                </span>
                <span className="text-gray-700"><strong>참고</strong> - 현재 포트폴리오와 맞지 않을 수 있습니다.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">하이브리드 AI의 장점</h4>
                <p className="text-gray-700 leading-relaxed">
                  세 가지 알고리즘을 결합함으로써 <strong>각각의 약점을 보완</strong>하고 강점을 극대화합니다.
                  단순히 비슷한 종목만 추천하는 것이 아니라, <strong>다양화와 검증된 선택을 균형있게 고려</strong>하여
                  더 안정적이고 신뢰할 수 있는 추천을 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 추천 종목 카드 */}
      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.ticker}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-indigo-200 overflow-hidden"
          >
            {/* 카드 헤더 */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {index + 1}. {rec.stock_name}
                    </span>
                    <span className="text-sm text-gray-500">({rec.ticker})</span>
                  </div>

                  {/* 점수 배지들 */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 ${getScoreColor(rec.hybrid_score)}`}>
                      <Target className="h-4 w-4" />
                      {getScoreLabel(rec.hybrid_score)} ({(rec.hybrid_score * 100).toFixed(0)}점)
                    </span>

                    {rec.content_score > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <TrendingUp className="h-3 w-3" />
                        특징 유사도 {(rec.content_score * 100).toFixed(0)}%
                      </span>
                    )}

                    {rec.cf_score > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <Users className="h-3 w-3" />
                        투자자 선호 {(rec.cf_score * 100).toFixed(0)}%
                      </span>
                    )}

                    {rec.popularity > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
                        <Sparkles className="h-3 w-3" />
                        인기도 {(rec.popularity * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* 확장 버튼 */}
                <button
                  onClick={() => setExpandedCard(expandedCard === rec.ticker ? null : rec.ticker)}
                  className="ml-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  {expandedCard === rec.ticker ? (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 카드 본문 - 항상 표시 */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">추천 이유</h4>
                <p className="text-gray-600 leading-relaxed">{rec.reason}</p>
              </div>
            </div>

            {/* 상세 정보 - 확장 시 표시 */}
            {expandedCard === rec.ticker && (
              <div className="px-6 pb-6 pt-0 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(rec.content_score * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">Content 점수</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(rec.cf_score * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-purple-700 mt-1">CF 점수</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">
                      {(rec.popularity * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-pink-700 mt-1">인기도</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 안내 문구 */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
        <p className="text-sm text-indigo-900">
          <strong>AI 추천 시스템:</strong> Content-Based Filtering과 Collaborative Filtering을 결합한
          하이브리드 알고리즘으로 포트폴리오 특성, 유사 투자자 패턴, 종목 인기도를 종합 분석하여 추천합니다.
          실제 투자 결정 시에는 추가적인 분석과 검토가 필요합니다.
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
