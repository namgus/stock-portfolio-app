import numpy as np
import pandas as pd
from pykrx import stock
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class PortfolioBacktester:
    def __init__(self, tickers, weights, initial_investment=10000000, start_date=None, end_date=None):
        """
        포트폴리오 백테스팅 클래스

        Args:
            tickers: 종목 코드 리스트
            weights: 각 종목의 비중 (합계 1.0)
            initial_investment: 초기 투자금액 (원)
            start_date: 시작일 (기본: 1년 전)
            end_date: 종료일 (기본: 오늘)
        """
        self.tickers = tickers
        self.weights = np.array(weights)
        self.initial_investment = initial_investment
        self.end_date = end_date or datetime.now().strftime('%Y%m%d')
        self.start_date = start_date or (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')

        self.prices_df = None
        self.portfolio_values = None

    def fetch_historical_prices(self):
        """과거 주가 데이터 가져오기"""
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
                print(f"Error fetching {ticker}: {e}")
                continue

        if not price_data:
            raise ValueError("No price data available")

        self.prices_df = pd.DataFrame(price_data)
        return self.prices_df

    def calculate_portfolio_value(self):
        """포트폴리오 가치 계산"""
        if self.prices_df is None:
            self.fetch_historical_prices()

        # 정규화된 가격 (첫날을 1.0으로)
        normalized_prices = self.prices_df / self.prices_df.iloc[0]

        # 각 종목의 가치 = 초기 투자금 * 비중 * 정규화된 가격
        portfolio_values = []
        for ticker, weight in zip(self.tickers, self.weights):
            if ticker in normalized_prices.columns:
                portfolio_values.append(normalized_prices[ticker] * weight * self.initial_investment)

        # 전체 포트폴리오 가치 = 각 종목 가치의 합
        self.portfolio_values = pd.DataFrame(portfolio_values).T.sum(axis=1)
        self.portfolio_values.index = self.prices_df.index

        return self.portfolio_values

    def calculate_metrics(self):
        """포트폴리오 성과 지표 계산"""
        if self.portfolio_values is None:
            self.calculate_portfolio_value()

        # 수익률 계산
        returns = self.portfolio_values.pct_change().dropna()

        # 누적 수익률
        total_return = (self.portfolio_values.iloc[-1] / self.initial_investment - 1) * 100

        # 연간 수익률 (CAGR)
        days = len(self.portfolio_values)
        years = days / 252  # 거래일 기준
        cagr = (np.power(self.portfolio_values.iloc[-1] / self.initial_investment, 1/years) - 1) * 100 if years > 0 else 0

        # 변동성 (연간화)
        volatility = returns.std() * np.sqrt(252) * 100

        # 샤프 비율 (무위험 수익률 3% 가정)
        sharpe = (cagr - 3) / volatility if volatility > 0 else 0

        # 최대 손실 (Maximum Drawdown)
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min() * 100

        # 승률 (상승한 날의 비율)
        win_rate = (returns > 0).sum() / len(returns) * 100

        # 최종 자산
        final_value = self.portfolio_values.iloc[-1]
        profit = final_value - self.initial_investment

        return {
            'initial_investment': self.initial_investment,
            'final_value': float(final_value),
            'profit': float(profit),
            'total_return': float(total_return),
            'cagr': float(cagr),
            'volatility': float(volatility),
            'sharpe_ratio': float(sharpe),
            'max_drawdown': float(max_drawdown),
            'win_rate': float(win_rate),
            'total_days': len(self.portfolio_values),
            'trading_days': len(returns)
        }

    def get_portfolio_history(self):
        """포트폴리오 가치 변화 이력"""
        if self.portfolio_values is None:
            self.calculate_portfolio_value()

        history = []
        for date, value in self.portfolio_values.items():
            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'value': float(value),
                'return': float((value / self.initial_investment - 1) * 100)
            })

        return history

    def compare_with_benchmark(self, benchmark_ticker='069500'):
        """벤치마크(KOSPI ETF)와 비교"""
        try:
            # 벤치마크 데이터 가져오기
            benchmark_df = stock.get_market_ohlcv_by_date(
                fromdate=self.start_date,
                todate=self.end_date,
                ticker=benchmark_ticker
            )

            if benchmark_df.empty:
                return None

            # 벤치마크 정규화
            benchmark_prices = benchmark_df['종가']
            benchmark_normalized = benchmark_prices / benchmark_prices.iloc[0]
            benchmark_values = benchmark_normalized * self.initial_investment

            # 벤치마크 수익률
            benchmark_return = (benchmark_values.iloc[-1] / self.initial_investment - 1) * 100

            # 벤치마크 변동성
            benchmark_returns = benchmark_values.pct_change().dropna()
            benchmark_volatility = benchmark_returns.std() * np.sqrt(252) * 100

            # 초과 수익
            portfolio_metrics = self.calculate_metrics()
            excess_return = portfolio_metrics['total_return'] - benchmark_return

            return {
                'benchmark_ticker': benchmark_ticker,
                'benchmark_name': 'KODEX 200',
                'benchmark_return': float(benchmark_return),
                'benchmark_volatility': float(benchmark_volatility),
                'excess_return': float(excess_return),
                'outperformed': bool(excess_return > 0)
            }
        except Exception as e:
            print(f"Benchmark comparison error: {e}")
            return None

    def get_monthly_returns(self):
        """월별 수익률 계산"""
        if self.portfolio_values is None:
            self.calculate_portfolio_value()

        # 월별로 리샘플링
        monthly = self.portfolio_values.resample('M').last()
        monthly_returns = monthly.pct_change().dropna() * 100

        result = []
        for date, ret in monthly_returns.items():
            result.append({
                'month': date.strftime('%Y-%m'),
                'return': float(ret)
            })

        return result

    def get_individual_performance(self):
        """개별 종목 성과"""
        if self.prices_df is None:
            self.fetch_historical_prices()

        performance = []
        for ticker in self.tickers:
            if ticker not in self.prices_df.columns:
                continue

            prices = self.prices_df[ticker]
            returns = prices.pct_change().dropna()

            total_return = (prices.iloc[-1] / prices.iloc[0] - 1) * 100
            volatility = returns.std() * np.sqrt(252) * 100

            performance.append({
                'ticker': ticker,
                'total_return': float(total_return),
                'volatility': float(volatility),
                'contribution': float(self.weights[self.tickers.index(ticker)] * total_return)
            })

        return performance

    def run_full_backtest(self):
        """전체 백테스트 실행"""
        # 가격 데이터 로드
        self.fetch_historical_prices()

        # 포트폴리오 가치 계산
        self.calculate_portfolio_value()

        # 성과 지표
        metrics = self.calculate_metrics()

        # 포트폴리오 히스토리
        history = self.get_portfolio_history()

        # 벤치마크 비교
        benchmark = self.compare_with_benchmark()

        # 월별 수익률
        monthly_returns = self.get_monthly_returns()

        # 개별 종목 성과
        individual = self.get_individual_performance()

        return {
            'metrics': metrics,
            'history': history,
            'benchmark': benchmark,
            'monthly_returns': monthly_returns,
            'individual_performance': individual,
            'period': {
                'start': self.start_date,
                'end': self.end_date
            }
        }


def test_backtesting():
    """테스트 함수"""
    # 샘플 포트폴리오: 삼성전자 50%, NAVER 30%, 현대차 20%
    tickers = ['005930', '035420', '005380']
    weights = [0.5, 0.3, 0.2]

    backtester = PortfolioBacktester(
        tickers=tickers,
        weights=weights,
        initial_investment=10000000  # 1000만원
    )

    result = backtester.run_full_backtest()

    print("=== 백테스팅 결과 ===")
    print(f"\n초기 투자: {result['metrics']['initial_investment']:,.0f}원")
    print(f"최종 자산: {result['metrics']['final_value']:,.0f}원")
    print(f"수익금: {result['metrics']['profit']:,.0f}원")
    print(f"총 수익률: {result['metrics']['total_return']:.2f}%")
    print(f"연간 수익률(CAGR): {result['metrics']['cagr']:.2f}%")
    print(f"변동성: {result['metrics']['volatility']:.2f}%")
    print(f"샤프 비율: {result['metrics']['sharpe_ratio']:.2f}")
    print(f"최대 손실: {result['metrics']['max_drawdown']:.2f}%")
    print(f"승률: {result['metrics']['win_rate']:.2f}%")

    if result['benchmark']:
        print(f"\n벤치마크 대비:")
        print(f"  벤치마크 수익률: {result['benchmark']['benchmark_return']:.2f}%")
        print(f"  초과 수익: {result['benchmark']['excess_return']:.2f}%")
        print(f"  벤치마크 초과: {'예' if result['benchmark']['outperformed'] else '아니오'}")

    return result


if __name__ == '__main__':
    test_backtesting()
