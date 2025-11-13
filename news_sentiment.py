#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
뉴스 감성 분석 모듈
네이버 뉴스에서 종목 관련 뉴스를 가져와 감성 분석 수행
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
from pykrx import stock

# ETF 이름 매핑
ETF_NAMES = {
    '069500': 'KODEX 200',
    '102110': 'TIGER 200',
    '091160': 'KODEX 반도체',
    '091180': 'KODEX 자동차',
    '114800': 'KODEX 인버스',
    '233740': 'KODEX 코스닥150레버리지',
    '251340': 'KODEX 코스닥150선물인버스',
}

def get_ticker_name_safe(ticker):
    """티커 코드로 종목명 가져오기 (안전한 버전)"""
    # ETF인 경우 먼저 확인
    if ticker in ETF_NAMES:
        return ETF_NAMES[ticker]

    try:
        name_result = stock.get_market_ticker_name(ticker)
        # DataFrame이나 Series인 경우 체크
        if hasattr(name_result, 'empty') and name_result.empty:
            return ticker
        # 문자열로 변환
        name_str = str(name_result)
        # "Empty DataFrame" 같은 문자열이 포함되어 있으면 티커 반환
        if 'Empty' in name_str or 'DataFrame' in name_str:
            return ticker
        return name_str if name_str else ticker
    except:
        return ticker

class NewsSentimentAnalyzer:
    def __init__(self):
        # 긍정 키워드
        self.positive_keywords = [
            '상승', '급등', '호재', '성장', '증가', '개선', '흑자', '최고',
            '돌파', '확대', '강세', '상향', '긍정', '매수', '수혜', '선방',
            '호조', '반등', '회복', '개발', '성공', '혁신', '수주', '계약'
        ]

        # 부정 키워드
        self.negative_keywords = [
            '하락', '급락', '악재', '감소', '하향', '적자', '최저', '우려',
            '부진', '약세', '매도', '리스크', '하회', '부정', '악화', '손실',
            '침체', '부담', '위기', '하락세', '저조', '취소', '실패', '논란'
        ]

    def get_stock_news(self, ticker, max_news=10):
        """네이버 금융에서 종목 뉴스 가져오기"""
        try:
            # 종목명 가져오기 (안전한 버전 사용)
            stock_name = get_ticker_name_safe(ticker)

            # 네이버 뉴스 검색 (간단한 방법)
            # 실제로는 pykrx나 네이버 API를 사용하는 것이 좋지만,
            # 여기서는 시연용으로 간단한 구조만 만듭니다

            news_list = []

            # 네이버 금융 뉴스 URL
            url = f'https://finance.naver.com/item/news_news.naver?code={ticker}&page=1'

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            try:
                response = requests.get(url, headers=headers, timeout=5)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, 'html.parser')

                # 뉴스 리스트 파싱
                news_items = soup.select('.newsNetlistArea .articleSubject a')[:max_news]

                for item in news_items:
                    title = item.get('title', item.text.strip())
                    link = 'https://finance.naver.com' + item.get('href', '')

                    news_list.append({
                        'title': title,
                        'link': link,
                        'date': datetime.now().strftime('%Y-%m-%d')  # 간단하게 오늘 날짜
                    })

                # 크롤링된 뉴스가 없으면 더미 데이터 사용
                if len(news_list) == 0:
                    print(f'{stock_name}: 크롤링된 뉴스 없음, 더미 데이터 사용')
                    news_list = self._get_dummy_news(stock_name, ticker)

            except Exception as e:
                print(f'뉴스 크롤링 실패: {e}')
                # 크롤링 실패 시 더미 데이터
                news_list = self._get_dummy_news(stock_name, ticker)

            return news_list, stock_name

        except Exception as e:
            print(f'뉴스 가져오기 실패: {e}')
            return [], ticker

    def _get_dummy_news(self, stock_name, ticker):
        """더미 뉴스 데이터 (테스트용)"""
        return [
            {
                'title': f'{stock_name}, 신제품 출시로 실적 개선 전망',
                'link': f'https://finance.naver.com/item/main.naver?code={ticker}',
                'date': datetime.now().strftime('%Y-%m-%d')
            },
            {
                'title': f'{stock_name}, 3분기 매출 증가세 지속',
                'link': f'https://finance.naver.com/item/main.naver?code={ticker}',
                'date': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            },
            {
                'title': f'{stock_name}, 해외 시장 확대 계획 발표',
                'link': f'https://finance.naver.com/item/main.naver?code={ticker}',
                'date': (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
            }
        ]

    def analyze_sentiment(self, text):
        """텍스트 감성 분석"""
        if not text:
            return 0, 'neutral'

        text = text.lower()

        # 긍정/부정 키워드 카운트
        positive_count = sum(1 for keyword in self.positive_keywords if keyword in text)
        negative_count = sum(1 for keyword in self.negative_keywords if keyword in text)

        # 점수 계산 (-1 ~ 1)
        total = positive_count + negative_count
        if total == 0:
            return 0, 'neutral'

        score = (positive_count - negative_count) / total

        # 감성 레이블
        if score > 0.3:
            sentiment = 'positive'
        elif score < -0.3:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        return score, sentiment

    def analyze_stock_sentiment(self, ticker, max_news=10):
        """종목의 뉴스 감성 분석"""
        news_list, stock_name = self.get_stock_news(ticker, max_news)

        if not news_list:
            return {
                'ticker': ticker,
                'stock_name': stock_name,
                'overall_sentiment': 'neutral',
                'overall_score': 0,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'news': []
            }

        # 각 뉴스 감성 분석
        analyzed_news = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        total_score = 0

        for news in news_list:
            score, sentiment = self.analyze_sentiment(news['title'])

            analyzed_news.append({
                'title': news['title'],
                'link': news['link'],
                'date': news['date'],
                'sentiment': sentiment,
                'score': score
            })

            total_score += score

            if sentiment == 'positive':
                positive_count += 1
            elif sentiment == 'negative':
                negative_count += 1
            else:
                neutral_count += 1

        # 전체 감성 판단
        avg_score = total_score / len(news_list) if news_list else 0

        if avg_score > 0.2:
            overall_sentiment = 'positive'
        elif avg_score < -0.2:
            overall_sentiment = 'negative'
        else:
            overall_sentiment = 'neutral'

        return {
            'ticker': ticker,
            'stock_name': stock_name,
            'overall_sentiment': overall_sentiment,
            'overall_score': float(avg_score),
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'total_news': len(news_list),
            'news': analyzed_news
        }


def test_sentiment():
    """테스트 함수"""
    analyzer = NewsSentimentAnalyzer()

    # 삼성전자 뉴스 감성 분석
    result = analyzer.analyze_stock_sentiment('005930', max_news=5)

    print(f"\n=== {result['stock_name']} 뉴스 감성 분석 ===")
    print(f"전체 감성: {result['overall_sentiment']}")
    print(f"평균 점수: {result['overall_score']:.2f}")
    print(f"긍정: {result['positive_count']}개, 부정: {result['negative_count']}개, 중립: {result['neutral_count']}개")
    print(f"\n뉴스 목록:")
    for news in result['news']:
        print(f"  [{news['sentiment']}] {news['title']}")


if __name__ == '__main__':
    test_sentiment()
