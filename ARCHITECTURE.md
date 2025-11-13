# 🏗️ 시스템 아키텍처

## 📊 전체 시스템 구조

```mermaid
graph TB
    subgraph "Frontend - React + Vite"
        A[Home Page] --> B[Survey Page]
        B --> C[Results Page]
        C --> D[Portfolio Summary]
        C --> E[MPT Analysis]
        C --> F[Backtesting]
        C --> G[News Sentiment]
        C --> H[AI Recommendations]
    end

    subgraph "Backend - Python + Flask"
        I[Flask API Server<br/>:3001]
        J[pykrx API]
        K[Local Cache<br/>24h TTL]
        L[MPT Calculator]
        M[Backtesting Engine]
        N[News Sentiment Analyzer]
        O[AI Hybrid Recommender]
    end

    subgraph "Data Sources"
        P[한국거래소 KRX]
        Q[주식 메타데이터<br/>34 stocks]
    end

    C -->|HTTP API| I
    I -->|실시간 시세| J
    J -->|데이터| P
    I <-->|캐싱| K
    I --> L
    I --> M
    I --> N
    I --> O
    O -->|메타데이터| Q

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style I fill:#ffe1f5
    style O fill:#e1ffe1
```

---

## 🤖 AI 하이브리드 추천 시스템

```mermaid
flowchart LR
    subgraph "Input"
        A1[사용자 포트폴리오]
        A2[리스크 성향]
    end

    subgraph "Feature Extraction"
        B1[14가지 특징 추출]
        B2[섹터/타입]
        B3[펀더멘털<br/>PER/PBR/ROE]
        B4[리스크<br/>변동성/샤프/베타]
        B5[기술적 지표<br/>RSI/이동평균]
    end

    subgraph "Content-Based 50%"
        C1[유사도 계산]
        C2[코사인 유사도]
        C3[유클리디안 거리]
        C4[포트폴리오 다양화]
    end

    subgraph "Collaborative 30%"
        D1[더미 투자자<br/>12명]
        D2[Jaccard 유사도]
        D3[유사 투자자 탐색]
        D4[패턴 학습]
    end

    subgraph "Popularity 20%"
        E1[보유 빈도 분석]
        E2[검증된 종목]
    end

    subgraph "Output"
        F1[하이브리드 점수<br/>0-100]
        F2[Top 5 추천]
        F3[추천 이유]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2 & B3 & B4 & B5

    B2 & B3 & B4 & B5 --> C1
    C1 --> C2 & C3 & C4

    A1 --> D1
    D1 --> D2 --> D3 --> D4

    A1 --> E1 --> E2

    C4 --> F1
    D4 --> F1
    E2 --> F1

    F1 --> F2 --> F3

    style A1 fill:#e1f5ff
    style F1 fill:#ffe1e1
    style F2 fill:#e1ffe1
```

---

## 📊 MPT (Modern Portfolio Theory) 플로우

```mermaid
flowchart TD
    A[포트폴리오 종목] --> B[과거 1년 데이터 수집]
    B --> C[일별 수익률 계산]
    C --> D[공분산 행렬 생성]

    D --> E[1000개 무작위<br/>포트폴리오 생성]

    E --> F{각 포트폴리오 평가}
    F --> G[기대 수익률 계산]
    F --> H[변동성 계산]

    G & H --> I[샤프 비율<br/>수익률 ÷ 변동성]

    I --> J{최적화}
    J -->|샤프 최대| K[최적 포트폴리오]
    J -->|변동성 최소| L[최소 변동성]

    K & L --> M[효율적 투자선<br/>시각화]

    D --> N[상관관계 매트릭스]

    M & N --> O[결과 출력]

    style A fill:#e1f5ff
    style K fill:#ffe1e1
    style L fill:#e1ffe1
    style M fill:#fff4e1
```

---

## 🔄 백테스팅 프로세스

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Data Source

    U->>F: 포트폴리오 제출
    F->>B: POST /api/backtest
    B->>D: 과거 1년 데이터 요청
    D-->>B: 일별 가격 데이터

    loop 252 거래일
        B->>B: 일별 수익률 계산
        B->>B: 포트폴리오 가치 업데이트
        B->>B: 최대 낙폭 추적
    end

    B->>B: 최종 수익률 계산
    B->>B: 벤치마크(KOSPI) 비교
    B-->>F: 백테스팅 결과
    F-->>U: 차트 + 성과 지표

    Note over B,D: 초기 투자금: 1,000만원<br/>리밸런싱: 없음 (Buy & Hold)
```

---

## 📰 뉴스 감성 분석 파이프라인

```mermaid
flowchart LR
    subgraph "Input"
        A1[종목 티커]
    end

    subgraph "Data Collection"
        B1[뉴스 검색<br/>네이버/구글]
        B2[최근 5개 뉴스]
    end

    subgraph "Preprocessing"
        C1[텍스트 정제]
        C2[제목 + 본문]
    end

    subgraph "Keyword Analysis"
        D1[긍정 키워드<br/>60개]
        D2[부정 키워드<br/>60개]
        D3[키워드 매칭]
    end

    subgraph "Scoring"
        E1[감성 점수 계산<br/>긍정×10 - 부정×10]
        E2[점수 범위<br/>-100 ~ +100]
    end

    subgraph "Output"
        F1{감성 분류}
        F2[🟢 긍정<br/>>50]
        F3[🟡 중립<br/>-50~50]
        F4[🔴 부정<br/><-50]
    end

    A1 --> B1 --> B2 --> C1 --> C2
    C2 --> D1 & D2
    D1 & D2 --> D3 --> E1 --> E2 --> F1
    F1 --> F2 & F3 & F4

    style A1 fill:#e1f5ff
    style F2 fill:#e1ffe1
    style F3 fill:#fff4e1
    style F4 fill:#ffe1e1
```

---

## 🗄️ 데이터 플로우

```mermaid
flowchart TB
    subgraph "Real-time Data"
        A1[pykrx API]
        A2[한국거래소 KRX]
        A1 <--> A2
    end

    subgraph "Caching Layer"
        B1[JSON Cache]
        B2[24시간 TTL]
        B3[타임스탬프]
    end

    subgraph "Backend Processing"
        C1[Flask API]
        C2[데이터 변환]
        C3[특징 추출]
        C4[AI 분석]
    end

    subgraph "Frontend Display"
        D1[React Components]
        D2[Recharts 시각화]
        D3[실시간 업데이트]
    end

    A1 -->|fetch| C1
    C1 <-->|read/write| B1
    B1 --> B2 & B3

    C1 --> C2 --> C3 --> C4
    C4 -->|JSON| D1
    D1 --> D2
    D2 --> D3

    D3 -.->|수동/자동<br/>새로고침| C1

    style A1 fill:#e1f5ff
    style B1 fill:#fff4e1
    style C4 fill:#ffe1e1
    style D2 fill:#e1ffe1
```

---

## 🎨 컴포넌트 구조

```mermaid
graph TD
    A[App.jsx] --> B[Home.jsx]
    A --> C[Survey.jsx]
    A --> D[Results.jsx]

    D --> E[Portfolio Summary]
    D --> F[MPTAnalysis.jsx]
    D --> G[Backtesting.jsx]
    D --> H[NewsSentiment.jsx]
    D --> I[Recommendations.jsx]

    F --> F1[효율적 투자선 차트]
    F --> F2[상관관계 히트맵]
    F --> F3[쉬운 설명 보기]

    G --> G1[누적 수익률 차트]
    G --> G2[성과 지표]

    H --> H1[종목별 감성 점수]
    H --> H2[최근 뉴스 5개]

    I --> I1[Top 5 추천 카드]
    I --> I2[점수 배지]
    I --> I3[쉬운 설명 보기]

    style A fill:#e1f5ff
    style D fill:#fff4e1
    style F fill:#ffe1e1
    style G fill:#e1ffe1
    style H fill:#f5e1ff
    style I fill:#ffe1f5
```

---

## 🔐 API 엔드포인트 맵

```mermaid
graph LR
    A[Frontend<br/>:5173] -->|GET| B[/api/stocks]
    A -->|POST| C[/api/mpt/analyze]
    A -->|POST| D[/api/backtest]
    A -->|POST| E[/api/news/sentiment]
    A -->|POST| F[/api/recommendations/hybrid]
    A -->|GET| G[/api/cache/status]
    A -->|DELETE| H[/api/cache/clear]

    subgraph "Backend API :3001"
        B
        C
        D
        E
        F
        G
        H
    end

    B --> I[주식 시세]
    C --> J[MPT 분석]
    D --> K[백테스팅]
    E --> L[뉴스 감성]
    F --> M[AI 추천]
    G --> N[캐시 상태]
    H --> O[캐시 삭제]

    style A fill:#e1f5ff
    style F fill:#ffe1e1
```

---

## 🧠 AI 특징 벡터 구조

```mermaid
graph TB
    A[종목 Feature Vector<br/>14 dimensions] --> B[기본 정보 2]
    A --> C[펀더멘털 4]
    A --> D[리스크 4]
    A --> E[기술적 지표 4]

    B --> B1[sector: 섹터]
    B --> B2[type: 타입]

    C --> C1[dividend_yield: 배당률]
    C --> C2[per: 주가수익비율]
    C --> C3[pbr: 주가순자산비율]
    C --> C4[roe: 자기자본이익률]

    D --> D1[volatility: 변동성]
    D --> D2[sharpe_ratio: 샤프비율]
    D --> D3[beta: 베타]
    D --> D4[max_drawdown: 최대낙폭]

    E --> E1[rsi_14: RSI]
    E --> E2[momentum_10: 모멘텀]
    E --> E3[bb_position: 볼린저밴드]
    E --> E4[price_roc_10: 가격변화율]

    style A fill:#ffe1e1
    style B fill:#e1f5ff
    style C fill:#e1ffe1
    style D fill:#fff4e1
    style E fill:#f5e1ff
```

---

## 📈 사용자 여정 (User Journey)

```mermaid
journey
    title 포트폴리오 추천 사용자 여정
    section 시작
      홈페이지 방문: 5: User
      "시작하기" 클릭: 5: User
    section 설문
      투자 금액 입력: 4: User
      위험 성향 선택: 4: User
      투자 기간 선택: 4: User
      선호 섹터 선택: 3: User
      개인 정보 입력: 3: User
    section 결과 확인
      포트폴리오 확인: 5: User, System
      실시간 시세 로딩: 4: System
      MPT 분석 확인: 5: User
      백테스팅 결과: 5: User
      뉴스 감성 분석: 4: User
      AI 추천 확인: 5: User, AI
    section 의사결정
      추천 이유 학습: 5: User
      쉬운 설명 보기: 5: User
      투자 결정: 5: User
```

---

## 🎯 성능 최적화 전략

```mermaid
flowchart TD
    A[성능 최적화] --> B[Frontend]
    A --> C[Backend]
    A --> D[Data]

    B --> B1[React.memo<br/>불필요한 렌더링 방지]
    B --> B2[Code Splitting<br/>지연 로딩]
    B --> B3[LocalStorage<br/>클라이언트 캐싱]

    C --> C1[Flask 비동기<br/>동시 요청 처리]
    C --> C2[캐시 레이어<br/>24시간 TTL]
    C --> C3[배치 처리<br/>다중 종목 동시 분석]

    D --> D1[pykrx 캐싱<br/>중복 호출 방지]
    D --> D2[JSON 압축<br/>전송 크기 감소]
    D --> D3[증분 업데이트<br/>변경된 데이터만]

    style A fill:#ffe1e1
    style B fill:#e1f5ff
    style C fill:#e1ffe1
    style D fill:#fff4e1
```

---

## 🔄 개발 워크플로우

```mermaid
gitgraph
    commit id: "Initial MVP"
    branch feature/mpt
    checkout feature/mpt
    commit id: "MPT Calculator"
    commit id: "MPT Frontend"
    checkout main
    merge feature/mpt

    branch feature/backtest
    checkout feature/backtest
    commit id: "Backtest Engine"
    commit id: "Backtest UI"
    checkout main
    merge feature/backtest

    branch feature/news
    checkout feature/news
    commit id: "News Sentiment"
    commit id: "News UI"
    checkout main
    merge feature/news

    branch feature/ai-recommendation
    checkout feature/ai-recommendation
    commit id: "Feature Extraction"
    commit id: "Content-Based"
    commit id: "Collaborative Filtering"
    commit id: "Hybrid System"
    commit id: "AI UI Components"
    checkout main
    merge feature/ai-recommendation tag: "v1.0"
```

---

## 📊 시스템 메트릭

```mermaid
pie title "코드 구성 비율"
    "Frontend (React)" : 35
    "Backend (Python)" : 40
    "AI/ML 알고리즘" : 15
    "Documentation" : 5
    "Config & Tests" : 5
```

```mermaid
pie title "기능별 복잡도"
    "AI 추천 시스템" : 30
    "MPT 분석" : 25
    "백테스팅" : 20
    "뉴스 감성 분석" : 15
    "기본 포트폴리오" : 10
```

---

## 🚀 배포 아키텍처 (향후 계획)

```mermaid
graph TB
    subgraph "Production"
        A[Vercel/Netlify<br/>Frontend]
        B[Heroku/AWS<br/>Backend API]
        C[Redis<br/>Cache Layer]
        D[PostgreSQL<br/>User Data]
    end

    subgraph "CI/CD"
        E[GitHub Actions]
        F[Auto Tests]
        G[Build & Deploy]
    end

    subgraph "Monitoring"
        H[Sentry<br/>Error Tracking]
        I[Google Analytics<br/>Usage Stats]
    end

    E --> F --> G
    G --> A & B

    A <--> B
    B <--> C
    B <--> D

    A & B --> H
    A --> I

    style A fill:#e1f5ff
    style B fill:#ffe1e1
    style C fill:#fff4e1
    style D fill:#e1ffe1
```

---

## 📱 반응형 디자인

```mermaid
graph LR
    A[Responsive Design] --> B[Mobile<br/>< 640px]
    A --> C[Tablet<br/>640-1024px]
    A --> D[Desktop<br/>> 1024px]

    B --> B1[세로 레이아웃]
    B --> B2[터치 최적화]
    B --> B3[간소화된 차트]

    C --> C1[2열 그리드]
    C --> C2[중간 크기 차트]

    D --> D1[3열 그리드]
    D --> D2[풀사이즈 차트]
    D --> D3[호버 인터랙션]

    style A fill:#ffe1e1
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#e1ffe1
```
