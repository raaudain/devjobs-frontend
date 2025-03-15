'''search(query, tld='com', lang='en', num=10, start=0, stop=None, pause=2.0)

query : query string that we want to search for.
tld : tld stands for top level domain which means we want to search our result on google.com or google.in or some other domain.
lang : lang stands for language.
num : Number of results we want.
start : First result to retrieve.
stop : Last result to retrieve. Use None to keep searching forever.
pause : Lapse to wait between HTTP requests. Lapse too short may cause Google to block your IP. Keeping significant
        lapse will make your program slow but its safe and better option.
Return : Generator (iterator) that yields found URLs. If the stop parameter is None the iterator will loop forever.'''


from googlesearch import search
from duckduckgo_search import DDGS
import time



def query_google(query):
    urls = set()
    count = 1

    for url in search(query, num=100, start=0, stop=500, pause=90):
        if not url in urls:
            print(count, url)
            urls.add(url)
            count+=1
    return urls

def query_duckduckgo(query):
    urls = set()
    count = 1
    loop = 1
    results = []

    while loop < 6:
        results.append(DDGS().text(query, max_results=5, region="us-en"))
        print(results)
        time.sleep(10)
        loop+=1

    for result in results:
        url = result["href"]

        if not url in urls:
            print(count, url)
            urls.add(url)
            count+=1
    return urls
