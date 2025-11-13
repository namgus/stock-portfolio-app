# 🚀 설치 및 실행 가이드

## 문제 해결: "로컬에서 실행이 안돼"

이 문제는 `yahoo-finance2` 라이브러리가 브라우저에서 직접 실행될 수 없어서 발생했습니다.

### 해결책: 백엔드 API 프록시 서버 추가

`yahoo-finance2`는 Node.js 환경에서만 작동하므로, Express 백엔드 서버를 추가하여 Yahoo Finance API를 프록시하도록 구현했습니다.

---

## 📋 실행 방법

### 1단계: 의존성 설치

```bash
npm install
```

### 2단계: 백엔드 서버 실행 (터미널 1)

```bash
npm run server
```

백엔드 서버가 포트 3001에서 실행됩니다:
```
🚀 Yahoo Finance 프록시 서버 실행 중: http://localhost:3001
📊 주식 데이터 API: http://localhost:3001/api/stocks?tickers=005930,035420
💾 캐시 상태: http://localhost:3001/api/cache/status
```

### 3단계: 프론트엔드 개발 서버 실행 (터미널 2)

**새 터미널 창을 열고** 다음 명령어를 실행합니다:

```bash
npm run dev
```

프론트엔드 서버가 포트 5173에서 실행됩니다:
```
VITE v7.2.1  ready in 288 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4단계: 브라우저에서 열기

http://localhost:5173 에 접속하세요.

---

## ⚠️ 중요 사항

**두 개의 서버가 모두 실행되어야 합니다:**

1. **백엔드 API 서버** (포트 3001)
   - Yahoo Finance API를 호출
   - 24시간 메모리 캐싱
   - CORS 지원

2. **프론트엔드 개발 서버** (포트 5173)
   - React 앱
   - Hot Module Replacement (HMR)

백엔드 서버가 실행되지 않으면, 브라우저 콘솔에 다음과 같은 에러가 표시됩니다:
```
백엔드 API 데이터 로드 실패: TypeError: Failed to fetch
백엔드 서버(http://localhost:3001)가 실행 중인지 확인해주세요.
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│            http://localhost:5173                 │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │         React Frontend (Vite)           │   │
│  │   - Survey & Results pages              │   │
│  │   - Recharts visualization              │   │
│  └─────────────────┬───────────────────────┘   │
└────────────────────┼───────────────────────────┘
                     │
                     │ fetch()
                     │
          ┌──────────▼──────────────┐
          │  Backend API Server     │
          │  (Express, Port 3001)   │
          │                         │
          │  - /api/stocks          │
          │  - /api/cache/status    │
          │  - Memory cache (24h)   │
          └──────────┬──────────────┘
                     │
                     │ yahoo-finance2
                     │
          ┌──────────▼──────────────┐
          │   Yahoo Finance API     │
          │   (한국 주식 시세)        │
          └─────────────────────────┘
```

---

## 🔧 기술 스택

### Frontend
- React 19.1 + Vite 7.2
- Tailwind CSS 3.4
- Recharts (데이터 시각화)
- Lucide React (아이콘)

### Backend (NEW)
- Express 5.1
- yahoo-finance2 3.10
- CORS 2.8
- 메모리 캐싱 (24시간)

---

## 📊 API 엔드포인트

### GET /api/stocks
여러 종목의 시세 데이터 가져오기

**Query Parameters:**
- `tickers`: 쉼표로 구분된 종목 코드 (예: `005930,035420`)
- `forceRefresh`: `true`로 설정하면 캐시 무시

**Example:**
```bash
curl "http://localhost:3001/api/stocks?tickers=005930,035420"
```

**Response:**
```json
{
  "data": {
    "005930": {
      "ticker": "005930",
      "name": "삼성전자",
      "price": 71000,
      "previousClose": 70500,
      "dividendYield": "2.50",
      "trailingPE": "12.50",
      ...
    }
  },
  "cached": false,
  "cacheTimestamp": 1699876543210,
  "cacheAge": 0
}
```

### GET /api/cache/status
캐시 상태 확인

**Example:**
```bash
curl http://localhost:3001/api/cache/status
```

### DELETE /api/cache
캐시 초기화

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/cache
```

### GET /api/health
서버 상태 확인

**Example:**
```bash
curl http://localhost:3001/api/health
```

---

## 🐛 문제 해결

### 1. "백엔드 서버가 실행 중인지 확인해주세요" 에러

**원인:** 백엔드 서버(포트 3001)가 실행되지 않음

**해결:**
```bash
npm run server
```

### 2. "Port 5173 is already in use" 에러

**원인:** 프론트엔드 서버가 이미 실행 중

**해결:**
- 기존 프로세스 종료 후 다시 실행
- 또는 Vite가 자동으로 다른 포트(5174 등)를 사용

### 3. "yahoo-finance2 is not defined" 에러

**원인:** 브라우저에서 직접 yahoo-finance2를 import하려고 시도

**해결:**
- `src/utils/yahooFinanceApi.js`가 백엔드 API를 호출하도록 업데이트되었는지 확인
- yahoo-finance2는 백엔드 서버(`server.js`)에서만 사용되어야 함

### 4. CORS 에러

**원인:** 백엔드 서버에서 CORS가 설정되지 않음

**해결:**
- `server.js`에서 `cors` 미들웨어가 추가되었는지 확인
- Express에서 `app.use(cors());` 호출 확인

---

## 📝 변경 사항 요약

### 새로 추가된 파일
- `server.js` - Express 백엔드 API 서버
- `SETUP_GUIDE.md` - 이 문서

### 수정된 파일
- `src/utils/yahooFinanceApi.js` - 백엔드 API 호출로 변경
- `src/pages/Results.jsx` - async getCacheStatus 처리
- `package.json` - express, cors 의존성 추가 및 `server` 스크립트 추가
- `README.md` - 두 서버 실행 방법 업데이트

### 아키텍처 변경
**Before:** React ➔ yahoo-finance2 (❌ 브라우저에서 실행 불가)

**After:** React ➔ Express API ➔ yahoo-finance2 (✅ Node.js에서 실행)

---

## 🎯 다음 단계

1. ✅ **로컬 실행 문제 해결** - 완료
2. 📝 GitHub에 커밋 및 푸시
3. 🧪 전체 플로우 테스트 (설문 → 결과 → API 데이터 로드)
4. 📊 실제 Yahoo Finance 데이터 확인
5. 💾 캐싱 동작 확인 (24시간 유효성)

---

## 💡 추가 개선 사항 (선택)

### 프로덕션 배포 시 고려사항

1. **환경 변수 분리**
   ```javascript
   // .env
   VITE_API_URL=http://localhost:3001/api

   // 프로덕션
   VITE_API_URL=https://api.yourapp.com/api
   ```

2. **에러 처리 개선**
   - 백엔드 서버 다운 시 폴백 UI
   - 샘플 데이터로 대체

3. **캐싱 전략 업그레이드**
   - Redis 또는 데이터베이스 사용
   - 서버 재시작 시에도 캐시 유지

4. **보안**
   - API rate limiting
   - 인증/인가 추가

5. **모니터링**
   - 로깅 (Winston, Pino)
   - APM (New Relic, DataDog)

---

Made with ❤️ using Claude Code
