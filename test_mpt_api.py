import requests
import json

url = 'http://localhost:3001/api/mpt/analyze'
data = {'tickers': ['005930', '035420', '069500']}

response = requests.post(url, json=data)
if response.status_code == 200:
    result = response.json()
    print('Status: OK')
    print('ticker_names:', json.dumps(result.get('ticker_names', {}), ensure_ascii=False))
    print('tickers:', result.get('tickers', []))
else:
    print(f'Error: {response.status_code}')
    print(response.text)
