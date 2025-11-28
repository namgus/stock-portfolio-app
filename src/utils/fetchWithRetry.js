/**
 * Fetch with timeout and retry logic
 *
 * Railway 백엔드 콜드 스타트를 처리하기 위한 유틸리티
 * - 15초 타임아웃 (콜드 스타트 7-10초 + 처리 시간)
 * - 3번 재시도 with exponential backoff (0s, 2s, 4s)
 * - 명확한 에러 메시지
 */

/**
 * AbortController를 사용한 fetch with timeout
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default: 15000)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`요청 시간 초과 (${timeout / 1000}초). 백엔드 서버가 시작 중일 수 있습니다.`);
    }
    throw error;
  }
}

/**
 * Exponential backoff 계산
 * @param {number} attempt - 시도 횟수 (0부터 시작)
 * @returns {number} 대기 시간 (ms)
 */
function getBackoffDelay(attempt) {
  // 0초, 2초, 4초, 8초, ...
  return attempt === 0 ? 0 : Math.pow(2, attempt - 1) * 2000;
}

/**
 * Sleep utility
 * @param {number} ms - milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry and exponential backoff
 *
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} retryOptions - Retry configuration
 * @param {number} retryOptions.maxRetries - 최대 재시도 횟수 (default: 3)
 * @param {number} retryOptions.timeout - 각 요청의 타임아웃 (ms, default: 15000)
 * @param {function} retryOptions.onRetry - 재시도 시 호출되는 콜백
 * @returns {Promise<Response>}
 *
 * @example
 * try {
 *   const response = await fetchWithRetry(url, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data)
 *   }, {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
 *   });
 *   const data = await response.json();
 * } catch (error) {
 *   console.error('Failed after retries:', error);
 * }
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const {
    maxRetries = 3,
    timeout = 15000,
    onRetry = null,
  } = retryOptions;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 첫 시도가 아니면 대기
      if (attempt > 0) {
        const delay = getBackoffDelay(attempt);
        console.log(`재시도 ${attempt}/${maxRetries} - ${delay / 1000}초 대기 중...`);

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await sleep(delay);
      }

      console.log(`API 요청 시도 ${attempt + 1}/${maxRetries + 1}: ${url}`);
      const response = await fetchWithTimeout(url, options, timeout);

      // 성공!
      if (response.ok) {
        console.log(`API 요청 성공: ${url}`);
        return response;
      }

      // HTTP 에러 (404, 500, 등)
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);

    } catch (error) {
      lastError = error;
      console.error(`시도 ${attempt + 1} 실패:`, error.message);

      // 마지막 시도였으면 에러 throw
      if (attempt === maxRetries) {
        throw new Error(
          `${maxRetries + 1}번 시도 후 실패: ${error.message}\n` +
          `백엔드 서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.`
        );
      }
    }
  }

  // 이 코드에는 도달하지 않지만 타입스크립트/린트를 위해
  throw lastError;
}

/**
 * JSON 응답을 자동으로 파싱하는 fetchWithRetry wrapper
 *
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} retryOptions - Retry configuration
 * @returns {Promise<any>} Parsed JSON response
 */
export async function fetchJSONWithRetry(url, options = {}, retryOptions = {}) {
  const response = await fetchWithRetry(url, options, retryOptions);
  return await response.json();
}

export default fetchWithRetry;
