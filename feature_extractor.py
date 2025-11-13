#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
특징 추출 모듈
종목의 다양한 특징을 추출하여 벡터화합니다.
"""

import numpy as np
from pykrx import stock
from datetime import datetime, timedelta
import technical_indicators as ti


# 섹터 매핑 (stockData.js와 동일)
SECTORS = {
    'tech': 0,
    'finance': 1,
    'consumer': 2,
    'healthcare': 3,
    'energy': 4,
    'materials': 5,
    'industrial': 6,
    'telecom': 7,
    'etf': 8
}

# 종목 타입 매핑
STOCK_TYPES = {
    'dividend': 0,
    'growth': 1,
    'largecap': 2,
    'midcap': 3,
    'etf': 4
}


class FeatureExtractor:
    def __init__(self):
        # stockData.js의 메타데이터를 Python dict로 저장
        self.stock_metadata = self._load_stock_metadata()

    def _load_stock_metadata(self):
        """
        stockData.js의 메타데이터를 Python dict로 변환
        실제 환경에서는 JSON 파일로 공유하거나 DB에서 가져오기
        """
        return {
            '005930': {'sector': 'tech', 'type': 'dividend', 'dividendYield': 2.5, 'per': 12.5, 'roe': 8.2},
            '000660': {'sector': 'tech', 'type': 'dividend', 'dividendYield': 1.8, 'per': 15.3, 'roe': 7.5},
            '055550': {'sector': 'finance', 'type': 'dividend', 'dividendYield': 4.2, 'per': 5.8, 'roe': 9.1},
            '105560': {'sector': 'finance', 'type': 'dividend', 'dividendYield': 4.8, 'per': 6.2, 'roe': 10.3},
            '033780': {'sector': 'consumer', 'type': 'dividend', 'dividendYield': 5.1, 'per': 9.2, 'roe': 12.5},
            '086790': {'sector': 'finance', 'type': 'dividend', 'dividendYield': 4.5, 'per': 5.5, 'roe': 9.8},
            '316140': {'sector': 'finance', 'type': 'dividend', 'dividendYield': 4.3, 'per': 5.2, 'roe': 8.9},
            '015760': {'sector': 'energy', 'type': 'dividend', 'dividendYield': 3.2, 'per': 8.1, 'roe': 5.5},
            '017670': {'sector': 'telecom', 'type': 'dividend', 'dividendYield': 4.8, 'per': 7.8, 'roe': 11.2},
            '030200': {'sector': 'telecom', 'type': 'dividend', 'dividendYield': 5.2, 'per': 6.9, 'roe': 10.5},
            '035420': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.3, 'per': 28.5, 'roe': 15.2},
            '035720': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.4, 'per': 32.1, 'roe': 18.5},
            '051910': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.2, 'per': 45.8, 'roe': 22.3},
            '006400': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.5, 'per': 25.3, 'roe': 12.8},
            '028260': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.1, 'per': 52.5, 'roe': 28.5},
            '207940': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.3, 'per': 38.2, 'roe': 19.5},
            '068270': {'sector': 'consumer', 'type': 'growth', 'dividendYield': 0.8, 'per': 22.5, 'roe': 14.2},
            '096770': {'sector': 'tech', 'type': 'growth', 'dividendYield': 0.2, 'per': 42.8, 'roe': 20.1},
            '000270': {'sector': 'industrial', 'type': 'largecap', 'dividendYield': 2.8, 'per': 10.5, 'roe': 7.8},
            '005380': {'sector': 'industrial', 'type': 'largecap', 'dividendYield': 3.1, 'per': 9.8, 'roe': 8.5},
            '012330': {'sector': 'industrial', 'type': 'largecap', 'dividendYield': 3.5, 'per': 8.2, 'roe': 9.2},
            '009540': {'sector': 'materials', 'type': 'largecap', 'dividendYield': 2.5, 'per': 11.2, 'roe': 6.8},
            '010130': {'sector': 'materials', 'type': 'largecap', 'dividendYield': 2.8, 'per': 9.5, 'roe': 7.5},
            '034730': {'sector': 'materials', 'type': 'largecap', 'dividendYield': 3.2, 'per': 8.8, 'roe': 8.2},
            '011070': {'sector': 'energy', 'type': 'largecap', 'dividendYield': 4.2, 'per': 7.5, 'roe': 9.5},
            '010950': {'sector': 'materials', 'type': 'largecap', 'dividendYield': 2.9, 'per': 10.2, 'roe': 7.2},
            '001040': {'sector': 'materials', 'type': 'midcap', 'dividendYield': 2.2, 'per': 12.5, 'roe': 8.5},
            '009150': {'sector': 'finance', 'type': 'midcap', 'dividendYield': 3.8, 'per': 6.8, 'roe': 9.5},
            '004020': {'sector': 'industrial', 'type': 'midcap', 'dividendYield': 2.5, 'per': 11.2, 'roe': 7.8},
            '010620': {'sector': 'materials', 'type': 'midcap', 'dividendYield': 2.8, 'per': 10.5, 'roe': 8.2},
            '069500': {'sector': 'etf', 'type': 'etf', 'dividendYield': 1.8, 'per': None, 'roe': None},
            '102110': {'sector': 'etf', 'type': 'etf', 'dividendYield': 1.7, 'per': None, 'roe': None},
            '091160': {'sector': 'etf', 'type': 'etf', 'dividendYield': 0.5, 'per': None, 'roe': None},
            '091180': {'sector': 'etf', 'type': 'etf', 'dividendYield': 1.2, 'per': None, 'roe': None},
        }

    def get_historical_data(self, ticker, days=252):
        """과거 가격 데이터 가져오기"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days + 50)  # 여유있게

            df = stock.get_market_ohlcv_by_date(
                start_date.strftime('%Y%m%d'),
                end_date.strftime('%Y%m%d'),
                ticker
            )

            if df is None or df.empty:
                return None

            # 최근 N일만 추출
            df = df.tail(days)
            return df
        except Exception as e:
            print(f'[경고] {ticker} 과거 데이터 가져오기 실패: {e}')
            return None

    def extract_fundamental_features(self, ticker, stock_data=None):
        """기본 정보 특징 추출"""
        meta = self.stock_metadata.get(ticker, {})

        features = {
            # 섹터 (원-핫 인코딩)
            'sector_code': SECTORS.get(meta.get('sector', 'etf'), 8),
            'sector': meta.get('sector', 'etf'),

            # 타입 (원-핫 인코딩)
            'type_code': STOCK_TYPES.get(meta.get('type', 'etf'), 4),
            'type': meta.get('type', 'etf'),

            # 기본 지표 (0으로 처리 가능하도록)
            'dividend_yield': meta.get('dividendYield', 0.0),
            'per': meta.get('per', 15.0) if meta.get('per') else 15.0,  # None이면 기본값
            'roe': meta.get('roe', 8.0) if meta.get('roe') else 8.0,
        }

        # 실시간 데이터가 있으면 추가
        if stock_data:
            features['market_cap'] = stock_data.get('marketCap', 0)
            features['price'] = stock_data.get('price', 0)
            features['change_percent'] = stock_data.get('changePercent', 0)
            features['volume'] = stock_data.get('volume', 0)
            features['pbr'] = stock_data.get('priceToBook', 1.0)
        else:
            features['market_cap'] = 0
            features['price'] = 0
            features['change_percent'] = 0
            features['volume'] = 0
            features['pbr'] = 1.0

        return features

    def extract_risk_features(self, ticker, historical_df=None):
        """리스크 지표 특징 추출"""
        if historical_df is None or historical_df.empty:
            return {
                'volatility': 0.2,  # 기본값 20%
                'sharpe_ratio': 0.5,
                'max_drawdown': -0.15,
                'beta': 1.0,
                'returns_mean': 0.0,
                'returns_std': 0.2
            }

        try:
            # 수익률 계산
            prices = historical_df['종가'].values
            returns = np.diff(prices) / prices[:-1]

            # 연율화 지표
            volatility = np.std(returns) * np.sqrt(252)
            mean_return = np.mean(returns) * 252

            # 샤프 비율 (무위험 수익률 3% 가정)
            risk_free_rate = 0.03
            sharpe = (mean_return - risk_free_rate) / volatility if volatility > 0 else 0

            # 최대 낙폭 (MDD)
            cumulative = np.cumprod(1 + returns)
            running_max = np.maximum.accumulate(cumulative)
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = np.min(drawdown)

            # 베타 (시장 대비 - KOSPI 200 ETF와의 상관관계로 근사)
            # 간단히 변동성 비율로 근사
            beta = volatility / 0.20  # 시장 변동성 20% 가정

            return {
                'volatility': float(volatility),
                'sharpe_ratio': float(sharpe),
                'max_drawdown': float(max_drawdown),
                'beta': float(beta),
                'returns_mean': float(mean_return),
                'returns_std': float(volatility)
            }
        except Exception as e:
            print(f'[경고] {ticker} 리스크 지표 계산 실패: {e}')
            return {
                'volatility': 0.2,
                'sharpe_ratio': 0.5,
                'max_drawdown': -0.15,
                'beta': 1.0,
                'returns_mean': 0.0,
                'returns_std': 0.2
            }

    def extract_technical_features(self, ticker, historical_df=None):
        """기술적 지표 특징 추출"""
        if historical_df is None or historical_df.empty:
            return {
                'rsi': 50.0,
                'sma_20': 0,
                'sma_60': 0,
                'momentum': 1.0,
                'bb_position': 0.5,
                'macd': 0.0,
                'price_roc': 0.0
            }

        try:
            prices = historical_df['종가'].tolist()
            indicators = ti.get_all_technical_indicators(prices)

            return {
                'rsi': indicators.get('rsi_14', 50.0),
                'sma_20': indicators.get('sma_20', 0),
                'sma_60': indicators.get('sma_60', 0),
                'momentum': indicators.get('momentum_10', 1.0),
                'bb_position': indicators.get('bb_position', 0.5),
                'macd': indicators.get('macd', 0.0),
                'price_roc': indicators.get('price_roc_10', 0.0)
            }
        except Exception as e:
            print(f'[경고] {ticker} 기술적 지표 계산 실패: {e}')
            return {
                'rsi': 50.0,
                'sma_20': 0,
                'sma_60': 0,
                'momentum': 1.0,
                'bb_position': 0.5,
                'macd': 0.0,
                'price_roc': 0.0
            }

    def extract_all_features(self, ticker, stock_data=None, sentiment_score=None):
        """모든 특징을 한 번에 추출"""
        # 과거 데이터 가져오기
        historical_df = self.get_historical_data(ticker)

        # 각 카테고리별 특징 추출
        fundamental = self.extract_fundamental_features(ticker, stock_data)
        risk = self.extract_risk_features(ticker, historical_df)
        technical = self.extract_technical_features(ticker, historical_df)

        # 통합
        features = {
            **fundamental,
            **risk,
            **technical
        }

        # 뉴스 감성 점수 추가
        if sentiment_score is not None:
            features['sentiment_score'] = sentiment_score
        else:
            features['sentiment_score'] = 0.0

        return features

    def normalize_features(self, features):
        """특징 정규화 (0-1 스케일)"""
        normalized = features.copy()

        # 정규화 범위 정의
        normalization_ranges = {
            'dividend_yield': (0, 6),  # 0-6%
            'per': (0, 60),  # 0-60
            'roe': (0, 30),  # 0-30%
            'pbr': (0, 5),  # 0-5
            'volatility': (0, 0.5),  # 0-50%
            'sharpe_ratio': (-1, 3),  # -1 ~ 3
            'max_drawdown': (-0.5, 0),  # -50% ~ 0%
            'beta': (0, 2),  # 0-2
            'returns_mean': (-0.3, 0.3),  # -30% ~ 30%
            'rsi': (0, 100),  # 0-100
            'momentum': (0.7, 1.3),  # 0.7-1.3
            'bb_position': (0, 1),  # 0-1
            'price_roc': (-20, 20),  # -20% ~ 20%
            'sentiment_score': (-1, 1),  # -1 ~ 1
        }

        for key, (min_val, max_val) in normalization_ranges.items():
            if key in features:
                value = features[key]
                # min-max 정규화
                normalized[key + '_norm'] = np.clip(
                    (value - min_val) / (max_val - min_val) if max_val != min_val else 0.5,
                    0, 1
                )

        return normalized

    def features_to_vector(self, features, include_categorical=False):
        """특징 딕셔너리를 벡터로 변환"""
        normalized = self.normalize_features(features)

        # 수치형 특징만 추출
        vector_features = [
            normalized.get('dividend_yield_norm', 0.5),
            normalized.get('per_norm', 0.5),
            normalized.get('roe_norm', 0.5),
            normalized.get('pbr_norm', 0.5),
            normalized.get('volatility_norm', 0.5),
            normalized.get('sharpe_ratio_norm', 0.5),
            normalized.get('max_drawdown_norm', 0.5),
            normalized.get('beta_norm', 0.5),
            normalized.get('returns_mean_norm', 0.5),
            normalized.get('rsi_norm', 0.5),
            normalized.get('momentum_norm', 0.5),
            normalized.get('bb_position_norm', 0.5),
            normalized.get('price_roc_norm', 0.5),
            normalized.get('sentiment_score_norm', 0.5),
        ]

        # 카테고리 특징 (원-핫 인코딩)
        if include_categorical:
            # 섹터 (9개)
            sector_vector = [0] * 9
            sector_code = features.get('sector_code', 8)
            if 0 <= sector_code < 9:
                sector_vector[sector_code] = 1

            # 타입 (5개)
            type_vector = [0] * 5
            type_code = features.get('type_code', 4)
            if 0 <= type_code < 5:
                type_vector[type_code] = 1

            vector_features.extend(sector_vector)
            vector_features.extend(type_vector)

        return np.array(vector_features)


def test_feature_extraction():
    """테스트 함수"""
    extractor = FeatureExtractor()

    print("=== 특징 추출 테스트 ===\n")

    # 삼성전자 테스트
    ticker = '005930'
    print(f"[{ticker}] 특징 추출 중...")

    features = extractor.extract_all_features(ticker)

    print(f"\n기본 정보:")
    print(f"  섹터: {features['sector']}")
    print(f"  타입: {features['type']}")
    print(f"  배당수익률: {features['dividend_yield']:.2f}%")
    print(f"  PER: {features['per']:.1f}")
    print(f"  ROE: {features['roe']:.1f}%")

    print(f"\n리스크 지표:")
    print(f"  변동성: {features['volatility']*100:.2f}%")
    print(f"  샤프비율: {features['sharpe_ratio']:.2f}")
    print(f"  최대낙폭: {features['max_drawdown']*100:.2f}%")
    print(f"  베타: {features['beta']:.2f}")

    print(f"\n기술적 지표:")
    print(f"  RSI: {features['rsi']:.1f}")
    print(f"  모멘텀: {features['momentum']:.3f}")
    print(f"  볼린저밴드 위치: {features['bb_position']:.2f}")

    print(f"\n특징 벡터 생성...")
    vector = extractor.features_to_vector(features, include_categorical=True)
    print(f"  벡터 차원: {len(vector)}")
    print(f"  벡터 샘플 (처음 5개): {vector[:5]}")


if __name__ == '__main__':
    test_feature_extraction()
