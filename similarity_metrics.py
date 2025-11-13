#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
유사도 계산 모듈
종목 간의 유사도를 다양한 방법으로 계산합니다.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances


def cosine_sim(vector1, vector2):
    """
    코사인 유사도 계산
    Returns: 0-1 사이의 값 (1에 가까울수록 유사)
    """
    vec1 = np.array(vector1).reshape(1, -1)
    vec2 = np.array(vector2).reshape(1, -1)

    similarity = cosine_similarity(vec1, vec2)[0][0]
    return float(similarity)


def euclidean_sim(vector1, vector2):
    """
    유클리디안 거리 기반 유사도
    거리를 유사도로 변환 (0-1, 1에 가까울수록 유사)
    """
    vec1 = np.array(vector1).reshape(1, -1)
    vec2 = np.array(vector2).reshape(1, -1)

    distance = euclidean_distances(vec1, vec2)[0][0]
    # 거리를 유사도로 변환 (exp decay)
    similarity = np.exp(-distance)
    return float(similarity)


def pearson_correlation(vector1, vector2):
    """
    피어슨 상관계수
    Returns: -1 ~ 1 사이의 값
    """
    vec1 = np.array(vector1)
    vec2 = np.array(vector2)

    if len(vec1) != len(vec2):
        return 0.0

    correlation = np.corrcoef(vec1, vec2)[0, 1]
    return float(correlation) if not np.isnan(correlation) else 0.0


def sector_similarity(sector1, sector2):
    """
    섹터 유사도
    같은 섹터면 1, 다르면 0
    """
    return 1.0 if sector1 == sector2 else 0.0


def type_similarity(type1, type2):
    """
    타입 유사도
    같은 타입이면 1, 다르면 0.3 (약간의 유사도는 있다고 봄)
    """
    if type1 == type2:
        return 1.0

    # 배당주와 대형주는 약간 유사
    if (type1 == 'dividend' and type2 == 'largecap') or \
       (type1 == 'largecap' and type2 == 'dividend'):
        return 0.5

    # 성장주와 중형주는 약간 유사
    if (type1 == 'growth' and type2 == 'midcap') or \
       (type1 == 'midcap' and type2 == 'growth'):
        return 0.5

    return 0.3


def risk_profile_similarity(features1, features2):
    """
    리스크 프로필 유사도
    변동성, 샤프비율, 베타 등을 비교
    """
    # 리스크 관련 특징만 추출
    risk_keys = ['volatility', 'sharpe_ratio', 'beta', 'max_drawdown']

    vec1 = [features1.get(key, 0.5) for key in risk_keys]
    vec2 = [features2.get(key, 0.5) for key in risk_keys]

    return euclidean_sim(vec1, vec2)


def fundamental_similarity(features1, features2):
    """
    기본 지표 유사도
    PER, PBR, ROE, 배당수익률 비교
    """
    fundamental_keys = ['per', 'pbr', 'roe', 'dividend_yield']

    vec1 = [features1.get(key, 0.5) for key in fundamental_keys]
    vec2 = [features2.get(key, 0.5) for key in fundamental_keys]

    return euclidean_sim(vec1, vec2)


def technical_similarity(features1, features2):
    """
    기술적 지표 유사도
    RSI, 모멘텀, 볼린저밴드 위치 등 비교
    """
    technical_keys = ['rsi', 'momentum', 'bb_position', 'price_roc']

    vec1 = [features1.get(key, 0.5) for key in technical_keys]
    vec2 = [features2.get(key, 0.5) for key in technical_keys]

    return euclidean_sim(vec1, vec2)


def correlation_based_similarity(correlation_value):
    """
    상관계수를 유사도로 변환
    Returns: 0-1 (낮은 상관관계 = 다양화에 좋음 = 낮은 유사도)
    """
    # 상관계수 -1 ~ 1을 0 ~ 1로 변환
    similarity = (correlation_value + 1) / 2
    return float(similarity)


def diversification_score(correlation_value):
    """
    다양화 점수 (상관계수의 역)
    낮은 상관관계 = 높은 다양화 점수
    Returns: 0-1
    """
    return 1.0 - correlation_based_similarity(correlation_value)


def weighted_similarity(features1, features2, weights=None):
    """
    가중치 기반 종합 유사도

    Args:
        features1, features2: 특징 딕셔너리
        weights: 가중치 딕셔너리
            {
                'sector': 0.2,
                'type': 0.15,
                'risk': 0.25,
                'fundamental': 0.2,
                'technical': 0.2
            }
    """
    if weights is None:
        weights = {
            'sector': 0.2,
            'type': 0.15,
            'risk': 0.25,
            'fundamental': 0.2,
            'technical': 0.2
        }

    # 각 카테고리별 유사도 계산
    sector_sim = sector_similarity(
        features1.get('sector', 'etf'),
        features2.get('sector', 'etf')
    )

    type_sim = type_similarity(
        features1.get('type', 'etf'),
        features2.get('type', 'etf')
    )

    risk_sim = risk_profile_similarity(features1, features2)
    fund_sim = fundamental_similarity(features1, features2)
    tech_sim = technical_similarity(features1, features2)

    # 가중 평균
    total_similarity = (
        weights['sector'] * sector_sim +
        weights['type'] * type_sim +
        weights['risk'] * risk_sim +
        weights['fundamental'] * fund_sim +
        weights['technical'] * tech_sim
    )

    return float(total_similarity)


def calculate_similarity_matrix(stocks_features, method='weighted'):
    """
    모든 종목 간의 유사도 매트릭스 계산

    Args:
        stocks_features: dict of {ticker: features_dict}
        method: 'cosine', 'euclidean', 'weighted'

    Returns:
        numpy array of shape (n_stocks, n_stocks)
    """
    tickers = list(stocks_features.keys())
    n = len(tickers)

    similarity_matrix = np.zeros((n, n))

    for i, ticker1 in enumerate(tickers):
        for j, ticker2 in enumerate(tickers):
            if i == j:
                similarity_matrix[i][j] = 1.0
            elif method == 'weighted':
                similarity_matrix[i][j] = weighted_similarity(
                    stocks_features[ticker1],
                    stocks_features[ticker2]
                )
            else:
                # 벡터 기반 방법은 특징 벡터가 필요
                pass

    return similarity_matrix


def find_most_similar(target_ticker, stocks_features, top_k=5, exclude_tickers=None):
    """
    특정 종목과 가장 유사한 종목들을 찾기

    Args:
        target_ticker: 기준 종목
        stocks_features: dict of {ticker: features}
        top_k: 상위 몇 개를 반환할지
        exclude_tickers: 제외할 종목 리스트

    Returns:
        list of (ticker, similarity_score) tuples
    """
    if target_ticker not in stocks_features:
        return []

    if exclude_tickers is None:
        exclude_tickers = []

    target_features = stocks_features[target_ticker]
    similarities = []

    for ticker, features in stocks_features.items():
        # 자기 자신과 제외 목록은 스킵
        if ticker == target_ticker or ticker in exclude_tickers:
            continue

        sim = weighted_similarity(target_features, features)
        similarities.append((ticker, sim))

    # 유사도 높은 순으로 정렬
    similarities.sort(key=lambda x: x[1], reverse=True)

    return similarities[:top_k]


def find_most_diverse(target_ticker, stocks_features, top_k=5, exclude_tickers=None):
    """
    특정 종목과 가장 다양한 (상관관계 낮은) 종목들을 찾기
    포트폴리오 다양화에 유용
    """
    if target_ticker not in stocks_features:
        return []

    if exclude_tickers is None:
        exclude_tickers = []

    target_features = stocks_features[target_ticker]
    diversities = []

    for ticker, features in stocks_features.items():
        if ticker == target_ticker or ticker in exclude_tickers:
            continue

        sim = weighted_similarity(target_features, features)
        diversity = 1.0 - sim  # 유사도의 역
        diversities.append((ticker, diversity))

    # 다양성 높은 순으로 정렬
    diversities.sort(key=lambda x: x[1], reverse=True)

    return diversities[:top_k]


def portfolio_diversity_score(portfolio_features_list):
    """
    포트폴리오 전체의 다양성 점수 계산
    모든 종목 쌍의 평균 비유사도

    Returns: 0-1 (1에 가까울수록 다양함)
    """
    n = len(portfolio_features_list)
    if n < 2:
        return 1.0

    total_diversity = 0
    count = 0

    for i in range(n):
        for j in range(i + 1, n):
            sim = weighted_similarity(
                portfolio_features_list[i],
                portfolio_features_list[j]
            )
            diversity = 1.0 - sim
            total_diversity += diversity
            count += 1

    avg_diversity = total_diversity / count if count > 0 else 1.0
    return float(avg_diversity)


def test_similarity():
    """테스트 함수"""
    print("=== 유사도 계산 테스트 ===\n")

    # 샘플 특징
    samsung = {
        'sector': 'tech',
        'type': 'dividend',
        'volatility': 0.25,
        'sharpe_ratio': 0.8,
        'beta': 1.1,
        'per': 12.5,
        'roe': 8.2,
        'dividend_yield': 2.5,
        'rsi': 55,
        'momentum': 1.05
    }

    sk_hynix = {
        'sector': 'tech',
        'type': 'dividend',
        'volatility': 0.30,
        'sharpe_ratio': 0.7,
        'beta': 1.3,
        'per': 15.3,
        'roe': 7.5,
        'dividend_yield': 1.8,
        'rsi': 58,
        'momentum': 1.08
    }

    kb_finance = {
        'sector': 'finance',
        'type': 'dividend',
        'volatility': 0.20,
        'sharpe_ratio': 0.9,
        'beta': 0.9,
        'per': 6.2,
        'roe': 10.3,
        'dividend_yield': 4.8,
        'rsi': 48,
        'momentum': 0.98
    }

    # 유사도 계산
    print("삼성전자 vs SK하이닉스 (같은 섹터, 같은 타입)")
    sim1 = weighted_similarity(samsung, sk_hynix)
    print(f"  종합 유사도: {sim1:.3f}")
    print(f"  섹터 유사도: {sector_similarity(samsung['sector'], sk_hynix['sector']):.3f}")
    print(f"  리스크 유사도: {risk_profile_similarity(samsung, sk_hynix):.3f}")

    print("\n삼성전자 vs KB금융 (다른 섹터, 같은 타입)")
    sim2 = weighted_similarity(samsung, kb_finance)
    print(f"  종합 유사도: {sim2:.3f}")
    print(f"  섹터 유사도: {sector_similarity(samsung['sector'], kb_finance['sector']):.3f}")
    print(f"  리스크 유사도: {risk_profile_similarity(samsung, kb_finance):.3f}")

    # 다양화 점수
    portfolio = [samsung, sk_hynix, kb_finance]
    diversity = portfolio_diversity_score(portfolio)
    print(f"\n포트폴리오 다양성 점수: {diversity:.3f}")


if __name__ == '__main__':
    test_similarity()
