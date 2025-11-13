#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
하이브리드 추천 시스템
Content-Based + Collaborative Filtering을 결합한 추천
"""

import random
import numpy as np
from content_recommender import ContentBasedRecommender


# 더미 사용자 데이터 (간단한 버전)
DUMMY_USERS = [
    # 보수적 투자자들
    {'risk': 'conservative', 'portfolio': ['055550', '105560', '086790', '017670', '030200'], 'returns': 0.08},
    {'risk': 'conservative', 'portfolio': ['055550', '105560', '033780', '015760'], 'returns': 0.10},
    {'risk': 'conservative', 'portfolio': ['105560', '086790', '316140', '030200'], 'returns': 0.07},
    {'risk': 'conservative', 'portfolio': ['055550', '017670', '030200', '069500'], 'returns': 0.09},

    # 중립적 투자자들
    {'risk': 'moderate', 'portfolio': ['005930', '000660', '055550', '105560'], 'returns': 0.15},
    {'risk': 'moderate', 'portfolio': ['005930', '055550', '035420', '069500'], 'returns': 0.18},
    {'risk': 'moderate', 'portfolio': ['000660', '105560', '000270', '005380'], 'returns': 0.12},
    {'risk': 'moderate', 'portfolio': ['005930', '000660', '035420', '035720'], 'returns': 0.20},

    # 공격적 투자자들
    {'risk': 'aggressive', 'portfolio': ['035420', '035720', '051910', '207940'], 'returns': 0.30},
    {'risk': 'aggressive', 'portfolio': ['035420', '051910', '028260', '096770'], 'returns': 0.35},
    {'risk': 'aggressive', 'portfolio': ['035720', '051910', '068270'], 'returns': 0.25},
    {'risk': 'aggressive', 'portfolio': ['051910', '207940', '096770'], 'returns': 0.28},
]


class CollaborativeFilter:
    """Collaborative Filtering (간단한 버전)"""

    def __init__(self):
        self.users = DUMMY_USERS

    def get_popular_stocks(self, top_k=10):
        """인기 종목 추천 (가장 많이 보유된 종목)"""
        stock_counts = {}

        for user in self.users:
            for ticker in user['portfolio']:
                stock_counts[ticker] = stock_counts.get(ticker, 0) + 1

        # 빈도 높은 순으로 정렬
        popular = sorted(stock_counts.items(), key=lambda x: x[1], reverse=True)

        return [
            {
                'ticker': ticker,
                'popularity': count / len(self.users),
                'user_count': count
            }
            for ticker, count in popular[:top_k]
        ]

    def get_recommendations_by_similarity(self, current_portfolio, top_k=5):
        """
        현재 포트폴리오와 유사한 사용자들이 보유한 종목 추천
        (User-Based CF)
        """
        if not current_portfolio:
            return []

        current_set = set(current_portfolio)

        # 각 사용자와의 유사도 계산 (Jaccard similarity)
        similar_users = []
        for user in self.users:
            user_set = set(user['portfolio'])

            # Jaccard 유사도
            intersection = len(current_set & user_set)
            union = len(current_set | user_set)

            if union > 0:
                similarity = intersection / union
                similar_users.append({
                    'user': user,
                    'similarity': similarity
                })

        # 유사도 높은 순으로 정렬
        similar_users.sort(key=lambda x: x['similarity'], reverse=True)

        # 상위 유사 사용자들의 종목 수집
        candidate_stocks = {}
        for similar_user in similar_users[:5]:  # 상위 5명
            for ticker in similar_user['user']['portfolio']:
                if ticker not in current_set:
                    if ticker not in candidate_stocks:
                        candidate_stocks[ticker] = {
                            'score': 0,
                            'recommending_users': 0
                        }
                    candidate_stocks[ticker]['score'] += similar_user['similarity']
                    candidate_stocks[ticker]['recommending_users'] += 1

        # 점수 높은 순으로 정렬
        recommendations = [
            {
                'ticker': ticker,
                'cf_score': data['score'],
                'user_count': data['recommending_users']
            }
            for ticker, data in candidate_stocks.items()
        ]

        recommendations.sort(key=lambda x: x['cf_score'], reverse=True)

        return recommendations[:top_k]


class HybridRecommender:
    """하이브리드 추천 시스템 (Content-Based + Collaborative Filtering)"""

    def __init__(self):
        self.content_recommender = ContentBasedRecommender()
        self.cf_recommender = CollaborativeFilter()

    def get_hybrid_recommendations(
        self,
        current_portfolio,
        all_tickers,
        risk_tolerance='moderate',
        top_k=5,
        weights=None
    ):
        """
        하이브리드 추천

        Args:
            current_portfolio: 현재 포트폴리오 (list of tickers)
            all_tickers: 전체 후보 종목 (list)
            risk_tolerance: 'conservative', 'moderate', 'aggressive'
            top_k: 추천할 종목 개수
            weights: {'content': 0.5, 'cf': 0.3, 'performance': 0.2}
        """
        if weights is None:
            weights = {'content': 0.5, 'cf': 0.3, 'performance': 0.2}

        # 1. Content-Based 추천
        content_recommendations = {}

        # 다양화 추천
        if current_portfolio:
            diverse = self.content_recommender.recommend_diverse_stocks(
                current_portfolio,
                all_tickers,
                top_k=10
            )
            for rec in diverse:
                content_recommendations[rec['ticker']] = {
                    'content_score': rec['diversity'],
                    'reason': rec['reason']
                }

        # 리스크 프로필 기반 추천
        risk_based = self.content_recommender.recommend_by_risk_profile(
            risk_tolerance,
            all_tickers,
            top_k=10
        )
        for rec in risk_based:
            ticker = rec['ticker']
            if ticker in current_portfolio:
                continue

            if ticker in content_recommendations:
                # 이미 있으면 점수 평균
                content_recommendations[ticker]['content_score'] = \
                    (content_recommendations[ticker]['content_score'] + rec['score']) / 2
            else:
                content_recommendations[ticker] = {
                    'content_score': rec['score'],
                    'reason': rec['reason']
                }

        # 2. Collaborative Filtering 추천
        cf_recommendations = self.cf_recommender.get_recommendations_by_similarity(
            current_portfolio,
            top_k=10
        )

        cf_scores = {rec['ticker']: rec['cf_score'] for rec in cf_recommendations}
        cf_user_counts = {rec['ticker']: rec['user_count'] for rec in cf_recommendations}

        # 3. 인기 종목 (성과 기반 근사)
        popular = self.cf_recommender.get_popular_stocks(top_k=10)
        popularity_scores = {rec['ticker']: rec['popularity'] for rec in popular}

        # 4. 하이브리드 점수 계산
        all_candidates = set(content_recommendations.keys()) | set(cf_scores.keys()) | set(popularity_scores.keys())

        # 현재 포트폴리오 제외
        all_candidates -= set(current_portfolio)

        hybrid_recommendations = []
        for ticker in all_candidates:
            content_score = content_recommendations.get(ticker, {}).get('content_score', 0)
            cf_score = cf_scores.get(ticker, 0)
            popularity_score = popularity_scores.get(ticker, 0)

            # 정규화 (0-1)
            content_norm = min(content_score, 1.0)
            cf_norm = min(cf_score, 1.0)
            pop_norm = popularity_score

            # 가중 평균
            hybrid_score = (
                weights['content'] * content_norm +
                weights['cf'] * cf_norm +
                weights['performance'] * pop_norm
            )

            # 추천 이유 생성
            reasons = []
            if content_score > 0:
                reasons.append(content_recommendations[ticker].get('reason', '특징 기반 추천'))
            if cf_score > 0:
                user_count = cf_user_counts.get(ticker, 0)
                reasons.append(f'유사한 투자자 {user_count}명이 보유')
            if popularity_score > 0:
                reasons.append(f'전체 {int(popularity_score*100)}%가 보유')

            hybrid_recommendations.append({
                'ticker': ticker,
                'hybrid_score': hybrid_score,
                'content_score': content_score,
                'cf_score': cf_score,
                'popularity': popularity_score,
                'reason': ', '.join(reasons) if reasons else '종합 추천'
            })

        # 점수 높은 순으로 정렬
        hybrid_recommendations.sort(key=lambda x: x['hybrid_score'], reverse=True)

        return hybrid_recommendations[:top_k]

    def get_similar_stocks(self, ticker, all_tickers, top_k=3):
        """특정 종목과 유사한 종목 추천 (Content-Based만 사용)"""
        return self.content_recommender.recommend_similar_stocks(
            ticker,
            all_tickers,
            top_k=top_k
        )

    def get_diversification_suggestions(self, current_portfolio, all_tickers, top_k=5):
        """포트폴리오 다양화 제안 (Content-Based)"""
        return self.content_recommender.recommend_diverse_stocks(
            current_portfolio,
            all_tickers,
            top_k=top_k
        )

    def get_popular_stocks(self, top_k=10):
        """인기 종목 (CF 기반)"""
        return self.cf_recommender.get_popular_stocks(top_k=top_k)


def test_hybrid_recommender():
    """테스트 함수"""
    print("=== 하이브리드 추천 시스템 테스트 ===\n")

    recommender = HybridRecommender()

    # 테스트용 데이터
    test_portfolio = ['005930', '000660']  # 삼성전자, SK하이닉스
    all_tickers = [
        '005930', '000660', '055550', '105560', '086790', '316140',
        '035420', '035720', '051910', '207940', '069500'
    ]

    print("[테스트 1] 하이브리드 추천 (중립적 투자자)")
    recommendations = recommender.get_hybrid_recommendations(
        test_portfolio,
        all_tickers,
        risk_tolerance='moderate',
        top_k=5
    )

    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['ticker']}")
        print(f"   종합 점수: {rec['hybrid_score']:.3f}")
        print(f"   Content: {rec['content_score']:.3f} | CF: {rec['cf_score']:.3f} | 인기: {rec['popularity']:.3f}")
        print(f"   이유: {rec['reason']}")

    print("\n\n[테스트 2] 인기 종목")
    popular = recommender.get_popular_stocks(top_k=5)
    for i, rec in enumerate(popular, 1):
        print(f"{i}. {rec['ticker']} - {int(rec['popularity']*100)}%의 투자자가 보유")


if __name__ == '__main__':
    test_hybrid_recommender()
