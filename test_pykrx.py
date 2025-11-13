#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pykrx import stock
from datetime import datetime, timedelta

print("pykrx 테스트 시작...")

# 최근 영업일 찾기
today = datetime.now()
for i in range(10):
    check_date = (today - timedelta(days=i)).strftime('%Y%m%d')
    print(f"\n날짜 확인: {check_date}")

    try:
        df = stock.get_market_ohlcv(check_date, check_date, "005930")
        if not df.empty:
            print(f"✅ 영업일 발견: {check_date}")
            print(f"삼성전자 데이터:\n{df}")

            # 종목명 가져오기
            name = stock.get_market_ticker_name("005930")
            print(f"종목명: {name}")
            break
        else:
            print(f"❌ 데이터 없음")
    except Exception as e:
        print(f"❌ 에러: {e}")

print("\n테스트 완료")
