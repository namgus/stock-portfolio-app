import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const questions = [
  {
    id: 'investmentAmount',
    question: '투자 가능한 금액은 얼마인가요?',
    options: [
      { value: 'under1000', label: '1,000만원 미만', description: '소액 투자' },
      { value: '1000to3000', label: '1,000만원 - 3,000만원', description: '중소액 투자' },
      { value: '3000to5000', label: '3,000만원 - 5,000만원', description: '중액 투자' },
      { value: 'over5000', label: '5,000만원 이상', description: '고액 투자' }
    ]
  },
  {
    id: 'riskTolerance',
    question: '투자 위험도에 대한 당신의 성향은?',
    options: [
      { value: 'conservative', label: '보수적', description: '안정적인 수익을 선호' },
      { value: 'moderate', label: '중립적', description: '적절한 리스크 감수' },
      { value: 'aggressive', label: '공격적', description: '높은 수익률 추구' }
    ]
  },
  {
    id: 'investmentPeriod',
    question: '투자 기간은 어느 정도를 계획하시나요?',
    options: [
      { value: 'short', label: '단기 (1년 미만)', description: '빠른 수익 실현' },
      { value: 'medium', label: '중기 (1-3년)', description: '안정적 성장' },
      { value: 'long', label: '장기 (3년 이상)', description: '장기 투자' }
    ]
  },
  {
    id: 'preferredSectors',
    question: '선호하는 투자 섹터를 선택해주세요',
    multiple: true,
    options: [
      { value: 'tech', label: '기술/IT', description: '삼성전자, 네이버 등' },
      { value: 'finance', label: '금융', description: '은행, 증권 등' },
      { value: 'consumer', label: '소비재', description: '식품, 유통 등' },
      { value: 'healthcare', label: '헬스케어', description: '제약, 바이오 등' },
      { value: 'energy', label: '에너지', description: '전력, 신재생 등' },
      { value: 'nopreference', label: '상관없음', description: '모든 섹터 고려' }
    ]
  },
  {
    id: 'userProfile',
    question: 'ISA 절세 계좌 추천을 위한 정보를 입력해주세요',
    fields: [
      {
        id: 'age',
        label: '나이',
        type: 'number',
        placeholder: '예: 30'
      },
      {
        id: 'income',
        label: '연 소득',
        type: 'select',
        options: [
          { value: 'under5000', label: '5,000만원 이하' },
          { value: '5000to8000', label: '5,000만원 - 8,000만원' },
          { value: 'over8000', label: '8,000만원 이상' }
        ]
      }
    ]
  }
];

const Survey = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    investmentAmount: '',
    riskTolerance: '',
    investmentPeriod: '',
    preferredSectors: [],
    userProfile: { age: '', income: '' }
  });

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = (value) => {
    if (currentQuestion.multiple) {
      const currentValues = answers[currentQuestion.id];

      if (value === 'nopreference') {
        setAnswers({ ...answers, [currentQuestion.id]: ['nopreference'] });
      } else {
        let newValues;
        if (currentValues.includes(value)) {
          newValues = currentValues.filter(v => v !== value);
        } else {
          newValues = [...currentValues.filter(v => v !== 'nopreference'), value];
        }
        setAnswers({ ...answers, [currentQuestion.id]: newValues });
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setAnswers({
      ...answers,
      userProfile: {
        ...answers.userProfile,
        [fieldId]: value
      }
    });
  };

  const canProceed = () => {
    if (currentQuestion.multiple) {
      return answers[currentQuestion.id].length > 0;
    } else if (currentQuestion.fields) {
      return answers.userProfile.age && answers.userProfile.income;
    } else {
      return answers[currentQuestion.id] !== '';
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>질문 {currentStep + 1} / {questions.length}</span>
            <span>{Math.round(progress)}% 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          {currentQuestion.options && (
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.multiple
                  ? answers[currentQuestion.id].includes(option.value)
                  : answers[currentQuestion.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Form Fields */}
          {currentQuestion.fields && (
            <div className="space-y-6">
              {currentQuestion.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={answers.userProfile[field.id]}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none text-lg"
                    >
                      <option value="">선택해주세요</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={answers.userProfile[field.id]}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none text-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between">
            <button
              onClick={handlePrevious}
              className="flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              {currentStep > 0 ? '이전' : '처음으로'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                canProceed()
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastStep ? '결과 보기' : '다음'}
              {!isLastStep && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
