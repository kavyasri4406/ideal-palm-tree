import urllib.request
import re
import json

url = "https://crop-market-price.vercel.app/"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req, timeout=15) as response:
        html_content = response.read().decode('utf-8')
        
        # 1. Next.js pages embed their data in a script tag with id="__NEXT_DATA__"
        next_data_match = re.search(r'<script id="__NEXT_DATA__"[^>]*>([^<]+)</script>', html_content)
        if next_data_match:
            print("=== Found __NEXT_DATA__ script! ===")
            data = json.loads(next_data_match.group(1))
            # Let's dump or find keys related to crops
            # Usually it is in data['props']['pageProps']
            page_props = data.get('props', {}).get('pageProps', {})
            print(json.dumps(page_props, indent=2)[:2000])
        else:
            print("No __NEXT_DATA__ script found.")
            
        # 2. Let's also look for script src paths in the html:
        scripts = re.findall(r'src=["\']([^"\']+\.js)["\']', html_content)
        print(f"\n=== Found {len(scripts)} script tags: ===")
        for s in scripts:
            print(s)
            
except Exception as e:
    print(f"Error: {e}")
