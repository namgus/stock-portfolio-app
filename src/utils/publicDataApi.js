// 공공데이터포털 API 호출 유틸리티

const API_BASE_URL = 'http://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService';
const API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY;

/**
 * 주식 시세 정보 조회
 * @param {string} stockCode - 종목코드 (6자리)
 * @param {string} date - 조회일자 (YYYYMMDD)
 * @returns {Promise<Object>}
 */
export const getStockPrice = async (stockCode, date = getTodayDate()) => {
  if (!API_KEY) {
    console.warn('API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다.');
    return null;
  }

  try {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      numOfRows: '1',
      pageNo: '1',
      resultType: 'json',
      basDt: date, // 기준일자
      likeSrtnCd: stockCode // 종목코드
    });

    const response = await fetch(`${API_BASE_URL}/getStockPriceInfo?${params}`);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    // API 응답 구조 확인
    if (data.response?.body?.items?.item) {
      const item = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item[0]
        : data.response.body.items.item;

      return {
        stockCode: item.srtnCd,
        stockName: item.itmsNm,
        marketPrice: parseInt(item.mkp || 0), // 시가
        highPrice: parseInt(item.hipr || 0), // 고가
        lowPrice: parseInt(item.lopr || 0), // 저가
        closePrice: parseInt(item.clpr || 0), // 종가
        volume: parseInt(item.trqu || 0), // 거래량
        tradingValue: parseInt(item.trPrc || 0), // 거래대금
        marketCap: parseInt(item.mrktTotAmt || 0), // 시가총액
        listedShares: parseInt(item.lstgStCnt || 0), // 상장주식수
        baseDate: item.basDt
      };
    }

    return null;
  } catch (error) {
    console.error('주식 시세 조회 오류:', error);
    return null;
  }
};

/**
 * 여러 종목의 시세 정보 일괄 조회
 * @param {Array<string>} stockCodes - 종목코드 배열
 * @param {string} date - 조회일자
 * @returns {Promise<Object>} 종목코드를 키로 하는 객체
 */
export const getBatchStockPrices = async (stockCodes, date = getTodayDate()) => {
  if (!API_KEY) {
    console.warn('API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다.');
    return {};
  }

  const results = {};

  // API 호출 제한을 고려하여 순차 호출 (실제로는 Promise.all 사용 가능)
  for (const code of stockCodes) {
    const data = await getStockPrice(code, date);
    if (data) {
      results[code] = data;
    }
    // API 호출 간 간격을 두어 Rate Limit 방지
    await sleep(100);
  }

  return results;
};

/**
 * 상장종목 기본 정보 조회
 * @param {string} stockCode - 종목코드
 * @returns {Promise<Object>}
 */
export const getStockInfo = async (stockCode) => {
  if (!API_KEY) {
    return null;
  }

  try {
    // KRX상장종목정보 API 엔드포인트 (별도 API)
    const infoApiUrl = 'http://apis.data.go.kr/1160100/service/GetKrxListedInfoService';

    const params = new URLSearchParams({
      serviceKey: API_KEY,
      numOfRows: '1',
      pageNo: '1',
      resultType: 'json',
      likeSrtnCd: stockCode
    });

    const response = await fetch(`${infoApiUrl}/getItemInfo?${params}`);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data.response?.body?.items?.item) {
      const item = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item[0]
        : data.response.body.items.item;

      return {
        stockCode: item.srtnCd,
        stockName: item.itmsNm,
        corpName: item.corpNm,
        marketType: item.mrktCtg, // 시장구분 (KOSPI/KOSDAQ)
        sector: item.sectNm, // 업종명
        listedDate: item.lstgDt // 상장일
      };
    }

    return null;
  } catch (error) {
    console.error('종목 정보 조회 오류:', error);
    return null;
  }
};

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환
 * @returns {string}
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 가장 최근 영업일 날짜 반환 (간단 버전)
 * @returns {string}
 */
export const getLatestBusinessDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // 주말이면 금요일로 설정
  if (dayOfWeek === 0) { // 일요일
    today.setDate(today.getDate() - 2);
  } else if (dayOfWeek === 6) { // 토요일
    today.setDate(today.getDate() - 1);
  }

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 지연 함수
 * @param {number} ms - 밀리초
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API 키 설정 여부 확인
 * @returns {boolean}
 */
export const isApiKeyConfigured = () => {
  return !!API_KEY && API_KEY.trim() !== '';
};
