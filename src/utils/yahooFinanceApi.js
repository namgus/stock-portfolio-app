// Yahoo Finance API 유틸리티 (백엔드 프록시 사용)
import { fetchWithRetry } from './fetchWithRetry';

// 백엔드 API URL
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

// 로컬 스토리지 키 (브라우저 측 추가 캐싱용)
const CACHE_KEY = 'stock_data_cache';
const CACHE_TIMESTAMP_KEY = 'stock_data_cache_timestamp';

/**
 * 백엔드 API를 통해 주식 데이터 가져오기
 */
export const fetchStockData = async (tickers, forceRefresh = false) => {
  try {
    const tickerString = Array.isArray(tickers) ? tickers.join(',') : tickers;
    const url = `${API_BASE_URL}/stocks?tickers=${tickerString}${forceRefresh ? '&forceRefresh=true' : ''}`;

    console.log('백엔드 API에서 주식 데이터 요청 중:', url);

    const response = await fetchWithRetry(
      url,
      {
        method: 'GET',
      },
      {
        maxRetries: 3,
        timeout: 30000, // 30초 타임아웃
        onRetry: (attempt, error) => {
          console.log(`주식 데이터 재시도 ${attempt}/3:`, error.message);
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();

    console.log('백엔드 API 응답:', {
      cached: result.cached,
      offline: result.offline,
      stockCount: result.data ? Object.keys(result.data).length : 0,
      cacheAge: result.cacheAge,
      message: result.message
    });

    // 오프라인 모드인 경우 메시지 표시
    if (result.offline && result.message) {
      console.warn('오프라인 모드:', result.message);
    }

    return result.data;

  } catch (error) {
    console.error('주식 데이터 가져오기 실패:', error);
    return null;
  }
};

/**
 * 캐시 상태 확인 (백엔드에서)
 */
export const getCacheStatus = async () => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/cache/status`,
      {
        method: 'GET',
      },
      {
        maxRetries: 2,
        timeout: 10000,
        onRetry: (attempt, error) => {
          console.log(`캐시 상태 확인 재시도 ${attempt}/2:`, error.message);
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('캐시 상태 확인 실패:', error);
    return {
      exists: false,
      timestamp: null,
      age: null
    };
  }
};

/**
 * 캐시 초기화 (백엔드에서)
 */
export const clearCache = async () => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/cache`,
      {
        method: 'DELETE'
      },
      {
        maxRetries: 2,
        timeout: 10000,
        onRetry: (attempt, error) => {
          console.log(`캐시 초기화 재시도 ${attempt}/2:`, error.message);
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log('캐시 초기화:', result.message);
    return result;

  } catch (error) {
    console.error('캐시 초기화 실패:', error);
    return null;
  }
};

/**
 * 서버 상태 확인
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  fetchStockData,
  getCacheStatus,
  clearCache,
  checkServerHealth
};
