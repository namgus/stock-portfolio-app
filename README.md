# 📈 스마트 포트폴리오 - AI 기반 주식 포트폴리오 추천 서비스

> 사용자의 투자 성향을 분석하여 맞춤형 주식 포트폴리오를 추천하고, ISA 절세 계좌 전략을 제공하는 웹 애플리케이션

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[🚀 데모 보기](#) | [📖 문서](#-주요-문서) | [🐛 버그 리포트](https://github.com/yourusername/stock-portfolio-app/issues)

</div>

---

## ✨ 주요 기능

### 1. 🎯 맞춤형 포트폴리오 추천
- **5단계 설문 시스템**: 투자 금액, 위험도, 기간, 선호 섹터, 개인 정보 수집
- **3가지 투자 성향 분석**: 보수적, 중립적, 공격적 투자자 분류
- **룰 기반 추천 알고리즘**: 투자 성향에 맞는 최적의 종목 조합

### 2. 📊 시각화 및 분석
- **인터랙티브 파이 차트**: Recharts를 활용한 포트폴리오 구성 시각화
- **종목별 상세 정보**: 현재가, PER, ROE, 배당수익률 등
- **리스크 수준 분석**: 1-10 단계 리스크 점수 제공
- **예상 수익률 계산**: 투자 기간에 따른 예상 수익률

### 3. 💰 ISA 절세 계좌 추천
- **자동 자격 판단**: 소득 수준에 따른 ISA 유형 추천 (일반형/서민형)
- **절세액 계산**: 일반 계좌 대비 예상 절세액 제시
- **최적 계좌 구조**: ISA와 일반계좌 배분 전략 제공

### 4. 🔌 실시간 데이터 연동 (선택)
- **공공데이터포털 API**: 금융위원회 주식시세정보 연동
- **자동 폴백**: API 키 없이도 샘플 데이터로 작동
- **로딩 상태 관리**: 데이터 로딩 중 UX 최적화

### 5. 📱 반응형 디자인
- **모바일/태블릿/데스크톱** 모든 기기 지원
- **모던 UI/UX**: Tailwind CSS 기반 깔끔한 디자인
- **접근성**: 명확한 라벨, 적절한 대비

---

## 🎬 데모

### 홈 페이지
서비스 소개 및 주요 기능 안내

### 설문 페이지
5단계 질문으로 투자 성향 파악
- 진행률 표시
- 직관적인 선택 UI
- 실시간 입력 검증

### 결과 페이지
- 맞춤형 포트폴리오 추천
- 파이 차트 시각화
- 종목별 상세 정보
- ISA 절세 전략
- 포트폴리오 총평

---

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/stock-portfolio-app.git
cd stock-portfolio-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 열기
# http://localhost:5173
```

### API 키 설정 (선택사항)

실시간 주식 시세 데이터를 사용하려면:

1. [공공데이터포털](https://www.data.go.kr/data/15094808/openapi.do)에서 API 키 발급
2. `.env` 파일 생성 및 API 키 입력

```bash
cp .env.example .env
# .env 파일에서 VITE_PUBLIC_DATA_API_KEY 설정
```

자세한 내용은 [API_SETUP.md](./API_SETUP.md)를 참고하세요.

---

## 📁 프로젝트 구조

```
stock-portfolio-app/
├── src/
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.jsx        # 랜딩 페이지
│   │   ├── Survey.jsx      # 설문 페이지
│   │   └── Results.jsx     # 결과 페이지
│   ├── components/         # 재사용 컴포넌트 (향후 확장)
│   ├── utils/              # 유틸리티 함수
│   │   ├── portfolioRecommendation.js  # 추천 알고리즘
│   │   └── publicDataApi.js             # API 호출
│   ├── data/               # 데이터 및 상수
│   │   └── stockData.js    # 주식 데이터
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── index.css           # Tailwind CSS
│   └── main.jsx            # 앱 엔트리 포인트
├── public/                 # 정적 파일
├── API_SETUP.md            # API 설정 가이드
├── API_COMPARISON.md       # API 비교 분석
├── ROADMAP.md              # 개발 로드맵
├── .env.example            # 환경 변수 템플릿
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🛠️ 기술 스택

### Frontend
- **React 18.3**: UI 라이브러리
- **Vite 7.2**: 빌드 도구 및 개발 서버
- **Tailwind CSS 3.4**: 유틸리티 기반 CSS 프레임워크
- **Recharts**: 데이터 시각화 라이브러리
- **Lucide React**: 아이콘 라이브러리

### API & Data
- **공공데이터포털 API**: 금융위원회 주식시세정보
- **샘플 데이터**: 하드코딩된 주요 국내 종목 (삼성전자, 네이버, 카카오 등)

### 개발 도구
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 후처리
- **Autoprefixer**: 벤더 프리픽스 자동 추가

---

## 📚 주요 문서

- **[API_SETUP.md](./API_SETUP.md)**: 공공데이터포털 API 키 발급 및 설정 가이드
- **[API_COMPARISON.md](./API_COMPARISON.md)**: 국내 주식 API 비교 분석 (공공데이터, 한국투자증권, Yahoo Finance)
- **[ROADMAP.md](./ROADMAP.md)**: 향후 개발 계획 및 개선사항 (Phase 1-8)

---

## 🗺️ 로드맵

### ✅ Phase 1: MVP (완료)
- [x] 홈/랜딩 페이지
- [x] 5단계 설문 시스템
- [x] 룰 기반 포트폴리오 추천
- [x] 결과 페이지 (차트, 종목 리스트)
- [x] ISA 절세 계좌 추천
- [x] 반응형 디자인
- [x] 공공데이터포털 API 연동

### 🚧 Phase 2: 데이터 개선 (진행 예정)
- [ ] Yahoo Finance API 마이그레이션
- [ ] 100+ 국내 주요 종목 추가
- [ ] 실시간 데이터 업데이트

### 📅 Phase 3: 알고리즘 고도화
- [ ] Modern Portfolio Theory (MPT) 적용
- [ ] 백테스팅 시뮬레이션
- [ ] 뉴스 Sentiment 분석

### 🎨 Phase 4: UI/UX 개선
- [ ] 섹터별 분산도 차트
- [ ] 애니메이션 및 전환 효과
- [ ] 다크 모드

자세한 로드맵은 [ROADMAP.md](./ROADMAP.md)를 참고하세요.

---

## 💡 사용 예시

### 1. 보수적 투자자
- **투자 금액**: 3,000만원
- **위험도**: 보수적
- **투자 기간**: 장기 (3년 이상)
- **결과**: 배당주 70% + 채권 ETF 30%

### 2. 공격적 투자자
- **투자 금액**: 5,000만원
- **위험도**: 공격적
- **투자 기간**: 단기 (1년 미만)
- **결과**: 성장주 60% + 중소형주 40%

---

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 기여 가이드라인
- 🐛 버그 리포트
- 💡 기능 제안
- 📝 문서 개선
- 🎨 디자인 개선
- 💻 코드 기여

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

---

## 👨‍💻 개발자

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 감사의 말

- [공공데이터포털](https://www.data.go.kr) - 금융 데이터 제공
- [Recharts](https://recharts.org) - 차트 라이브러리
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크
- [Lucide](https://lucide.dev) - 아이콘

---

## ⚠️ 면책 조항

본 서비스는 투자 참고용이며, 실제 투자 결정은 본인의 책임입니다.
시장 상황에 따라 수익률은 변동될 수 있으며, 투자 손실에 대한 책임은 투자자 본인에게 있습니다.

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐**

Made with ❤️ by [Your Name]

</div>
