import requests
import sys
import random
from bs4 import BeautifulSoup
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents


process_data = ProcessCompanyJobData()

def get_results(item: str):
    soup = BeautifulSoup(item, "lxml")
    results = soup.find_all("a", class_="job-card w-inline-block")
    for job in results:
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(
            datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        position = job.find("div", class_="job-card-title").text
        company_name = job.find_all(
            "div", class_="job-card-text bold")[0].text
        logo = job.find("img", class_="company-logo")["src"] if job.find(
            "img", class_="company-logo", src=True) else None
        apply_url = "https://www.workwithindies.com"+job["href"]
        location = job.find_all("div", class_="job-card-text bold")[1].text
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "company_logo": logo,
            "url": apply_url,
            "location": location,
            "source": "Work With Indies",
            "source_url": "https://www.workwithindies.com/"
        })


def get_url():
    try:
        headers = {"User-Agent": random.choice(user_agents)}
        url = "https://www.workwithindies.com/?categories=business%7Cprogramming%7Cqa-cs"
        response = requests.get(url, headers=headers)
        if response.ok:
            get_results(response.text)
        else:
            print("=> workwithindies: Error - Response status", response.status_code)
    except Exception as e:
        print("Error for workwithindies:", e)


def main():
    get_url()


if __name__ == "__main__":
    main()
