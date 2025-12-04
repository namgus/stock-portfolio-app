import { useState } from 'react';
import Home from './pages/Home';
import Survey from './pages/Survey';
import Results from './pages/Results';
import MyAssets from './pages/MyAssets';
import Debug from './pages/Debug';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 정상 모드로 복구
  const [surveyData, setSurveyData] = useState(null);
  const [portfolioResult, setPortfolioResult] = useState(null);

  const navigateToSurvey = () => {
    setCurrentPage('survey');
  };

  const navigateToMyAssets = () => {
    setCurrentPage('myAssets');
  };

  const handleSurveyComplete = (data) => {
    setSurveyData(data);
    setCurrentPage('results');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSurveyData(null);
    setPortfolioResult(null);
  };

  const navigateToSettings = () => {
    // 설정 변경 시 surveyData 유지한 채로 설문으로 돌아감
    setCurrentPage('survey');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && (
        <Home
          onStart={navigateToSurvey}
          onMyAssets={navigateToMyAssets}
        />
      )}
      {currentPage === 'survey' && (
        <Survey
          onComplete={handleSurveyComplete}
          onBack={navigateToHome}
          initialData={surveyData}
        />
      )}
      {currentPage === 'results' && (
        <Results
          surveyData={surveyData}
          onBack={navigateToHome}
          onEditSettings={navigateToSettings}
        />
      )}
      {currentPage === 'myAssets' && (
        <MyAssets onBack={navigateToHome} />
      )}
      {currentPage === 'debug' && (
        <Debug />
      )}
    </div>
  );
}

export default App;
