import urllib.request
import time

CROP_URLS = {
    "rice": "https://cdn.pixabay.com/photo/2016/11/18/14/05/paddy-1835181_640.jpg",
    "wheat": "https://cdn.pixabay.com/photo/2016/09/21/04/46/barley-1684052_640.jpg",
    "corn": "https://cdn.pixabay.com/photo/2017/07/31/19/27/corn-2560372_640.jpg",
    "mustard": "https://cdn.pixabay.com/photo/2015/04/10/16/43/mustard-716492_640.jpg",
    "soybean": "https://cdn.pixabay.com/photo/2016/06/20/22/01/soy-beans-1470123_640.jpg",
    "groundnut": "https://cdn.pixabay.com/photo/2020/03/17/12/32/peanuts-4940166_640.jpg",
    "sugarcane": "https://cdn.pixabay.com/photo/2021/03/24/09/43/sugarcane-6120017_640.jpg",
    "cotton": "https://cdn.pixabay.com/photo/2016/10/24/22/43/cotton-field-1767512_640.jpg",
    "tomato": "https://cdn.pixabay.com/photo/2016/08/01/17/08/tomatoes-1561565_640.jpg",
    "onion": "https://cdn.pixabay.com/photo/2016/05/09/10/15/onion-1381156_640.jpg",
    "potato": "https://cdn.pixabay.com/photo/2014/08/06/20/12/potatoes-411975_640.jpg",
    "gram": "https://cdn.pixabay.com/photo/2017/07/28/14/29/chickpeas-2548842_640.jpg",
    "tur": "https://cdn.pixabay.com/photo/2015/07/17/13/44/peas-849045_640.jpg",
    "moong": "https://cdn.pixabay.com/photo/2017/03/10/15/03/mung-beans-2132986_640.jpg",
    "banana": "https://cdn.pixabay.com/photo/2018/09/24/20/12/bananas-3700718_640.jpg",
    "mango": "https://cdn.pixabay.com/photo/2016/03/05/22/18/mango-1239243_640.jpg",
    "turmeric": "https://cdn.pixabay.com/photo/2017/08/17/03/48/turmeric-2649982_640.jpg",
    "chilli": "https://cdn.pixabay.com/photo/2016/04/13/16/09/peppers-1327179_640.jpg"
}

def verify_url(crop, url):
    req = urllib.request.Request(
        url, 
        method='HEAD',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            return response.status == 200
    except Exception as e:
        print(f"Failed for {crop}: {e}")
        return False

for crop, url in CROP_URLS.items():
    success = verify_url(crop, url)
    print(f"{crop}: {'SUCCESS' if success else 'FAIL'}")
    time.sleep(0.3)
