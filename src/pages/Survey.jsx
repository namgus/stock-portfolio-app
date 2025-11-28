import { useState } from 'react';
import { Settings } from 'lucide-react';

// 기본값 설정
const defaultAnswers = {
  investmentAmount: '1000to3000',
  riskTolerance: 'moderate',
  investmentPeriod: 'medium',
  preferredSectors: ['nopreference'],
  userProfile: { age: '30', income: 'under5000' }
};

const questions = [
  {
    id: 'investmentAmount',
    question: '투자 가능한 금액',
    icon: '💰',
    options: [
      { value: 'under1000', label: '1,000만원 미만', description: '소액 투자' },
      { value: '1000to3000', label: '1,000~3,000만원', description: '중소액 투자' },
      { value: '3000to5000', label: '3,000~5,000만원', description: '중액 투자' },
      { value: 'over5000', label: '5,000만원 이상', description: '고액 투자' }
    ]
  },
  {
    id: 'riskTolerance',
    question: '투자 위험도 성향',
    icon: '📊',
    options: [
      { value: 'conservative', label: '보수적', description: '안정적인 수익 선호' },
      { value: 'moderate', label: '중립적', description: '적절한 리스크 감수' },
      { value: 'aggressive', label: '공격적', description: '높은 수익률 추구' }
    ]
  },
  {
    id: 'investmentPeriod',
    question: '투자 기간',
    icon: '⏰',
    options: [
      { value: 'short', label: '단기 (1년 미만)', description: '빠른 수익 실현' },
      { value: 'medium', label: '중기 (1~3년)', description: '안정적 성장' },
      { value: 'long', label: '장기 (3년 이상)', description: '장기 투자' }
    ]
  },
  {
    id: 'preferredSectors',
    question: '선호 투자 섹터',
    icon: '🏢',
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
    question: 'ISA 계좌 추천 정보',
    icon: '👤',
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
          { value: '5000to8000', label: '5,000~8,000만원' },
          { value: 'over8000', label: '8,000만원 이상' }
        ]
      }
    ]
  }
];

const Survey = ({ onComplete, onBack, initialData }) => {
  const [answers, setAnswers] = useState(initialData || defaultAnswers);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const handleOptionSelect = (questionId, value, multiple = false) => {
    if (multiple) {
      const currentValues = answers[questionId];

      if (value === 'nopreference') {
        setAnswers({ ...answers, [questionId]: ['nopreference'] });
      } else {
        let newValues;
        if (currentValues.includes(value)) {
          newValues = currentValues.filter(v => v !== value);
        } else {
          newValues = [...currentValues.filter(v => v !== 'nopreference'), value];
        }
        setAnswers({ ...answers, [questionId]: newValues.length > 0 ? newValues : ['nopreference'] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: value });
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

  const handleSubmit = () => {
    onComplete(answers);
  };

  const canSubmit = () => {
    return answers.investmentAmount &&
           answers.riskTolerance &&
           answers.investmentPeriod &&
           answers.preferredSectors.length > 0 &&
           answers.userProfile.age &&
           answers.userProfile.income;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            포트폴리오 맞춤 설정
          </h1>
          <p className="text-gray-600 text-lg">
            기본값으로 빠르게 시작하거나, 상세 설정으로 나만의 포트폴리오를 만들어보세요
          </p>
        </div>

        {/* 빠른 시작 / 상세 설정 토글 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAllQuestions(!showAllQuestions)}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-primary-200 hover:border-primary-400"
          >
            <Settings className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-700">
              {showAllQuestions ? '간단하게 보기' : '상세 설정하기'}
            </span>
          </button>
        </div>

        {/* 설문 카드 - 그리드 레이아웃 */}
        <div className={`grid gap-6 mb-8 ${showAllQuestions ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {questions.map((question) => {
            const isExpanded = showAllQuestions;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-primary-200 transition-all duration-200 ${
                  isExpanded ? 'md:col-span-1' : ''
                }`}
              >
                {/* 질문 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{question.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{question.question}</h3>
                </div>

                {/* 옵션 */}
                {question.options && (
                  <div className={`space-y-2 ${isExpanded ? '' : 'max-h-60 overflow-y-auto'}`}>
                    {question.options.map((option) => {
                      const isSelected = question.multiple
                        ? answers[question.id].includes(option.value)
                        : answers[question.id] === option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => handleOptionSelect(question.id, option.value, question.multiple)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 ${
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
                            <div className="ml-3">
                              <div className="font-semibold text-gray-900">
                                {option.label}
                              </div>
                              {isExpanded && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 폼 필드 */}
                {question.fields && (
                  <div className="space-y-4">
                    {question.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={answers.userProfile[field.id]}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none"
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
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 설정 안내</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 기본값이 자동으로 선택되어 있어 바로 시작할 수 있습니다</li>
            <li>• 원하는 항목만 수정하고 바로 결과를 확인하세요</li>
            <li>• 결과 페이지에서 언제든지 설정을 변경할 수 있습니다</li>
          </ul>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
          >
            ← 처음으로
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
              canSubmit()
                ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canSubmit() ? '포트폴리오 추천 받기 🚀' : '모든 항목을 선택해주세요'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Survey;
