import { useState } from 'react';
import Home from './pages/Home';
import Survey from './pages/Survey';
import Results from './pages/Results';
import MyAssets from './pages/MyAssets';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
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
        />
      )}
      {currentPage === 'results' && (
        <Results
          surveyData={surveyData}
          onBack={navigateToHome}
        />
      )}
      {currentPage === 'myAssets' && (
        <MyAssets onBack={navigateToHome} />
      )}
    </div>
  );
}

export default App;
