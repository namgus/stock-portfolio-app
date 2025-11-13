// Yahoo Finance API 유틸리티
import yahooFinance from 'yahoo-finance2';

// 로컬 스토리지 키
const CACHE_KEY = 'stock_data_cache';
const CACHE_TIMESTAMP_KEY = 'stock_data_cache_timestamp';

/**
 * 한국 주식 티커 변환 (6자리 코드 → Yahoo Finance 형식)
 * 예: '005930' → '005930.KS' (KOSPI), '035720' → '035720.KQ' (KOSDAQ)
 */
export const convertToYahooTicker = (ticker, market = 'KS') => {
  // 이미 .KS 또는 .KQ가 붙어있으면 그대로 반환
  if (ticker.includes('.KS') || ticker.includes('.KQ')) {
    return ticker;
  }

  // KOSDAQ 종목 리스트 (확장 가능)
  const kosdaqTickers = ['035720', '035420', '068270', '247540'];

  if (kosdaqTickers.includes(ticker)) {
    return `${ticker}.KQ`;
  }

  return `${ticker}.KS`;
};

/**
 * 단일 종목 시세 데이터 가져오기
 */
export const getStockQuote = async (ticker) => {
  try {
    const yahooTicker = convertToYahooTicker(ticker);
    const quote = await yahooFinance.quote(yahooTicker);

    return {
      ticker: ticker,
      yahooTicker: yahooTicker,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      dividendYield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
      trailingPE: quote.trailingPE?.toFixed(2),
      forwardPE: quote.forwardPE?.toFixed(2),
      priceToBook: quote.priceToBook?.toFixed(2),
      currency: quote.currency || 'KRW',
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
export const getBatchStockQuotes = async (tickers) => {
  const results = {};

  for (const ticker of tickers) {
    const data = await getStockQuote(ticker);
    if (data) {
      results[ticker] = data;
    }
    // Rate limiting 방지를 위한 딜레이
    await sleep(200);
  }

  return results;
};

/**
 * 캐시된 데이터 가져오기
 */
export const getCachedStockData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) {
      return null;
    }

    // 캐시 유효성 검사 (24시간)
    const cacheAge = Date.now() - parseInt(timestamp);
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (cacheAge > oneDayInMs) {
      console.log('캐시가 만료되었습니다.');
      return null;
    }

    const data = JSON.parse(cached);
    console.log('캐시된 데이터 사용:', new Date(parseInt(timestamp)).toLocaleString('ko-KR'));
    return data;

  } catch (error) {
    console.error('캐시 읽기 오류:', error);
    return null;
  }
};

/**
 * 데이터를 캐시에 저장
 */
export const cacheStockData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('데이터 캐시 저장 완료');
  } catch (error) {
    console.error('캐시 저장 오류:', error);
  }
};

/**
 * 캐시 초기화
 */
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  console.log('캐시가 초기화되었습니다.');
};

/**
 * 캐시 상태 확인
 */
export const getCacheStatus = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

  if (!timestamp) {
    return {
      exists: false,
      timestamp: null,
      age: null
    };
  }

  const cacheTime = parseInt(timestamp);
  const age = Date.now() - cacheTime;

  return {
    exists: true,
    timestamp: new Date(cacheTime).toLocaleString('ko-KR'),
    age: Math.floor(age / (1000 * 60 * 60)), // 시간 단위
    isExpired: age > (24 * 60 * 60 * 1000)
  };
};

/**
 * 주식 데이터 가져오기 (캐시 우선)
 */
export const fetchStockData = async (tickers, forceRefresh = false) => {
  // 강제 새로고침이 아니면 캐시 확인
  if (!forceRefresh) {
    const cached = getCachedStockData();
    if (cached) {
      return cached;
    }
  }

  console.log('새로운 데이터를 가져오는 중...');

  // 새 데이터 가져오기
  const data = await getBatchStockQuotes(tickers);

  // 캐시에 저장
  cacheStockData(data);

  return data;
};

/**
 * 종목 검색 (자동완성용)
 */
export const searchStock = async (query) => {
  try {
    const results = await yahooFinance.search(query);
    return results.quotes
      .filter(q => q.symbol.endsWith('.KS') || q.symbol.endsWith('.KQ'))
      .slice(0, 10)
      .map(q => ({
        symbol: q.symbol.replace('.KS', '').replace('.KQ', ''),
        name: q.longname || q.shortname,
        exchange: q.exchange
      }));
  } catch (error) {
    console.error('검색 오류:', error);
    return [];
  }
};

/**
 * 지연 함수
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 펀더멘털 데이터 가져오기 (추가 정보)
 */
export const getStockFundamentals = async (ticker) => {
  try {
    const yahooTicker = convertToYahooTicker(ticker);

    // quoteSummary는 더 상세한 정보를 제공
    const summary = await yahooFinance.quoteSummary(yahooTicker, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData']
    });

    return {
      ticker: ticker,
      marketCap: summary.summaryDetail?.marketCap,
      trailingPE: summary.summaryDetail?.trailingPE,
      forwardPE: summary.summaryDetail?.forwardPE,
      pegRatio: summary.defaultKeyStatistics?.pegRatio,
      priceToBook: summary.defaultKeyStatistics?.priceToBook,
      priceToSales: summary.defaultKeyStatistics?.priceToSalesTrailing12Months,
      profitMargins: summary.financialData?.profitMargins,
      operatingMargins: summary.financialData?.operatingMargins,
      returnOnAssets: summary.financialData?.returnOnAssets,
      returnOnEquity: summary.financialData?.returnOnEquity,
      revenueGrowth: summary.financialData?.revenueGrowth,
      earningsGrowth: summary.financialData?.earningsGrowth,
      debtToEquity: summary.financialData?.debtToEquity,
      currentRatio: summary.financialData?.currentRatio,
      beta: summary.defaultKeyStatistics?.beta
    };
  } catch (error) {
    console.error(`펀더멘털 데이터 가져오기 실패 ${ticker}:`, error.message);
    return null;
  }
};

export default {
  getStockQuote,
  getBatchStockQuotes,
  fetchStockData,
  getCachedStockData,
  cacheStockData,
  clearCache,
  getCacheStatus,
  searchStock,
  getStockFundamentals,
  convertToYahooTicker
};
