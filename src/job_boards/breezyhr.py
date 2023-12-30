import requests
import sys
import time
import random
from lxml import html
from datetime import datetime
from bs4 import BeautifulSoup
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents

process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/breezyhr.txt"


def get_results(item: str, param: str):
    soup = BeautifulSoup(item, "lxml")
    tree = html.fromstring(item)
    logo = None
    try:
        logo = tree.xpath(
            "//img[contains(@src, 'https://gallery-cdn.breezy.hr') or contains(@src, 'https://attachments-cdn.breezy.hr')]/@src")[0]
    except Exception as e:
        print(f"=> breezyhr: Failed to get logo for {param}. Error: {e}.")
    results = soup.find_all("li", class_="position transition")
    company = soup.find("meta", {"name": "twitter:data1"})["content"] if soup.find(
        "meta", {"name": "twitter:data1"}) else param
    for r in results:
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(
            datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        apply_url = f'https://{param}.breezy.hr{r.find("a")["href"].strip()}'
        company_name = company.strip()
        position = r.find("h2").text.strip()
        location = "See description"
        if "%LABEL_POSITION_TYPE_REMOTE%" in r.find("li", class_="location").text:
            location = r.find("li", class_="location").text.replace(
                "%LABEL_POSITION_TYPE_REMOTE%", "Remote")
        elif "%LABEL_POSITION_TYPE_WORLDWIDE%" in r.find("li", class_="location").text:
            location = r.find("li", class_="location").text.replace(
                "%LABEL_POSITION_TYPE_WORLDWIDE%", "Remote")
        elif r.find("li", class_="location"):
            location = r.find(
                "li", class_="location").text.strip()
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "company_logo": logo,
            "url": apply_url,
            "location": location,
            "source": company,
            "source_url": f"https://{param}.breezy.hr"
        })


def get_url(companies: list):
    page = 1
    for company in companies:
        try:
            headers = {"User-Agent": random.choice(user_agents)}
            url = f"https://{company}.breezy.hr"
            response = requests.get(url, headers=headers)
            if response.ok:
                get_results(response.text, company)
                if page % 90 == 0:
                    time.sleep(60)
                else:
                    time.sleep(0.2)
                page += 1
            elif response.status_code == 404:
                process_data.remove_not_found(FILE_PATH, company)
            else:
                print(
                    f"=> breezyhr: Failed to scrape {company}. Status code: {response.status_code}")
        except Exception as e:
            if response.status_code == 429 or str(response.status_code)[0] == "5":
                print(
                    f"=> breezyhr: Failed to scrape {company}. Status code: {response.status_code}")
                break
            else:
                print(f"=> breezyhr: Failed to scrape {company}. Error: {e}")


def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)


# main()
# sys.exit(0)
