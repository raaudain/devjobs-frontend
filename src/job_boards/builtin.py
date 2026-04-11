import requests
import sys
import random
import time
from bs4 import BeautifulSoup
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents


def get_results(page):
    process_data = ProcessCompanyJobData()
    soup = BeautifulSoup(page, "lxml")

    for posting in soup.find_all("div", attrs={"data-id":"job-card"}):
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(datetime.strptime(date, "%Y-%m-%d %H:%M:%S"))
        card_alias = posting.find("a", attrs={"data-id":"job-card-title"})
        
        data = {
            "timestamp": post_date,
            "title": card_alias.text,
            "company": posting.find("a",  attrs={"data-id":"company-title"}).find("span").text,
            "company_logo": posting.find("img", attrs={"data-id":"company-img"}).get("src"),
            "url": "https://builtin.com" + card_alias.get("href"),
            "location": posting.find_all(class_="font-barlow text-gray-04")[1].text,
            "source": "Built In",
            "source_url": "https://builtin.com/"
        }
        print(data)
        process_data.filter_jobs(data)

def get_url():
    for page in range(1, 51):
        headers = {
            "User-Agent": random.choice(user_agents), 
            "Origin": "https://builtin.com", 
            "Referer": "https://builtin.com/"
        }
        url = f"https://builtin.com/jobs/remote/hybrid/office?page={page}&daysSinceUpdated=7"
        response = requests.get(url, headers=headers)

        if response.ok:
            get_results(response.text)
        else:
            print(f"=> builtin: Failed on page {page}. Status code: {response.status_code}.")
            break

        time.sleep(3)

def main():
    get_url()

if __name__ == "__main__":
    main()