#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Content-Based 추천 엔진
종목의 특징 기반으로 유사한 종목을 추천합니다.
"""

from feature_extractor import FeatureExtractor
import similarity_metrics as sim


class ContentBasedRecommender:
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.stocks_features_cache = {}

    def get_stock_features(self, ticker, stock_data=None, sentiment_score=None):
        """종목의 특징 추출 (캐싱)"""
        cache_key = ticker
        if cache_key in self.stocks_features_cache:
            return self.stocks_features_cache[cache_key]

        features = self.feature_extractor.extract_all_features(
            ticker, stock_data, sentiment_score
        )
        self.stocks_features_cache[cache_key] = features
        return features

    def recommend_similar_stocks(self, ticker, all_tickers, top_k=5, exclude_tickers=None):
        """
        특정 종목과 유사한 종목 추천

        Args:
            ticker: 기준 종목
            all_tickers: 후보 종목 리스트
            top_k: 추천할 종목 개수
            exclude_tickers: 제외할 종목 리스트 (현재 포트폴리오 등)

        Returns:
            list of {
                'ticker': str,
                'similarity': float,
                'reason': str,
                'features': dict
            }
        """
        if exclude_tickers is None:
            exclude_tickers = []

        # 기준 종목 특징 추출
        target_features = self.get_stock_features(ticker)

        # 모든 후보 종목의 특징 추출
        candidates = []
        for candidate_ticker in all_tickers:
            if candidate_ticker == ticker or candidate_ticker in exclude_tickers:
                continue

            try:
                candidate_features = self.get_stock_features(candidate_ticker)

                # 유사도 계산
                similarity = sim.weighted_similarity(target_features, candidate_features)

                candidates.append({
                    'ticker': candidate_ticker,
                    'similarity': similarity,
                    'features': candidate_features
                })
            except Exception as e:
                print(f'[경고] {candidate_ticker} 추천 생성 실패: {e}')
                continue

        # 유사도 높은 순으로 정렬
        candidates.sort(key=lambda x: x['similarity'], reverse=True)

        # 상위 K개 선택
        recommendations = candidates[:top_k]

        # 추천 이유 생성
        for rec in recommendations:
            rec['reason'] = self._generate_similarity_reason(
                target_features,
                rec['features'],
                rec['similarity']
            )

        return recommendations

    def recommend_diverse_stocks(self, portfolio_tickers, all_tickers, top_k=5):
        """
        현재 포트폴리오와 다양한 (상관관계 낮은) 종목 추천

        Args:
            portfolio_tickers: 현재 포트폴리오 종목 리스트
            all_tickers: 후보 종목 리스트
            top_k: 추천할 종목 개수
        """
        if not portfolio_tickers:
            return []

        # 포트폴리오 종목들의 특징 추출
        portfolio_features = []
        for ticker in portfolio_tickers:
            try:
                features = self.get_stock_features(ticker)
                portfolio_features.append(features)
            except:
                continue

        if not portfolio_features:
            return []

        # 후보 종목 평가
        candidates = []
        for candidate_ticker in all_tickers:
            if candidate_ticker in portfolio_tickers:
                continue

            try:
                candidate_features = self.get_stock_features(candidate_ticker)

                # 포트폴리오 각 종목과의 비유사도 계산
                diversities = []
                for pf_features in portfolio_features:
                    similarity = sim.weighted_similarity(pf_features, candidate_features)
                    diversity = 1.0 - similarity
                    diversities.append(diversity)

                # 평균 다양성
                avg_diversity = sum(diversities) / len(diversities)

                candidates.append({
                    'ticker': candidate_ticker,
                    'diversity': avg_diversity,
                    'features': candidate_features
                })
            except Exception as e:
                print(f'[경고] {candidate_ticker} 다양화 추천 실패: {e}')
                continue

        # 다양성 높은 순으로 정렬
        candidates.sort(key=lambda x: x['diversity'], reverse=True)

        # 상위 K개 선택
        recommendations = candidates[:top_k]

        # 추천 이유 생성
        for rec in recommendations:
            rec['reason'] = self._generate_diversity_reason(
                rec['features'],
                rec['diversity']
            )

        return recommendations

    def recommend_by_risk_profile(self, risk_tolerance, all_tickers, top_k=10):
        """
        리스크 성향에 맞는 종목 추천

        Args:
            risk_tolerance: 'conservative', 'moderate', 'aggressive'
            all_tickers: 후보 종목 리스트
            top_k: 추천할 종목 개수
        """
        # 리스크 성향별 기준
        risk_profiles = {
            'conservative': {
                'volatility_max': 0.25,
                'sharpe_min': 0.5,
                'dividend_min': 2.0,
                'preferred_types': ['dividend', 'largecap']
            },
            'moderate': {
                'volatility_max': 0.35,
                'sharpe_min': 0.3,
                'dividend_min': 0.5,
                'preferred_types': ['dividend', 'largecap', 'growth']
            },
            'aggressive': {
                'volatility_max': 0.50,
                'sharpe_min': 0.0,
                'dividend_min': 0.0,
                'preferred_types': ['growth', 'midcap']
            }
        }

        profile = risk_profiles.get(risk_tolerance, risk_profiles['moderate'])

        # 후보 종목 필터링 및 평가
        candidates = []
        for ticker in all_tickers:
            try:
                features = self.get_stock_features(ticker)

                # 리스크 기준 체크
                if features['volatility'] > profile['volatility_max']:
                    continue

                if features['sharpe_ratio'] < profile['sharpe_min']:
                    continue

                if features['dividend_yield'] < profile['dividend_min']:
                    continue

                # 타입 선호도 체크
                if features['type'] not in profile['preferred_types']:
                    continue

                # 점수 계산 (리스크 조정 수익률)
                score = features['sharpe_ratio'] * 0.4 + \
                        features['dividend_yield'] * 0.3 + \
                        (1.0 - features['volatility']) * 0.3

                candidates.append({
                    'ticker': ticker,
                    'score': score,
                    'features': features
                })
            except Exception as e:
                print(f'[경고] {ticker} 리스크 프로필 추천 실패: {e}')
                continue

        # 점수 높은 순으로 정렬
        candidates.sort(key=lambda x: x['score'], reverse=True)

        # 상위 K개 선택
        recommendations = candidates[:top_k]

        # 추천 이유 생성
        for rec in recommendations:
            rec['reason'] = self._generate_risk_profile_reason(
                rec['features'],
                risk_tolerance
            )

        return recommendations

    def _generate_similarity_reason(self, target_features, candidate_features, similarity):
        """유사 종목 추천 이유 생성"""
        reasons = []

        # 섹터 유사도
        if target_features['sector'] == candidate_features['sector']:
            reasons.append(f"동일 섹터({target_features['sector']})")

        # 타입 유사도
        if target_features['type'] == candidate_features['type']:
            reasons.append(f"동일 유형({target_features['type']})")

        # 리스크 유사도
        vol_diff = abs(target_features['volatility'] - candidate_features['volatility'])
        if vol_diff < 0.05:
            reasons.append(f"유사한 변동성({candidate_features['volatility']*100:.1f}%)")

        # 배당수익률 유사도
        div_diff = abs(target_features['dividend_yield'] - candidate_features['dividend_yield'])
        if div_diff < 1.0:
            reasons.append(f"유사한 배당수익률({candidate_features['dividend_yield']:.1f}%)")

        if not reasons:
            reasons.append(f"전반적인 특징이 유사 (유사도: {similarity:.2f})")

        return ", ".join(reasons)

    def _generate_diversity_reason(self, features, diversity):
        """다양화 추천 이유 생성"""
        reasons = []

        reasons.append(f"포트폴리오 다양화에 효과적")

        # 섹터가 다르면
        reasons.append(f"{features['sector']} 섹터로 분산")

        # 변동성
        if features['volatility'] < 0.25:
            reasons.append("낮은 변동성")
        elif features['volatility'] > 0.35:
            reasons.append("높은 성장 가능성")

        return ", ".join(reasons)

    def _generate_risk_profile_reason(self, features, risk_tolerance):
        """리스크 프로필 추천 이유 생성"""
        reasons = []

        if risk_tolerance == 'conservative':
            reasons.append(f"안정적인 {features['type']} 종목")
            if features['dividend_yield'] > 3:
                reasons.append(f"높은 배당수익률 {features['dividend_yield']:.1f}%")
            reasons.append(f"낮은 변동성 {features['volatility']*100:.1f}%")
        elif risk_tolerance == 'moderate':
            reasons.append(f"중립적 리스크의 {features['type']} 종목")
            reasons.append(f"샤프비율 {features['sharpe_ratio']:.2f}")
        else:  # aggressive
            reasons.append(f"고성장 가능성의 {features['type']} 종목")
            if features['roe'] > 15:
                reasons.append(f"높은 ROE {features['roe']:.1f}%")

        return ", ".join(reasons)


def test_content_recommender():
    """테스트 함수"""
    print("=== Content-Based 추천 테스트 ===\n")

    recommender = ContentBasedRecommender()

    # 테스트용 종목 리스트
    test_tickers = ['005930', '000660', '055550', '105560', '035420', '035720', '051910']

    print("[테스트 1] 삼성전자와 유사한 종목 추천")
    similar = recommender.recommend_similar_stocks(
        '005930',
        test_tickers,
        top_k=3
    )
    for i, rec in enumerate(similar, 1):
        print(f"  {i}. {rec['ticker']}")
        print(f"     유사도: {rec['similarity']:.3f}")
        print(f"     이유: {rec['reason']}")

    print("\n[테스트 2] 포트폴리오 다양화 추천")
    portfolio = ['005930', '000660']  # 삼성전자, SK하이닉스
    diverse = recommender.recommend_diverse_stocks(
        portfolio,
        test_tickers,
        top_k=3
    )
    for i, rec in enumerate(diverse, 1):
        print(f"  {i}. {rec['ticker']}")
        print(f"     다양성: {rec['diversity']:.3f}")
        print(f"     이유: {rec['reason']}")

    print("\n[테스트 3] 보수적 투자자 추천")
    conservative = recommender.recommend_by_risk_profile(
        'conservative',
        test_tickers,
        top_k=3
    )
    for i, rec in enumerate(conservative, 1):
        print(f"  {i}. {rec['ticker']}")
        print(f"     점수: {rec['score']:.3f}")
        print(f"     이유: {rec['reason']}")


if __name__ == '__main__':
    test_content_recommender()
