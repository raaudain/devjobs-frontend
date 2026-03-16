#!/user/bin/env python3

import sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, ".")
from src.update_params.utils import ats
from src.update_params.tools import query_google, process_urls, query_duckduckgo


def main():
    for a in ats:
        query = f"site:{a['host']}"
        print("\ncurrent query:", query)
        params = a["params"]
        uri = a["uri"]
        # google_urls = query_google(query)
        ddg_urls = query_duckduckgo(query)
        urls = ddg_urls
        print(urls)
        process_urls(urls, params, uri)

if __name__ == "__main__":
    main()

