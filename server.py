#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask 백엔드 서버 - pykrx를 사용한 실시간 주식 시세 API
오프라인 지원: 데이터를 로컬 파일에 저장하여 인터넷 연결 없이도 사용 가능
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from pykrx import stock
from datetime import datetime, timedelta
import time
import json
import os
from mpt_calculator import MPTCalculator
from backtesting import PortfolioBacktester
from news_sentiment import NewsSentimentAnalyzer
from hybrid_recommender import HybridRecommender

app = Flask(__name__)
CORS(app)

# 캐시 파일 경로
CACHE_FILE = 'stock_cache.json'

# 메모리 캐시
cache = {
    'data': None,
    'timestamp': None
}

# ETF 종목명 매핑 (pykrx가 ETF 이름을 제대로 가져오지 못하는 경우 대비)
ETF_NAMES = {
    '069500': 'KODEX 200',
    '102110': 'TIGER 200',
    '091160': 'KODEX 반도체',
    '091180': 'KODEX 자동차',
    '114800': 'KODEX 인버스',
    '233740': 'KODEX 코스닥150레버리지',
    '251340': 'KODEX 코스닥150선물인버스',
}

def get_ticker_name(ticker):
    """티커 코드로 종목명 가져오기"""
    # ETF인 경우 먼저 확인
    if ticker in ETF_NAMES:
        return ETF_NAMES[ticker]

    try:
        name_result = stock.get_market_ticker_name(ticker)
        if hasattr(name_result, 'empty'):
            return ticker if name_result.empty else str(name_result)
        else:
            return str(name_result) if name_result else ticker
    except:
        return ticker

def load_cache_from_file():
    """파일에서 캐시 로드"""
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                file_cache = json.load(f)
                cache['data'] = file_cache.get('data')
                cache['timestamp'] = file_cache.get('timestamp')
                print(f'[INFO] 캐시 파일 로드 완료: {len(cache["data"])}개 종목')
                return True
    except Exception as e:
        print(f'[경고] 캐시 파일 로드 실패: {e}')
    return False

def save_cache_to_file():
    """캐시를 파일에 저장"""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'data': cache['data'],
                'timestamp': cache['timestamp'],
                'saved_at': datetime.now().isoformat()
            }, f, ensure_ascii=False, indent=2)
        print(f'[INFO] 캐시 파일 저장 완료: {len(cache["data"])}개 종목')
        return True
    except Exception as e:
        print(f'[경고] 캐시 파일 저장 실패: {e}')
    return False

# 서버 시작 시 캐시 로드
load_cache_from_file()

def get_latest_business_day():
    """최근 영업일 가져오기"""
    today = datetime.now()

    # 최근 7일 내에서 거래일 찾기
    for i in range(7):
        check_date = (today - timedelta(days=i)).strftime('%Y%m%d')
        try:
            # KOSPI 지수로 영업일 확인
            test = stock.get_market_ohlcv(check_date, check_date, "005930")
            if not test.empty:
                return check_date
        except:
            continue

    # 기본값: 오늘 날짜
    return today.strftime('%Y%m%d')

def get_stock_quote(ticker):
    """
    단일 종목 시세 데이터 가져오기 (pykrx 사용)
    """
    try:
        date = get_latest_business_day()

        # 현재가 및 기본 정보
        df = stock.get_market_ohlcv(date, date, ticker)

        if df.empty:
            print(f"[경고] {ticker}: 데이터 없음")
            return None

        # 전일 종가
        yesterday = (datetime.strptime(date, '%Y%m%d') - timedelta(days=1)).strftime('%Y%m%d')
        prev_df = stock.get_market_ohlcv(yesterday, yesterday, ticker)
        prev_close = int(prev_df['종가'].iloc[0]) if not prev_df.empty else int(df['시가'].iloc[0])

        # 종목명 (ETF는 DataFrame 반환할 수 있음)
        try:
            ticker_name_result = stock.get_market_ticker_name(ticker)
            # DataFrame인 경우 처리
            if hasattr(ticker_name_result, 'empty'):
                # DataFrame이면서 비어있으면 ticker 사용
                ticker_name = ticker if ticker_name_result.empty else str(ticker_name_result)
            else:
                ticker_name = str(ticker_name_result) if ticker_name_result else ticker
        except:
            ticker_name = ticker

        # 데이터 추출
        row = df.iloc[0]
        close_price = row['종가']
        open_price = row['시가']
        high_price = row['고가']
        low_price = row['저가']
        volume = row['거래량']

        # 등락률 계산
        change = close_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0

        # PER, PBR 가져오기 (시도) - ETF는 이 데이터가 없음
        per = None
        pbr = None
        div_yield = None
        try:
            fundamental = stock.get_market_fundamental(date, date, ticker)
            if not fundamental.empty and 'PER' in fundamental.columns:
                per_val = fundamental['PER'].iloc[0]
                # 확실하게 숫자 타입으로 변환
                try:
                    per_float = float(per_val)
                    per = per_float if per_float > 0 else None
                except:
                    per = None
            if not fundamental.empty and 'PBR' in fundamental.columns:
                pbr_val = fundamental['PBR'].iloc[0]
                try:
                    pbr_float = float(pbr_val)
                    pbr = pbr_float if pbr_float > 0 else None
                except:
                    pbr = None
            if not fundamental.empty and 'DIV' in fundamental.columns:
                div_val = fundamental['DIV'].iloc[0]
                try:
                    div_float = float(div_val)
                    div_yield = div_float if div_float > 0 else None
                except:
                    div_yield = None
        except Exception as e:
            # ETF나 특수 종목은 fundamental 데이터가 없을 수 있음
            pass

        # 시가총액 (억원)
        try:
            cap = stock.get_market_cap(date, date, ticker)
            market_cap = int(cap['시가총액'].iloc[0]) if not cap.empty else None
        except:
            market_cap = None

        # 안전하게 값 변환
        result = {
            'ticker': ticker,
            'name': ticker_name,
            'price': int(close_price),
            'previousClose': int(prev_close),
            'open': int(open_price),
            'dayHigh': int(high_price),
            'dayLow': int(low_price),
            'volume': int(volume),
            'marketCap': market_cap,
            'change': int(change),
            'changePercent': float(round(change_percent, 2)),
            'trailingPE': float(round(per, 2)) if per and per > 0 else None,
            'priceToBook': float(round(pbr, 2)) if pbr and pbr > 0 else None,
            'dividendYield': float(round(div_yield, 2)) if div_yield and div_yield > 0 else None,
            'currency': 'KRW',
            'lastUpdated': datetime.now().isoformat(),
            'dataDate': date
        }

        return result

    except Exception as e:
        import traceback
        print(f"[에러] {ticker} 데이터 가져오기 실패: {e}")
        print(traceback.format_exc())
        return None

def get_batch_stock_quotes(tickers):
    """여러 종목 시세 데이터 일괄 가져오기"""
    results = {}

    for ticker in tickers:
        print(f"[INFO] {ticker} 데이터 가져오는 중...")
        data = get_stock_quote(ticker)
        if data:
            results[ticker] = data
        time.sleep(0.1)  # API 호출 간격

    return results

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """
    GET /api/stocks?tickers=005930,035420
    여러 종목의 시세 데이터 가져오기 (캐시 지원)
    """
    try:
        tickers_param = request.args.get('tickers')
        force_refresh = request.args.get('forceRefresh', 'false').lower() == 'true'

        if not tickers_param:
            return jsonify({'error': 'tickers 파라미터가 필요합니다.'}), 400

        tickers = [t.strip() for t in tickers_param.split(',')]

        # 캐시 확인 (24시간 유효)
        now = time.time()
        one_day = 24 * 60 * 60

        if not force_refresh and cache['data'] and cache['timestamp'] and (now - cache['timestamp']) < one_day:
            print('[INFO] 캐시된 데이터 반환')
            return jsonify({
                'data': cache['data'],
                'cached': True,
                'cacheTimestamp': cache['timestamp'],
                'cacheAge': int((now - cache['timestamp']) / 3600)
            })

        print('[INFO] 새로운 데이터 가져오는 중:', tickers)

        # 새 데이터 가져오기 (오프라인 대비)
        data = None
        try:
            data = get_batch_stock_quotes(tickers)
            print(f'[INFO] 데이터 가져오기 완료: {len(data)}개 종목')
        except Exception as e:
            print(f'[경고] 데이터 가져오기 실패 (인터넷 연결 확인): {e}')
            # 오프라인이거나 API 실패 시 캐시된 데이터 사용
            if cache['data']:
                print('[INFO] 오프라인 모드: 캐시된 데이터 사용')
                return jsonify({
                    'data': cache['data'],
                    'cached': True,
                    'offline': True,
                    'cacheTimestamp': cache['timestamp'],
                    'cacheAge': int((now - cache['timestamp']) / 3600) if cache['timestamp'] else None,
                    'message': '인터넷 연결 없음. 저장된 데이터를 표시합니다.'
                })
            else:
                return jsonify({
                    'error': '데이터를 가져올 수 없습니다. 인터넷 연결을 확인하세요.',
                    'offline': True
                }), 503

        # 데이터를 성공적으로 가져온 경우
        if data and len(data) > 0:
            # 캐시 업데이트 (JSON 직렬화 확인 후)
            try:
                # JSON으로 한 번 변환해서 깨끗한 데이터만 저장
                clean_data = json.loads(json.dumps(data))
                cache['data'] = clean_data
                cache['timestamp'] = now

                # 파일에도 저장 (오프라인 대비)
                save_cache_to_file()
            except TypeError as e:
                print(f'[에러] 캐시 저장 실패: {e}')
                # 캐시는 실패해도 응답은 반환
                pass

            # 응답 반환 - JSON 직렬화 안전하게 처리
            response_data = {
                'data': json.loads(json.dumps(data)),  # JSON을 거쳐서 정제
                'cached': False,
                'offline': False,
                'cacheTimestamp': now,
                'cacheAge': 0
            }

            return jsonify(response_data)
        else:
            return jsonify({'error': '데이터를 가져오지 못했습니다.'}), 500

    except Exception as e:
        import traceback
        print(f'[에러] API 에러: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '주식 데이터를 가져오는 중 오류가 발생했습니다.', 'detail': str(e)}), 500

@app.route('/api/cache/status', methods=['GET'])
def get_cache_status():
    """캐시 상태 확인"""
    if not cache['timestamp']:
        return jsonify({
            'exists': False,
            'timestamp': None,
            'age': None
        })

    now = time.time()
    age = now - cache['timestamp']

    return jsonify({
        'exists': True,
        'timestamp': datetime.fromtimestamp(cache['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
        'age': int(age / 3600),
        'isExpired': age > (24 * 60 * 60),
        'stockCount': len(cache['data']) if cache['data'] else 0
    })

@app.route('/api/cache', methods=['DELETE'])
def clear_cache():
    """캐시 초기화"""
    cache['data'] = None
    cache['timestamp'] = None
    print('[INFO] 캐시가 초기화되었습니다.')
    return jsonify({'message': '캐시가 초기화되었습니다.'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'service': 'pykrx-stock-api'
    })

@app.route('/api/mpt/analyze', methods=['POST'])
def mpt_analyze():
    """
    POST /api/mpt/analyze
    MPT 분석 수행

    Body: {
        "tickers": ["005930", "035420", "005380"],
        "startDate": "20231101",  // Optional
        "endDate": "20241101"     // Optional
    }
    """
    try:
        data = request.get_json()

        if not data or 'tickers' not in data:
            return jsonify({'error': 'tickers 필드가 필요합니다.'}), 400

        tickers = data['tickers']
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        if len(tickers) < 2:
            return jsonify({'error': '최소 2개 이상의 종목이 필요합니다.'}), 400

        print(f'[INFO] MPT 분석 시작: {tickers}')

        # MPT 계산
        calculator = MPTCalculator(tickers, start_date, end_date)
        result = calculator.get_full_analysis()

        # 종목명 추가
        ticker_names = {ticker: get_ticker_name(ticker) for ticker in tickers}
        result['ticker_names'] = ticker_names

        print('[INFO] MPT 분석 완료')
        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': f'데이터 오류: {str(e)}'}), 400
    except Exception as e:
        import traceback
        print(f'[에러] MPT 분석 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': 'MPT 분석 중 오류가 발생했습니다.', 'detail': str(e)}), 500

@app.route('/api/mpt/optimize', methods=['POST'])
def mpt_optimize():
    """
    POST /api/mpt/optimize
    포트폴리오 최적화 (샤프 비율 최대)

    Body: {
        "tickers": ["005930", "035420", "005380"],
        "startDate": "20231101",  // Optional
        "endDate": "20241101"     // Optional
    }
    """
    try:
        data = request.get_json()

        if not data or 'tickers' not in data:
            return jsonify({'error': 'tickers 필드가 필요합니다.'}), 400

        tickers = data['tickers']
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        print(f'[INFO] 포트폴리오 최적화 시작: {tickers}')

        calculator = MPTCalculator(tickers, start_date, end_date)
        calculator.fetch_historical_data()
        result = calculator.optimize_portfolio()

        # 종목명 추가
        ticker_names = {ticker: get_ticker_name(ticker) for ticker in tickers}
        result['ticker_names'] = ticker_names
        result['tickers'] = tickers

        print('[INFO] 포트폴리오 최적화 완료')
        return jsonify(result)

    except Exception as e:
        import traceback
        print(f'[에러] 최적화 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '최적화 중 오류가 발생했습니다.', 'detail': str(e)}), 500

@app.route('/api/backtest', methods=['POST'])
def backtest_portfolio():
    """
    POST /api/backtest
    포트폴리오 백테스팅

    Body: {
        "tickers": ["005930", "035420", "005380"],
        "weights": [0.5, 0.3, 0.2],
        "initialInvestment": 10000000,  // Optional (기본: 1000만원)
        "startDate": "20231101",        // Optional (기본: 1년 전)
        "endDate": "20241101"           // Optional (기본: 오늘)
    }
    """
    try:
        data = request.get_json()

        if not data or 'tickers' not in data or 'weights' not in data:
            return jsonify({'error': 'tickers와 weights 필드가 필요합니다.'}), 400

        tickers = data['tickers']
        weights = data['weights']
        initial_investment = data.get('initialInvestment', 10000000)
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        if len(tickers) != len(weights):
            return jsonify({'error': 'tickers와 weights의 개수가 일치해야 합니다.'}), 400

        # 비중 합계 검증
        weight_sum = sum(weights)
        if abs(weight_sum - 1.0) > 0.01:
            return jsonify({'error': f'비중의 합계는 1.0이어야 합니다. (현재: {weight_sum})'}), 400

        print(f'[INFO] 백테스팅 시작: {tickers}, 비중: {weights}')

        # 백테스팅 실행
        backtester = PortfolioBacktester(
            tickers=tickers,
            weights=weights,
            initial_investment=initial_investment,
            start_date=start_date,
            end_date=end_date
        )

        result = backtester.run_full_backtest()

        # 종목명 추가
        ticker_names = {ticker: get_ticker_name(ticker) for ticker in tickers}
        result['ticker_names'] = ticker_names

        print('[INFO] 백테스팅 완료')
        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': f'데이터 오류: {str(e)}'}), 400
    except Exception as e:
        import traceback
        print(f'[에러] 백테스팅 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '백테스팅 중 오류가 발생했습니다.', 'detail': str(e)}), 500

@app.route('/api/news/sentiment', methods=['POST'])
def news_sentiment():
    """
    POST /api/news/sentiment
    뉴스 감성 분석

    Body: {
        "tickers": ["005930", "035420"],
        "maxNews": 10  // Optional (기본: 10개)
    }
    """
    try:
        data = request.get_json()

        if not data or 'tickers' not in data:
            return jsonify({'error': 'tickers 필드가 필요합니다.'}), 400

        tickers = data['tickers']
        max_news = data.get('maxNews', 10)

        if not tickers:
            return jsonify({'error': '최소 1개 이상의 종목이 필요합니다.'}), 400

        print(f'[INFO] 뉴스 감성 분석 시작: {tickers}')

        # 감성 분석
        analyzer = NewsSentimentAnalyzer()
        results = []

        for ticker in tickers:
            try:
                sentiment_result = analyzer.analyze_stock_sentiment(ticker, max_news)
                results.append(sentiment_result)
            except Exception as e:
                print(f'[경고] {ticker} 감성 분석 실패: {e}')
                # 실패한 종목도 기본 정보 포함
                results.append({
                    'ticker': ticker,
                    'stock_name': get_ticker_name(ticker),
                    'overall_sentiment': 'neutral',
                    'overall_score': 0,
                    'positive_count': 0,
                    'negative_count': 0,
                    'neutral_count': 0,
                    'total_news': 0,
                    'news': [],
                    'error': str(e)
                })

        print('[INFO] 뉴스 감성 분석 완료')
        return jsonify({'results': results})

    except Exception as e:
        import traceback
        print(f'[에러] 뉴스 감성 분석 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '뉴스 감성 분석 중 오류가 발생했습니다.', 'detail': str(e)}), 500


# ==================== 추천 시스템 API ====================

# 추천 시스템 인스턴스 (전역)
recommender = HybridRecommender()

# 전체 종목 리스트 (stockData.js와 동일)
ALL_TICKERS = [
    '005930', '000660', '055550', '105560', '033780', '086790', '316140',
    '015760', '017670', '030200', '035420', '035720', '051910', '006400',
    '028260', '207940', '068270', '096770', '000270', '005380', '012330',
    '009540', '010130', '034730', '011070', '010950', '001040', '009150',
    '004020', '010620', '069500', '102110', '091160', '091180'
]


@app.route('/api/recommendations/hybrid', methods=['POST'])
def get_hybrid_recommendations():
    """
    POST /api/recommendations/hybrid - 하이브리드 추천

    Request body:
    {
        "portfolio": ["005930", "000660"],
        "riskTolerance": "moderate",  // conservative, moderate, aggressive
        "topK": 5
    }
    """
    try:
        data = request.get_json()

        portfolio = data.get('portfolio', [])
        risk_tolerance = data.get('riskTolerance', 'moderate')
        top_k = data.get('topK', 5)

        print(f'[INFO] 하이브리드 추천 요청 - 포트폴리오: {portfolio}, 리스크: {risk_tolerance}')

        # 하이브리드 추천 실행
        recommendations = recommender.get_hybrid_recommendations(
            current_portfolio=portfolio,
            all_tickers=ALL_TICKERS,
            risk_tolerance=risk_tolerance,
            top_k=top_k
        )

        # 종목명 추가
        for rec in recommendations:
            rec['stock_name'] = get_ticker_name(rec['ticker'])

        print(f'[INFO] 하이브리드 추천 완료: {len(recommendations)}개')
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        import traceback
        print(f'[에러] 하이브리드 추천 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '추천 생성 중 오류가 발생했습니다.', 'detail': str(e)}), 500


@app.route('/api/recommendations/similar/<ticker>', methods=['GET'])
def get_similar_stocks(ticker):
    """
    GET /api/recommendations/similar/{ticker} - 유사 종목 추천

    Query params:
    - topK: 추천 개수 (default: 3)
    """
    try:
        top_k = int(request.args.get('topK', 3))

        print(f'[INFO] 유사 종목 추천 요청 - 기준: {ticker}')

        # 유사 종목 추천
        recommendations = recommender.get_similar_stocks(
            ticker=ticker,
            all_tickers=ALL_TICKERS,
            top_k=top_k
        )

        # 종목명 추가
        for rec in recommendations:
            rec['stock_name'] = get_ticker_name(rec['ticker'])

        print(f'[INFO] 유사 종목 추천 완료: {len(recommendations)}개')
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        import traceback
        print(f'[에러] 유사 종목 추천 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '유사 종목 추천 중 오류가 발생했습니다.', 'detail': str(e)}), 500


@app.route('/api/recommendations/diversify', methods=['POST'])
def get_diversification_recommendations():
    """
    POST /api/recommendations/diversify - 포트폴리오 다양화 추천

    Request body:
    {
        "portfolio": ["005930", "000660"],
        "topK": 5
    }
    """
    try:
        data = request.get_json()

        portfolio = data.get('portfolio', [])
        top_k = data.get('topK', 5)

        print(f'[INFO] 다양화 추천 요청 - 포트폴리오: {portfolio}')

        # 다양화 추천
        recommendations = recommender.get_diversification_suggestions(
            current_portfolio=portfolio,
            all_tickers=ALL_TICKERS,
            top_k=top_k
        )

        # 종목명 추가
        for rec in recommendations:
            rec['stock_name'] = get_ticker_name(rec['ticker'])

        print(f'[INFO] 다양화 추천 완료: {len(recommendations)}개')
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        import traceback
        print(f'[에러] 다양화 추천 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '다양화 추천 중 오류가 발생했습니다.', 'detail': str(e)}), 500


@app.route('/api/recommendations/popular', methods=['GET'])
def get_popular_recommendations():
    """
    GET /api/recommendations/popular - 인기 종목 추천

    Query params:
    - topK: 추천 개수 (default: 10)
    """
    try:
        top_k = int(request.args.get('topK', 10))

        print(f'[INFO] 인기 종목 추천 요청')

        # 인기 종목 추천
        recommendations = recommender.get_popular_stocks(top_k=top_k)

        # 종목명 추가
        for rec in recommendations:
            rec['stock_name'] = get_ticker_name(rec['ticker'])

        print(f'[INFO] 인기 종목 추천 완료: {len(recommendations)}개')
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        import traceback
        print(f'[에러] 인기 종목 추천 실패: {e}')
        print(traceback.format_exc())
        return jsonify({'error': '인기 종목 추천 중 오류가 발생했습니다.', 'detail': str(e)}), 500


if __name__ == '__main__':
    print('\n🚀 pykrx 주식 시세 API 서버 실행 중: http://localhost:3001')
    print('📊 주식 데이터 API: http://localhost:3001/api/stocks?tickers=005930,035420')
    print('💾 캐시 상태: http://localhost:3001/api/cache/status')
    print('📈 MPT 분석: POST http://localhost:3001/api/mpt/analyze')
    print('🔄 백테스팅: POST http://localhost:3001/api/backtest')
    print('📰 뉴스 감성: POST http://localhost:3001/api/news/sentiment')
    print('🤖 AI 추천: POST http://localhost:3001/api/recommendations/hybrid\n')

    app.run(host='0.0.0.0', port=3001, debug=True)
