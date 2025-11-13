import numpy as np
import pandas as pd
from pykrx import stock
from datetime import datetime, timedelta
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

class MPTCalculator:
    def __init__(self, tickers, start_date=None, end_date=None):
        """
        MPT 계산기 초기화

        Args:
            tickers: 종목 코드 리스트 (예: ['005930', '035420'])
            start_date: 시작일 (기본값: 1년 전)
            end_date: 종료일 (기본값: 오늘)
        """
        self.tickers = tickers
        self.end_date = end_date or datetime.now().strftime('%Y%m%d')
        self.start_date = start_date or (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')

        self.returns_df = None
        self.mean_returns = None
        self.cov_matrix = None

    def fetch_historical_data(self):
        """과거 주가 데이터를 가져와서 수익률 계산"""
        price_data = {}

        for ticker in self.tickers:
            try:
                df = stock.get_market_ohlcv_by_date(
                    fromdate=self.start_date,
                    todate=self.end_date,
                    ticker=ticker
                )
                if df is not None and not df.empty:
                    price_data[ticker] = df['종가']
            except Exception as e:
                print(f"Error fetching data for {ticker}: {e}")
                continue

        if not price_data:
            raise ValueError("No price data available")

        # 종가 데이터프레임 생성
        prices_df = pd.DataFrame(price_data)

        # 일간 수익률 계산
        self.returns_df = prices_df.pct_change().dropna()

        # 평균 수익률과 공분산 행렬 계산
        self.mean_returns = self.returns_df.mean()
        self.cov_matrix = self.returns_df.cov()

        return self.returns_df

    def portfolio_performance(self, weights):
        """
        포트폴리오 성과 계산

        Returns:
            returns: 연간 예상 수익률
            std: 연간 변동성 (위험)
            sharpe: 샤프 비율
        """
        # 연간화 (252 거래일)
        returns = np.sum(self.mean_returns * weights) * 252
        std = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix * 252, weights)))

        # 샤프 비율 (무위험 수익률 3% 가정)
        sharpe = (returns - 0.03) / std

        return returns, std, sharpe

    def negative_sharpe(self, weights):
        """최적화를 위한 음수 샤프 비율"""
        return -self.portfolio_performance(weights)[2]

    def optimize_portfolio(self):
        """샤프 비율을 최대화하는 최적 포트폴리오 찾기"""
        num_assets = len(self.tickers)

        # 제약 조건
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}  # 비중 합 = 1
        bounds = tuple((0, 1) for _ in range(num_assets))  # 각 비중 0~1

        # 초기값 (균등 분배)
        init_guess = num_assets * [1. / num_assets]

        # 최적화 실행
        result = minimize(
            self.negative_sharpe,
            init_guess,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )

        optimal_weights = result.x
        returns, std, sharpe = self.portfolio_performance(optimal_weights)

        return {
            'weights': optimal_weights.tolist(),
            'expected_return': float(returns * 100),  # 백분율
            'volatility': float(std * 100),
            'sharpe_ratio': float(sharpe)
        }

    def calculate_efficient_frontier(self, num_portfolios=100):
        """효율적 투자선 계산"""
        num_assets = len(self.tickers)
        results = []

        # 최소/최대 수익률 범위 설정
        min_ret = self.mean_returns.min() * 252
        max_ret = self.mean_returns.max() * 252
        target_returns = np.linspace(min_ret, max_ret, num_portfolios)

        for target in target_returns:
            # 제약 조건: 비중 합 = 1, 목표 수익률 달성
            constraints = [
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                {'type': 'eq', 'fun': lambda x: np.sum(self.mean_returns * x) * 252 - target}
            ]
            bounds = tuple((0, 1) for _ in range(num_assets))
            init_guess = num_assets * [1. / num_assets]

            # 변동성 최소화
            def portfolio_volatility(weights):
                return np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix * 252, weights)))

            result = minimize(
                portfolio_volatility,
                init_guess,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )

            if result.success:
                returns, std, sharpe = self.portfolio_performance(result.x)
                results.append({
                    'return': float(returns * 100),
                    'volatility': float(std * 100),
                    'sharpe_ratio': float(sharpe)
                })

        return results

    def calculate_minimum_variance_portfolio(self):
        """최소 변동성 포트폴리오 계산"""
        num_assets = len(self.tickers)

        def portfolio_volatility(weights):
            return np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix * 252, weights)))

        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        bounds = tuple((0, 1) for _ in range(num_assets))
        init_guess = num_assets * [1. / num_assets]

        result = minimize(
            portfolio_volatility,
            init_guess,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )

        optimal_weights = result.x
        returns, std, sharpe = self.portfolio_performance(optimal_weights)

        return {
            'weights': optimal_weights.tolist(),
            'expected_return': float(returns * 100),
            'volatility': float(std * 100),
            'sharpe_ratio': float(sharpe)
        }

    def analyze_portfolio(self, weights):
        """주어진 비중의 포트폴리오 분석"""
        weights = np.array(weights)
        returns, std, sharpe = self.portfolio_performance(weights)

        return {
            'expected_return': float(returns * 100),
            'volatility': float(std * 100),
            'sharpe_ratio': float(sharpe),
            'weights': weights.tolist()
        }

    def get_correlation_matrix(self):
        """종목 간 상관관계 행렬"""
        if self.returns_df is None:
            self.fetch_historical_data()

        corr_matrix = self.returns_df.corr()

        # JSON 직렬화 가능한 형태로 변환
        result = {}
        for ticker in self.tickers:
            result[ticker] = {
                t: float(corr_matrix.loc[ticker, t])
                for t in self.tickers if t in corr_matrix.columns
            }

        return result

    def get_full_analysis(self):
        """전체 MPT 분석 수행"""
        # 데이터 가져오기
        self.fetch_historical_data()

        # 최적 포트폴리오 (샤프 비율 최대)
        optimal = self.optimize_portfolio()

        # 최소 변동성 포트폴리오
        min_variance = self.calculate_minimum_variance_portfolio()

        # 효율적 투자선
        efficient_frontier = self.calculate_efficient_frontier(50)

        # 상관관계 행렬
        correlation = self.get_correlation_matrix()

        # 개별 종목 통계
        individual_stats = []
        for ticker in self.tickers:
            if ticker in self.mean_returns.index:
                ret = float(self.mean_returns[ticker] * 252 * 100)
                vol = float(self.returns_df[ticker].std() * np.sqrt(252) * 100)
                individual_stats.append({
                    'ticker': ticker,
                    'expected_return': ret,
                    'volatility': vol,
                    'sharpe_ratio': float((ret - 3) / vol) if vol > 0 else 0
                })

        return {
            'optimal_portfolio': optimal,
            'minimum_variance_portfolio': min_variance,
            'efficient_frontier': efficient_frontier,
            'correlation_matrix': correlation,
            'individual_stats': individual_stats,
            'tickers': self.tickers,
            'data_period': {
                'start': self.start_date,
                'end': self.end_date,
                'days': len(self.returns_df)
            }
        }


def test_mpt():
    """테스트 함수"""
    # 삼성전자, 네이버, 현대차로 테스트
    tickers = ['005930', '035420', '005380']

    calculator = MPTCalculator(tickers)
    result = calculator.get_full_analysis()

    print("=== MPT 분석 결과 ===")
    print("\n최적 포트폴리오 (샤프 비율 최대):")
    print(f"  기대 수익률: {result['optimal_portfolio']['expected_return']:.2f}%")
    print(f"  변동성: {result['optimal_portfolio']['volatility']:.2f}%")
    print(f"  샤프 비율: {result['optimal_portfolio']['sharpe_ratio']:.2f}")
    print(f"  비중: {[f'{w*100:.1f}%' for w in result['optimal_portfolio']['weights']]}")

    print("\n최소 변동성 포트폴리오:")
    print(f"  기대 수익률: {result['minimum_variance_portfolio']['expected_return']:.2f}%")
    print(f"  변동성: {result['minimum_variance_portfolio']['volatility']:.2f}%")
    print(f"  샤프 비율: {result['minimum_variance_portfolio']['sharpe_ratio']:.2f}")

    return result


if __name__ == '__main__':
    test_mpt()
