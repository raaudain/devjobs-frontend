import requests
import sys
import time
import random
from bs4 import BeautifulSoup
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import user_agents, ProcessCompanyJobData

process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/clearcompany.txt"


def get_results(item: str, param: str):
    soup = BeautifulSoup(item, "lxml")
    data = soup.find_all("tr", class_="reqitem ReqRowClick ReqRowClick")
    company = None
    if soup.find(class_="careersTitle"):
        company = soup.find(class_="careersTitle").text.replace(
            "Careers at", "").replace("Careers At", "").strip()
    elif soup.find(class_="footer-copyright"):
        company = soup.find(
            class_="footer-copyright").text.replace("© 2021", "").strip()
    else:
        company = param.upper()
    for d in data:
        title = d.find("td", class_="posTitle reqitem ReqRowClick").text
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(
            datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        apply_url = f"https://{param}.hrmdirect.com/employment/" + \
            d.find("a", href=True)["href"]
        company_name = company
        position = title.strip()
        city = d.find("a", href=True).find_next()
        state = city.find_next()
        location = f"{city.text.strip()}, {state.text.strip()}"
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "url": apply_url,
            "location": location,
            "source": company_name,
            "source_url": f"https://{param}.hrmdirect.com/employment/job-openings.php?search=true&dept=-1"
        })


def get_url(companies: list):
    page = 1
    for company in companies:
        try:
            headers = {"User-Agent": random.choice(user_agents)}
            url = f"https://{company}.hrmdirect.com/employment/job-openings.php?search=true&dept=-1"
            response = requests.get(url, headers=headers)
            if response.ok:
                get_results(response.text, company)
                if page % 10 == 0:
                    time.sleep(5)
                else:
                    time.sleep(0.2)
                page += 1
            elif response.status_code == 404:
                process_data.remove_not_found(FILE_PATH, company)
            else:
                print(
                    f"=> clearcompany: Failed to scrape {company}. Status code: {response.status_code}")
        except:
            print(f"=> clearcompany: Error with {company}.")


def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)


# main()
# sys.exit(0)
