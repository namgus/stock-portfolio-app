#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
뉴스 감성 분석 API 테스트
"""

from news_sentiment import NewsSentimentAnalyzer

# 테스트할 티커 목록
tickers = ['005930', '005380', '035420', '035720', '207940', '069500']

print('=== 뉴스 감성 분석 테스트 ===')
print(f'티커: {tickers}\n')

try:
    analyzer = NewsSentimentAnalyzer()

    for ticker in tickers:
        print(f'\n[{ticker}] 분석 중...')
        try:
            result = analyzer.analyze_stock_sentiment(ticker, max_news=3)
            print(f'  종목명: {result["stock_name"]}')
            print(f'  전체 감성: {result["overall_sentiment"]}')
            print(f'  감성 점수: {result["overall_score"]:.2f}')
            print(f'  뉴스 개수: {result["total_news"]}')
        except Exception as e:
            print(f'  에러 발생: {e}')
            import traceback
            traceback.print_exc()

except Exception as e:
    print(f'\n전체 에러: {e}')
    import traceback
    traceback.print_exc()
