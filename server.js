// Express 백엔드 서버 - 주식 시세 API
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 샘플 주식 데이터 (프로토타입용)
// 실제 운영 시에는 실시간 API로 교체 필요
const SAMPLE_STOCK_DATA = {
  '005930': { name: '삼성전자', price: 71000, change: +500, changePercent: 0.71 },
  '000660': { name: 'SK하이닉스', price: 132000, change: -1000, changePercent: -0.75 },
  '055550': { name: '신한지주', price: 42500, change: +200, changePercent: 0.47 },
  '105560': { name: 'KB금융', price: 62000, change: +300, changePercent: 0.49 },
  '033780': { name: 'KT&G', price: 85000, change: 0, changePercent: 0 },
  '035420': { name: 'NAVER', price: 225000, change: +3000, changePercent: 1.35 },
  '005380': { name: '현대차', price: 190000, change: -500, changePercent: -0.26 },
  '051910': { name: 'LG화학', price: 420000, change: +5000, changePercent: 1.20 },
  '006400': { name: '삼성SDI', price: 385000, change: -2000, changePercent: -0.52 },
  '035720': { name: '카카오', price: 48500, change: +1000, changePercent: 2.11 },
  '207940': { name: '삼성바이오로직스', price: 850000, change: +10000, changePercent: 1.19 },
  '068270': { name: '셀트리온', price: 178000, change: -3000, changePercent: -1.66 },
  '373220': { name: 'LG에너지솔루션', price: 425000, change: +8000, changePercent: 1.92 },
  '247540': { name: '에코프로비엠', price: 315000, change: +15000, changePercent: 5.00 },
  '069500': { name: 'KODEX 200', price: 38500, change: +100, changePercent: 0.26 },
  '360750': { name: 'TIGER 미국S&P500', price: 15200, change: +50, changePercent: 0.33 },
  '148070': { name: 'KOSEF 국고채10년', price: 105500, change: -100, changePercent: -0.09 }
};

// 미들웨어
app.use(cors());
app.use(express.json());

// 메모리 캐시 (간단한 프로토타입용)
const cache = {
  data: null,
  timestamp: null
};

/**
 * 단일 종목 시세 데이터 가져오기 (샘플 데이터 사용)
 */
const getStockQuote = async (ticker) => {
  try {
    const stockInfo = SAMPLE_STOCK_DATA[ticker];

    if (!stockInfo) {
      console.warn(`종목 코드 ${ticker}를 찾을 수 없습니다.`);
      return null;
    }

    const { name, price, change, changePercent } = stockInfo;
    const previousClose = price - change;

    return {
      ticker: ticker,
      name: name,
      price: price,
      previousClose: previousClose,
      open: price - (change * 0.5),
      dayHigh: price + (Math.abs(change) * 0.3),
      dayLow: price - (Math.abs(change) * 0.5),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: price * 100000000,
      fiftyTwoWeekHigh: price * 1.25,
      fiftyTwoWeekLow: price * 0.75,
      dividendYield: (Math.random() * 5).toFixed(2),
      trailingPE: (10 + Math.random() * 30).toFixed(2),
      forwardPE: (10 + Math.random() * 25).toFixed(2),
      priceToBook: (1 + Math.random() * 3).toFixed(2),
      changePercent: changePercent,
      change: change,
      currency: 'KRW',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    return null;
  }
};

/**
 * 여러 종목 시세 데이터 일괄 가져오기
 */
const getBatchStockQuotes = async (tickers) => {
  const results = {};

  for (const ticker of tickers) {
    const data = await getStockQuote(ticker);
    if (data) {
      results[ticker] = data;
    }
  }

  return results;
};


/**
 * GET /api/stocks?tickers=005930,035420
 * 여러 종목의 시세 데이터 가져오기 (캐시 지원)
 */
app.get('/api/stocks', async (req, res) => {
  try {
    const { tickers, forceRefresh } = req.query;

    if (!tickers) {
      return res.status(400).json({ error: 'tickers 파라미터가 필요합니다.' });
    }

    const tickerArray = tickers.split(',').map(t => t.trim());

    // 캐시 확인 (24시간 유효)
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (!forceRefresh && cache.data && cache.timestamp && (now - cache.timestamp) < oneDayInMs) {
      console.log('캐시된 데이터 반환:', new Date(cache.timestamp).toLocaleString('ko-KR'));
      return res.json({
        data: cache.data,
        cached: true,
        cacheTimestamp: cache.timestamp,
        cacheAge: Math.floor((now - cache.timestamp) / (1000 * 60 * 60)) // 시간 단위
      });
    }

    console.log('새로운 데이터 가져오는 중:', tickerArray);

    // 새 데이터 가져오기
    const data = await getBatchStockQuotes(tickerArray);

    // 캐시 업데이트
    cache.data = data;
    cache.timestamp = now;

    console.log('데이터 가져오기 완료:', Object.keys(data).length, '개 종목');

    res.json({
      data: data,
      cached: false,
      cacheTimestamp: cache.timestamp,
      cacheAge: 0
    });

  } catch (error) {
    console.error('API 에러:', error);
    res.status(500).json({ error: '주식 데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/cache/status
 * 캐시 상태 확인
 */
app.get('/api/cache/status', (req, res) => {
  const now = Date.now();

  if (!cache.timestamp) {
    return res.json({
      exists: false,
      timestamp: null,
      age: null
    });
  }

  const age = now - cache.timestamp;

  res.json({
    exists: true,
    timestamp: new Date(cache.timestamp).toLocaleString('ko-KR'),
    age: Math.floor(age / (1000 * 60 * 60)), // 시간 단위
    isExpired: age > (24 * 60 * 60 * 1000),
    stockCount: cache.data ? Object.keys(cache.data).length : 0
  });
});

/**
 * DELETE /api/cache
 * 캐시 초기화
 */
app.delete('/api/cache', (req, res) => {
  cache.data = null;
  cache.timestamp = null;
  console.log('캐시가 초기화되었습니다.');
  res.json({ message: '캐시가 초기화되었습니다.' });
});

/**
 * GET /api/health
 * 서버 상태 확인
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n🚀 Yahoo Finance 프록시 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📊 주식 데이터 API: http://localhost:${PORT}/api/stocks?tickers=005930,035420`);
  console.log(`💾 캐시 상태: http://localhost:${PORT}/api/cache/status\n`);
});
