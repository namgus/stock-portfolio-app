import { TrendingUp, Shield, Target, PieChart, Wallet } from 'lucide-react';

const Home = ({ onStart, onMyAssets }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">스마트 포트폴리오</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            당신만의 맞춤형
            <span className="block text-primary-600">포트폴리오를 추천받으세요</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            간단한 질문에 답하고, AI가 분석한 개인화된 주식 포트폴리오와
            절세 전략을 받아보세요.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-5 bg-primary-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 min-h-[60px]"
            >
              포트폴리오 추천 시작하기
            </button>
            <button
              onClick={onMyAssets}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-5 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 min-h-[60px]"
            >
              <Wallet className="w-5 h-5 mr-2" />
              내 자산 보기
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600 mx-auto">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              맞춤형 추천
            </h3>
            <p className="mt-2 text-gray-600 text-center">
              투자 성향과 목표에 맞는 포트폴리오를 제공합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 mx-auto">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              리스크 분석
            </h3>
            <p className="mt-2 text-gray-600 text-center">
              투자 위험도를 분석하여 안전한 투자를 돕습니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mx-auto">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              분산 투자
            </h3>
            <p className="mt-2 text-gray-600 text-center">
              다양한 섹터로 분산된 안정적인 포트폴리오
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-600 mx-auto">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              절세 전략
            </h3>
            <p className="mt-2 text-gray-600 text-center">
              ISA 계좌를 활용한 효율적인 절세 방법 제시
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            어떻게 작동하나요?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600 text-white text-2xl sm:text-3xl font-bold">
                1
              </div>
              <h4 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
                간단한 설문
              </h4>
              <p className="mt-2 text-gray-600 text-base sm:text-lg">
                5개의 질문에 답하여 투자 성향을 파악합니다
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600 text-white text-2xl sm:text-3xl font-bold">
                2
              </div>
              <h4 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
                AI 분석
              </h4>
              <p className="mt-2 text-gray-600 text-base sm:text-lg">
                시장 데이터를 분석하여 최적의 포트폴리오를 생성합니다
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600 text-white text-2xl sm:text-3xl font-bold">
                3
              </div>
              <h4 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
                결과 확인
              </h4>
              <p className="mt-2 text-gray-600 text-base sm:text-lg">
                추천 종목과 비중, 절세 전략을 한눈에 확인하세요
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            본 서비스는 투자 참고용이며, 실제 투자 결정은 본인의 책임입니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
