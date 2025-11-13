#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기술적 지표 계산 모듈
RSI, 이동평균, 모멘텀 등의 기술적 분석 지표를 계산합니다.
"""

import pandas as pd
import numpy as np


def calculate_sma(prices, period=20):
    """단순 이동평균 (Simple Moving Average)"""
    if len(prices) < period:
        return None
    return np.mean(prices[-period:])


def calculate_ema(prices, period=20):
    """지수 이동평균 (Exponential Moving Average)"""
    if len(prices) < period:
        return None

    df = pd.DataFrame({'price': prices})
    ema = df['price'].ewm(span=period, adjust=False).mean()
    return float(ema.iloc[-1])


def calculate_rsi(prices, period=14):
    """
    RSI (Relative Strength Index) 계산
    0-100 사이의 값, 70 이상 과매수, 30 이하 과매도
    """
    if len(prices) < period + 1:
        return 50  # 데이터 부족 시 중립값 반환

    # 가격 변화 계산
    deltas = np.diff(prices)

    # 상승/하락 분리
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)

    # 평균 상승/하락 계산
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])

    if avg_loss == 0:
        return 100

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return float(rsi)


def calculate_momentum(prices, period=10):
    """
    모멘텀 계산
    현재 가격 / N일 전 가격의 비율
    1보다 크면 상승 추세, 작으면 하락 추세
    """
    if len(prices) < period + 1:
        return 1.0

    momentum = prices[-1] / prices[-period-1]
    return float(momentum)


def calculate_volatility(returns, period=20):
    """
    변동성 계산 (표준편차)
    연율화된 변동성 반환
    """
    if len(returns) < period:
        return None

    recent_returns = returns[-period:]
    volatility = np.std(recent_returns) * np.sqrt(252)  # 연율화
    return float(volatility)


def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """
    볼린저 밴드 계산
    Returns: (upper_band, middle_band, lower_band)
    """
    if len(prices) < period:
        return None, None, None

    middle_band = calculate_sma(prices, period)
    std = np.std(prices[-period:])

    upper_band = middle_band + (std_dev * std)
    lower_band = middle_band - (std_dev * std)

    return float(upper_band), float(middle_band), float(lower_band)


def calculate_macd(prices, fast=12, slow=26, signal=9):
    """
    MACD (Moving Average Convergence Divergence) 계산
    Returns: (macd_line, signal_line, histogram)
    """
    if len(prices) < slow + signal:
        return None, None, None

    # EMA 계산
    df = pd.DataFrame({'price': prices})
    ema_fast = df['price'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['price'].ewm(span=slow, adjust=False).mean()

    # MACD 라인
    macd_line = ema_fast - ema_slow

    # 시그널 라인
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()

    # 히스토그램
    histogram = macd_line - signal_line

    return (
        float(macd_line.iloc[-1]),
        float(signal_line.iloc[-1]),
        float(histogram.iloc[-1])
    )


def calculate_price_rate_of_change(prices, period=10):
    """
    가격 변화율 (Price Rate of Change)
    (현재 가격 - N일 전 가격) / N일 전 가격 * 100
    """
    if len(prices) < period + 1:
        return 0.0

    roc = ((prices[-1] - prices[-period-1]) / prices[-period-1]) * 100
    return float(roc)


def get_all_technical_indicators(price_data):
    """
    모든 기술적 지표를 한 번에 계산

    Args:
        price_data: list of prices (oldest to newest)

    Returns:
        dict with all indicators
    """
    prices = np.array(price_data)

    # 수익률 계산
    returns = np.diff(prices) / prices[:-1]

    indicators = {
        'sma_20': calculate_sma(prices, 20),
        'sma_60': calculate_sma(prices, 60),
        'ema_20': calculate_ema(prices, 20),
        'rsi_14': calculate_rsi(prices, 14),
        'momentum_10': calculate_momentum(prices, 10),
        'volatility_20': calculate_volatility(returns, 20),
        'price_roc_10': calculate_price_rate_of_change(prices, 10),
    }

    # 볼린저 밴드
    bb_upper, bb_middle, bb_lower = calculate_bollinger_bands(prices, 20)
    indicators['bollinger_upper'] = bb_upper
    indicators['bollinger_middle'] = bb_middle
    indicators['bollinger_lower'] = bb_lower

    # MACD
    macd, signal, histogram = calculate_macd(prices)
    indicators['macd'] = macd
    indicators['macd_signal'] = signal
    indicators['macd_histogram'] = histogram

    # 현재 가격의 볼린저 밴드 내 위치 (0-1, 0.5가 중간)
    if bb_upper and bb_lower and bb_upper != bb_lower:
        indicators['bb_position'] = (prices[-1] - bb_lower) / (bb_upper - bb_lower)
    else:
        indicators['bb_position'] = 0.5

    return indicators


def test_indicators():
    """테스트 함수"""
    # 테스트용 가격 데이터 (100일치)
    np.random.seed(42)
    base_price = 50000
    price_changes = np.random.normal(0.001, 0.02, 100)  # 평균 0.1%, 표준편차 2%
    prices = base_price * np.cumprod(1 + price_changes)

    print("=== 기술적 지표 테스트 ===\n")

    indicators = get_all_technical_indicators(prices.tolist())

    print(f"현재 가격: {prices[-1]:,.0f}원")
    print(f"\n이동평균:")
    print(f"  SMA(20): {indicators['sma_20']:,.0f}원")
    print(f"  SMA(60): {indicators['sma_60']:,.0f}원")
    print(f"  EMA(20): {indicators['ema_20']:,.0f}원")

    print(f"\n모멘텀 지표:")
    print(f"  RSI(14): {indicators['rsi_14']:.1f}")
    print(f"  Momentum(10): {indicators['momentum_10']:.4f}")
    print(f"  ROC(10): {indicators['price_roc_10']:.2f}%")

    print(f"\n변동성:")
    print(f"  Volatility(20): {indicators['volatility_20']*100:.2f}%")

    print(f"\n볼린저 밴드:")
    print(f"  Upper: {indicators['bollinger_upper']:,.0f}원")
    print(f"  Middle: {indicators['bollinger_middle']:,.0f}원")
    print(f"  Lower: {indicators['bollinger_lower']:,.0f}원")
    print(f"  Position: {indicators['bb_position']:.2f} (0=하단, 0.5=중간, 1=상단)")

    print(f"\nMACD:")
    print(f"  MACD: {indicators['macd']:.2f}")
    print(f"  Signal: {indicators['macd_signal']:.2f}")
    print(f"  Histogram: {indicators['macd_histogram']:.2f}")


if __name__ == '__main__':
    test_indicators()
