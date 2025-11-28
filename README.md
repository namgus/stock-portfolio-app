# 📈 AI 스마트 포트폴리오 - 하이브리드 추천 시스템

> AI 기반 하이브리드 추천 알고리즘으로 투자자 맞춤형 주식 포트폴리오를 제공하는 차세대 투자 분석 플랫폼

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 프로젝트 하이라이트

이 프로젝트는 **AI 기반 하이브리드 추천 시스템**을 핵심으로, 단순 룰 베이스를 넘어선 지능형 포트폴리오 분석 플랫폼입니다.

### 💡 핵심 차별점

- **🤖 하이브리드 AI 추천**: Content-Based Filtering (50%) + Collaborative Filtering (30%) + 인기도 분석 (20%)
- **📊 Modern Portfolio Theory**: 효율적 투자선, 최적 포트폴리오, 샤프 비율 분석
- **🔄 백테스팅**: 과거 1년 데이터 기반 포트폴리오 성과 시뮬레이션
- **📰 뉴스 감성 분석**: 키워드 기반 실시간 뉴스 감성 점수 산출
- **💾 오프라인 캐싱**: pykrx 기반 한국거래소 실시간 데이터 + 로컬 캐싱

---

## ✨ 주요 기능

### 1. 🤖 AI 하이브리드 추천 시스템 (신규!)

**3가지 알고리즘을 결합한 지능형 종목 추천**

#### Content-Based Filtering (50%)
- 14가지 종목 특징 분석: 섹터, 타입, 펀더멘털(PER, PBR, ROE, 배당률), 리스크(변동성, 샤프비율, 베타), 기술적 지표(RSI, 이동평균, 모멘텀, 볼린저밴드)
- 코사인 유사도, 유클리디안 거리 기반 유사 종목 추천
- 포트폴리오 다양화 제안 (상관계수 낮은 종목)

#### Collaborative Filtering (30%)
- 12명의 더미 투자자 데이터 기반 User-Based CF
- Jaccard 유사도를 활용한 유사 투자자 패턴 학습
- 리스크 성향별 그룹화 (보수적/중립적/공격적)

#### 인기도 분석 (20%)
- 투자자들이 가장 많이 보유한 검증된 종목
- 빈도 기반 신뢰도 점수

**추천 점수 체계**
- 🟢 70점 이상: 강력 추천
- 🔵 50-69점: 추천
- 🟡 30-49점: 고려 가능
- ⚪ 30점 미만: 참고

### 2. 📊 Modern Portfolio Theory 분석 (신규!)

**노벨상 수상 이론 기반 과학적 포트폴리오 최적화**

- **효율적 투자선**: 1000개 무작위 포트폴리오 시뮬레이션으로 최적 배분 탐색
- **최적 포트폴리오**: 샤프 비율 최대화 (위험 대비 수익 최고)
- **최소 변동성 포트폴리오**: 가장 안정적인 자산 배분
- **상관관계 매트릭스**: 종목 간 상관계수 히트맵
- **효율적 투자선 차트**: 리스크-수익률 산점도

### 3. 🔄 백테스팅 시뮬레이션 (신규!)

**과거 데이터로 검증하는 포트폴리오 성과**

- 과거 1년간 실제 수익률 시뮬레이션
- 누적 수익률 라인 차트
- 벤치마크(KOSPI) 대비 성과 비교
- 최대 낙폭(Max Drawdown) 분석
- 일별 수익률 변동 추적

### 4. 📰 뉴스 감성 분석 (신규!)

**AI 기반 종목별 뉴스 감성 점수**

- 긍정/부정 키워드 사전 기반 분석
- 종목별 감성 점수 (-100 ~ +100)
- 최근 뉴스 5개 요약
- 감성 점수 시각화 (긍정/중립/부정)

### 5. 💾 실시간 데이터 & 오프라인 캐싱 (개선!)

**pykrx 라이브러리 기반 한국거래소 데이터**

- 실시간 주식 시세 (현재가, 등락률, 거래량)
- 24시간 로컬 캐싱으로 빠른 로딩
- 자동 새로고침 (30초/60초/2분/5분 선택)
- 캐시 상태 표시 (타임스탬프, 만료 여부)
- 수동 새로고침 버튼
- **백엔드 재시도 로직**: 종목별 최대 2회 재시도로 안정적 데이터 로딩
- **병렬 처리**: Promise.all() 기반 병렬 API 호출로 3-4배 빠른 로딩

### 6. 📱 개인 자산 관리 (신규!)

**보유 종목 손익 추적**

- 종목별 보유 수량, 매수가 입력
- 실시간 평가 손익 계산
- 수익률 자동 계산
- 로컬스토리지 저장

### 7. 🎯 맞춤형 포트폴리오 추천

**5단계 설문 기반 투자 성향 분석**

- 투자 금액, 위험도, 기간, 선호 섹터, 개인 정보
- 3가지 투자 성향 (보수적/중립적/공격적)
- 룰 기반 + AI 추천 하이브리드

### 8. 💰 ISA 절세 계좌 추천

- 소득 수준별 자동 자격 판단 (일반형/서민형)
- 예상 절세액 계산
- 최적 계좌 구조 제안

### 9. 📊 고급 시각화

- Recharts 기반 인터랙티브 차트
- 포트폴리오 구성 파이 차트
- 섹터별 분산도 차트
- MPT 효율적 투자선 산점도
- 백테스팅 라인 차트
- 상관관계 히트맵

### 10. 🎨 현대적 UI/UX

- Tailwind CSS 기반 모던 디자인
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 그라데이션 헤더, 애니메이션
- "쉬운 설명 보기" 교육 섹션
- 다크 모드 지원 준비

---

## 🎬 화면 구성

### 1. 홈 페이지
- 서비스 소개 및 주요 기능 안내
- 시작하기 버튼

### 2. 설문 페이지
- 5단계 질문 (진행률 표시)
- 투자 금액, 위험도, 기간, 선호 섹터, 개인 정보

### 3. 결과 페이지 (All-in-One)
- **포트폴리오 요약**: 리스크 수준, 예상 수익률, 총 종목 수, 총 손익
- **포트폴리오 구성**: 파이 차트, 섹터별 분산도
- **추천 종목 상세**: 현재가, PER, PBR, ROE, 배당률, 시가총액
- **개인 자산 관리**: 보유 수량, 매수가, 평가 손익
- **ISA 절세 계좌**: 자동 유형 판단, 절세액 계산
- **MPT 분석**: 효율적 투자선, 최적 포트폴리오, 상관관계
- **백테스팅**: 과거 1년 수익률 시뮬레이션
- **뉴스 감성 분석**: 종목별 감성 점수
- **AI 추천**: 하이브리드 알고리즘 기반 Top 5 종목
- **포트폴리오 총평**: 종합 평가

---

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js** 18 이상
- **Python** 3.9 이상
- **npm** 또는 **yarn**

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/stock-portfolio-app.git
cd stock-portfolio-app

# 2. 프론트엔드 의존성 설치
npm install

# 3. Python 의존성 설치
pip3 install flask flask-cors pykrx scikit-learn numpy pandas

# 4. 백엔드 서버 실행 (터미널 1)
python3 server.py
# 백엔드 API 서버: http://localhost:3001

# 5. 프론트엔드 개발 서버 실행 (터미널 2 - 새 터미널 필요)
npm run dev
# 프론트엔드 앱: http://localhost:5173

# 6. 브라우저에서 열기
# http://localhost:5173
```

**중요**: 모든 기능을 사용하려면 **두 개의 서버가 모두 실행 중**이어야 합니다.

---

## 📁 프로젝트 구조

```
stock-portfolio-app/
├── 🎨 Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx              # 랜딩 페이지
│   │   │   ├── Survey.jsx            # 설문 조사
│   │   │   ├── Results.jsx           # 결과 페이지 (통합)
│   │   │   └── MyAssets.jsx          # 자산 관리 (미사용)
│   │   ├── components/
│   │   │   ├── MPTAnalysis.jsx       # MPT 분석 컴포넌트
│   │   │   ├── Backtesting.jsx       # 백테스팅 컴포넌트
│   │   │   ├── NewsSentiment.jsx     # 뉴스 감성 분석 컴포넌트
│   │   │   └── Recommendations.jsx   # AI 추천 컴포넌트
│   │   ├── utils/
│   │   │   ├── portfolioRecommendation.js  # 룰 기반 추천
│   │   │   └── yahooFinanceApi.js          # pykrx API 호출
│   │   ├── data/
│   │   │   ├── stockData.js          # 주식 메타데이터
│   │   │   └── extendedStocks.js     # 확장 종목 데이터
│   │   └── App.jsx                   # 메인 앱
│   └── package.json
│
├── 🐍 Backend (Python + Flask)
│   ├── server.py                     # Flask API 서버 (메인)
│   ├── mpt_calculator.py             # MPT 계산 엔진
│   ├── backtesting.py                # 백테스팅 시뮬레이터
│   ├── news_sentiment.py             # 뉴스 감성 분석
│   ├── hybrid_recommender.py         # 하이브리드 추천 시스템
│   ├── content_recommender.py        # Content-Based Filtering
│   ├── feature_extractor.py          # 종목 특징 추출
│   ├── similarity_metrics.py         # 유사도 계산
│   └── technical_indicators.py       # 기술적 지표 계산
│
├── 📚 Documentation
│   ├── README.md                     # 프로젝트 소개 (현재 파일)
│   ├── SETUP_GUIDE.md                # 설정 가이드
│   └── API_COMPARISON.md             # API 비교 분석
│
├── 🔧 Configuration
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
```

---

## 🛠️ 기술 스택

### Frontend
- **React 18.3**: UI 라이브러리
- **Vite 7.2**: 빌드 도구 및 개발 서버
- **Tailwind CSS 3.4**: 유틸리티 기반 CSS 프레임워크
- **Recharts**: 데이터 시각화 (차트 라이브러리)
- **Lucide React**: 아이콘 라이브러리

### Backend
- **Python 3.9**: 백엔드 언어
- **Flask 3.0**: 웹 프레임워크
- **Flask-CORS**: CORS 지원
- **pykrx**: 한국거래소 데이터 API
- **scikit-learn 1.6**: 머신러닝 라이브러리 (유사도 계산)
- **NumPy / Pandas**: 데이터 처리

### AI & 알고리즘
- **Content-Based Filtering**: 코사인 유사도, 유클리디안 거리
- **Collaborative Filtering**: Jaccard 유사도 (User-Based CF)
- **Modern Portfolio Theory**: 효율적 투자선, 샤프 비율, 최적화
- **Backtesting**: 과거 데이터 기반 시뮬레이션
- **Sentiment Analysis**: 키워드 기반 감성 분석

### 데이터 & API
- **pykrx**: 한국거래소 실시간 시세
- **로컬 캐싱**: 24시간 유효 JSON 캐시
- **샘플 데이터**: 34개 국내 주요 종목 메타데이터

---

## 🎯 AI 추천 시스템 상세

### 1. Feature Extraction (특징 추출)

**14가지 종목 특징 벡터**

| 카테고리 | 특징 | 설명 |
|---------|------|------|
| **기본 정보** | sector | 섹터 (tech, finance, consumer 등) |
| | type | 타입 (dividend, growth, largecap 등) |
| **펀더멘털** | dividend_yield | 배당 수익률 (%) |
| | per | 주가수익비율 |
| | pbr | 주가순자산비율 |
| | roe | 자기자본이익률 (%) |
| **리스크** | volatility | 변동성 (표준편차) |
| | sharpe_ratio | 샤프 비율 |
| | beta | 베타 (시장 민감도) |
| | max_drawdown | 최대 낙폭 |
| **기술적 지표** | rsi_14 | 상대강도지수 (14일) |
| | momentum_10 | 10일 모멘텀 |
| | bb_position | 볼린저밴드 위치 |
| | price_roc_10 | 10일 가격 변화율 |

### 2. Similarity Metrics (유사도 계산)

**가중치 기반 종합 유사도**

```python
weighted_similarity = (
    0.20 * sector_similarity +      # 섹터 유사도
    0.15 * type_similarity +         # 타입 유사도
    0.25 * risk_similarity +         # 리스크 프로필 유사도
    0.20 * fundamental_similarity +  # 펀더멘털 유사도
    0.20 * technical_similarity      # 기술적 지표 유사도
)
```

### 3. Hybrid Score (하이브리드 점수)

**최종 추천 점수 계산**

```python
hybrid_score = (
    0.50 * content_score +    # Content-Based Filtering
    0.30 * cf_score +          # Collaborative Filtering
    0.20 * popularity_score    # 인기도
)
```

---

## 📊 MPT (Modern Portfolio Theory)

### 핵심 개념

1. **효율적 투자선 (Efficient Frontier)**
   - 같은 리스크에서 최대 수익
   - 같은 수익에서 최소 리스크

2. **최적 포트폴리오 (Optimal Portfolio)**
   - 샤프 비율 최대화: `(수익률 - 무위험수익률) / 변동성`

3. **최소 변동성 포트폴리오 (Minimum Variance)**
   - 가장 안정적인 자산 배분

### 계산 과정

1. 과거 1년 일별 수익률 수집
2. 공분산 행렬 계산
3. 1000개 무작위 포트폴리오 생성
4. 샤프 비율, 변동성 계산
5. 최적점 탐색

---

## 🔄 백테스팅

### 시뮬레이션 프로세스

1. **초기 투자금**: 1,000만원 (기준)
2. **기간**: 과거 1년 (252 거래일)
3. **리밸런싱**: 없음 (Buy & Hold)
4. **벤치마크**: KOSPI 지수

### 성과 지표

- **누적 수익률**: 최종 자산 / 초기 투자금
- **최대 낙폭**: 최고점 대비 최대 하락률
- **일별 변동성**: 수익률 표준편차
- **샤프 비율**: 위험 대비 수익

---

## 📰 뉴스 감성 분석

### 키워드 사전

**긍정 키워드 (60개)**
- 호실적, 성장, 급등, 상승, 개선, 확대, 돌파, 신고가, 흑자전환...

**부정 키워드 (60개)**
- 부진, 하락, 급락, 적자, 감소, 우려, 리스크, 제재, 손실...

### 감성 점수 계산

```python
sentiment_score = (
    (positive_count * 10) - (negative_count * 10)
)
범위: -100 ~ +100
```

- **긍정** (50 이상): 🟢 긍정적
- **중립** (-50 ~ 50): 🟡 중립
- **부정** (-50 이하): 🔴 부정적

---

## 📚 주요 API 엔드포인트

### 1. 주식 시세
```http
GET /api/stocks?tickers=005930,035420
```

### 2. MPT 분석
```http
POST /api/mpt/analyze
Content-Type: application/json
{
  "tickers": ["005930", "035420"]
}
```

### 3. 백테스팅
```http
POST /api/backtest
Content-Type: application/json
{
  "portfolio": [
    {"ticker": "005930", "allocation": 50},
    {"ticker": "035420", "allocation": 50}
  ]
}
```

### 4. 뉴스 감성 분석
```http
POST /api/news/sentiment
Content-Type: application/json
{
  "tickers": ["005930", "035420"]
}
```

### 5. AI 하이브리드 추천
```http
POST /api/recommendations/hybrid
Content-Type: application/json
{
  "portfolio": ["005930"],
  "riskTolerance": "moderate",
  "topK": 5
}
```

### 6. 캐시 관리
```http
GET /api/cache/status
DELETE /api/cache/clear
```

---

## 🗺️ 로드맵

### ✅ Phase 1-3: 완료
- [x] 홈/설문/결과 페이지
- [x] 룰 기반 포트폴리오 추천
- [x] ISA 절세 계좌 추천
- [x] pykrx 실시간 데이터
- [x] MPT 분석
- [x] 백테스팅
- [x] 뉴스 감성 분석
- [x] AI 하이브리드 추천 시스템
- [x] 개인 자산 관리

### 🚧 Phase 4: UI/UX 고도화 (진행 중)
- [x] 쉬운 설명 보기 (MPT, AI)
- [x] 차트 라벨 오버플로우 수정
- [x] 폴백 UI (데이터 로딩 상태 표시)
- [x] 단일 페이지 설문 UX 개선
- [x] 성능 최적화 (3-4배 빠른 로딩)
- [ ] 다크 모드
- [ ] 차트 애니메이션 개선
- [ ] 모바일 최적화

### 📅 Phase 5: 데이터 확장
- [ ] 100+ 종목 추가
- [ ] 실시간 뉴스 API 연동
- [ ] 재무제표 데이터 통합

### 🎯 Phase 6: 고급 기능
- [ ] 사용자 계정 시스템
- [ ] 실제 투자자 데이터 기반 CF
- [ ] 딥러닝 기반 주가 예측
- [ ] 리밸런싱 알림

---

## 💡 사용 예시

### 시나리오 1: 보수적 투자자
- **투자 금액**: 3,000만원
- **위험도**: 보수적
- **투자 기간**: 장기 (3년 이상)
- **AI 추천**: KB금융, 신한지주, KODEX 200 등 배당주 + ETF

### 시나리오 2: 공격적 투자자
- **투자 금액**: 5,000만원
- **위험도**: 공격적
- **투자 기간**: 단기 (1년 미만)
- **AI 추천**: NAVER, 카카오, 삼성바이오로직스 등 성장주

---

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## ⚠️ 면책 조항

본 서비스는 **투자 참고용**이며, 실제 투자 결정은 본인의 책임입니다.
AI 추천 시스템은 과거 데이터와 시뮬레이션 데이터를 기반으로 하며, 미래 수익을 보장하지 않습니다.
투자 손실에 대한 책임은 투자자 본인에게 있습니다.

---

## 🙏 감사의 말

- [pykrx](https://github.com/sharebook-kr/pykrx) - 한국 주식 데이터
- [scikit-learn](https://scikit-learn.org) - 머신러닝 라이브러리
- [Recharts](https://recharts.org) - 차트 라이브러리
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크
- [Lucide](https://lucide.dev) - 아이콘
- [Flask](https://flask.palletsprojects.com) - Python 웹 프레임워크

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐**

Made with ❤️ by AI Portfolio Team

</div>
