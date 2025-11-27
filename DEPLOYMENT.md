# 배포 가이드 (Deployment Guide)

이 문서는 주식 포트폴리오 앱을 Vercel(프론트엔드)과 Railway(백엔드)에 배포하는 방법을 설명합니다.

## 목차
1. [사전 준비](#사전-준비)
2. [Railway 백엔드 배포](#railway-백엔드-배포)
3. [Vercel 프론트엔드 배포](#vercel-프론트엔드-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [GitHub Actions 설정](#github-actions-설정)
6. [배포 테스트](#배포-테스트)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### 필요한 계정
- [GitHub](https://github.com) 계정
- [Railway](https://railway.app) 계정
- [Vercel](https://vercel.com) 계정

### GitHub 저장소 준비
1. GitHub에 새 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:
```bash
git init
git add .
git commit -m "Initial commit: AI-powered stock portfolio app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Railway 백엔드 배포

### 1단계: Railway 프로젝트 생성

1. [Railway Dashboard](https://railway.app/dashboard)로 이동
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 저장소 선택 및 연결 승인

### 2단계: 환경 변수 설정

Railway 프로젝트 설정에서 다음 환경 변수 추가:

```bash
FLASK_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**중요**: `ALLOWED_ORIGINS`는 나중에 Vercel 배포 후 실제 도메인으로 업데이트해야 합니다.

### 3단계: 배포 확인

1. Railway가 자동으로 `Procfile`을 감지하고 배포 시작
2. 배포 로그에서 오류 확인
3. "Settings" → "Networking"에서 공개 URL 확인 (예: `https://your-app.railway.app`)
4. API 엔드포인트 테스트:
```bash
curl https://your-app.railway.app/api/cache/status
```

---

## Vercel 프론트엔드 배포

### 1단계: Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)로 이동
2. "Add New Project" 클릭
3. GitHub 저장소 import
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2단계: 환경 변수 설정

Vercel 프로젝트 설정에서 환경 변수 추가:

```bash
VITE_API_URL=https://your-app.railway.app
```

**중요**: Railway 백엔드 URL로 설정해야 합니다.

### 3단계: 배포

1. "Deploy" 클릭하여 첫 배포 시작
2. 배포 완료 후 URL 확인 (예: `https://your-app.vercel.app`)

### 4단계: Railway CORS 설정 업데이트

1. Railway 프로젝트로 돌아가기
2. 환경 변수 `ALLOWED_ORIGINS`를 Vercel URL로 업데이트:
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app
```
3. Railway 프로젝트 재배포 (자동으로 트리거됨)

---

## 환경 변수 설정

### Railway (백엔드)
```bash
# 필수 환경 변수
FLASK_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

# 옵션: 여러 도메인 허용
ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
```

### Vercel (프론트엔드)
```bash
# 필수 환경 변수
VITE_API_URL=https://your-railway-app.railway.app
```

---

## GitHub Actions 설정

### 1단계: GitHub Secrets 추가

Repository Settings → Secrets and variables → Actions에서 다음 secrets 추가:

#### Vercel Secrets
- `VERCEL_TOKEN`: Vercel [Account Settings](https://vercel.com/account/tokens)에서 생성
- `VERCEL_ORG_ID`: Vercel 프로젝트 설정 → General에서 확인
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 설정 → General에서 확인
- `VITE_API_URL`: Railway 백엔드 URL

#### Railway Secrets
- `RAILWAY_TOKEN`: Railway [Account Settings](https://railway.app/account/tokens)에서 생성
- `RAILWAY_SERVICE_NAME`: Railway 프로젝트의 서비스 이름

### 2단계: GitHub Actions 활성화

1. `.github/workflows/deploy.yml` 파일이 main 브랜치에 있는지 확인
2. GitHub Actions 탭에서 workflow 확인
3. main 브랜치에 푸시하면 자동 배포 시작:
```bash
git add .
git commit -m "Update configuration"
git push origin main
```

---

## 배포 테스트

### 백엔드 API 테스트
```bash
# 캐시 상태 확인
curl https://your-railway-app.railway.app/api/cache/status

# 주식 데이터 조회 (삼성전자, NAVER)
curl "https://your-railway-app.railway.app/api/stocks?tickers=005930,035420"
```

### 프론트엔드 테스트
1. Vercel URL로 접속: `https://your-app.vercel.app`
2. 브라우저 개발자 도구 (F12) → Console 탭에서 오류 확인
3. Network 탭에서 API 요청 확인
4. 주요 기능 테스트:
   - 주식 추가 및 조회
   - MPT 분석
   - 백테스팅
   - 뉴스 감성 분석
   - AI 추천

---

## 문제 해결

### CORS 오류
**증상**: 브라우저 콘솔에 "CORS policy" 오류

**해결방법**:
1. Railway 환경 변수 `ALLOWED_ORIGINS`에 Vercel URL이 정확히 설정되었는지 확인
2. Railway 프로젝트 재배포
3. 브라우저 캐시 삭제 후 재시도

### API 연결 오류
**증상**: 프론트엔드에서 API 호출 실패

**해결방법**:
1. Railway 백엔드가 정상 실행 중인지 확인:
```bash
curl https://your-railway-app.railway.app/api/cache/status
```
2. Vercel 환경 변수 `VITE_API_URL`이 정확한지 확인
3. Vercel 프로젝트 재배포

### Railway 배포 실패
**증상**: Railway 배포 로그에 오류

**해결방법**:
1. `requirements.txt`의 모든 패키지가 설치 가능한지 확인
2. `runtime.txt`의 Python 버전 확인 (3.11.10)
3. `Procfile`의 명령어가 정확한지 확인
4. Railway 로그 확인:
   - Dashboard → 프로젝트 → Deployments → 최신 배포 → Logs

### Vercel 빌드 실패
**증상**: Vercel 빌드 로그에 오류

**해결방법**:
1. `package.json`의 의존성 확인
2. 로컬에서 빌드 테스트:
```bash
npm install
npm run build
```
3. Vercel 빌드 로그 확인
4. Node.js 버전이 18 이상인지 확인

### 데이터 로딩 느림
**증상**: 주식 데이터 로딩이 느림

**해결방법**:
1. Railway 서버 리소스 확인
2. pykrx API 응답 시간 확인
3. 캐시가 정상 작동하는지 확인
4. 필요시 캐시 시간 조정 (`server.py`의 `CACHE_DURATION`)

### GitHub Actions 실패
**증상**: GitHub Actions workflow 실패

**해결방법**:
1. GitHub Secrets가 모두 올바르게 설정되었는지 확인
2. Actions 탭에서 실패 로그 확인
3. 각 secret의 유효성 확인:
   - Vercel token이 만료되지 않았는지
   - Railway token이 만료되지 않았는지
   - Project ID와 Org ID가 정확한지

---

## 추가 설정 (선택사항)

### 커스텀 도메인 설정

#### Vercel 도메인
1. Vercel 프로젝트 → Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정에 CNAME 레코드 추가

#### Railway 도메인
1. Railway 프로젝트 → Settings → Networking
2. Custom Domain 추가
3. DNS 설정에 CNAME 레코드 추가
4. Vercel 환경 변수 `VITE_API_URL` 업데이트
5. Railway 환경 변수 `ALLOWED_ORIGINS` 업데이트

### 모니터링 설정
- Railway: 프로젝트 메트릭 및 로그 모니터링
- Vercel: Analytics 및 Web Vitals 확인
- GitHub Actions: workflow 실행 이력 확인

---

## 유용한 명령어

### 로컬 개발 환경
```bash
# 프론트엔드 개발 서버
npm run dev

# 백엔드 개발 서버
python3 server.py

# 프로덕션 빌드 테스트
npm run build
npm run preview
```

### 배포
```bash
# Git 커밋 및 푸시 (자동 배포 트리거)
git add .
git commit -m "Update feature"
git push origin main

# Railway CLI (옵션)
railway login
railway link
railway up

# Vercel CLI (옵션)
vercel login
vercel link
vercel --prod
```

---

## 참고 자료

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Flask Deployment](https://flask.palletsprojects.com/en/latest/deploying/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. 이 가이드의 문제 해결 섹션
2. Railway/Vercel 배포 로그
3. 브라우저 개발자 도구 콘솔
4. GitHub Actions workflow 로그

배포 성공을 기원합니다! 🚀
