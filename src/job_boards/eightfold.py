import requests
from pprint import pprint
import sys
import time
import random
import re
from lxml import html
from datetime import datetime
sys.path.insert(0, ".")
from traceback import format_stack
from src.job_boards.tools import user_agents, ProcessCompanyJobData


process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/eightfold.txt"


def get_results(item, param):
    if "data" in item:
        jobs = item["data"]["positions"]
        company_name = param.capitalize()
    else:
        jobs = item["positions"]
        company_name = item["branding"]["companyName"]

    print("=======", company_name)
    logo = None
    source_url = f"https://{param}.eightfold.ai/careers/"
    ef = "src/data/assets/eightfold_assets.txt"
    table = process_data.get_stored_data(ef)

    if param in table:
        logo = table[param]["logo"]
    else:
        try:
            r = requests.get(source_url)
            tree = html.fromstring(r.content)
            logo = tree.xpath("//strong[@class='logo']//img/@src | //img[contains(@alt, 'logo')]/@src")[0]

            with open(ef, "a") as a:
                a.write(f"{param}`n/a`{logo}\n")
        except Exception as e:
            print(f"=> eightfold.ai: Error getting logo for {param}. {e}.")
    
    for j in jobs:
        date = datetime.fromtimestamp(j["t_create"])
        post_date = datetime.timestamp(
            datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        position = j["name"].strip()
        # description = j["job_description"]
        # department = j["department"]
        apply_url = j["canonicalPositionUrl"] if j.get("canonicalPositionUrl") else f"https://{param}.eightfold.ai{j['positionUrl']}"
        location = " | ".join(j["locations"])
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "company_logo": logo,
            # "description": description,
            # "department": department,
            "url": apply_url,
            "location": location,
            "source": company_name,
            "source_url": source_url
        })


def get_url(companies: list):
    count = 1
    domain = None

    for company in companies:
        try:
            for page in range(0, 1000, 10):
                url = f"https://{company}.eightfold.ai/api/apply/v2/jobs?start={page}&num=10&sort_by=date"
                response = send_requests(url)
                
                if response.status_code == 403:
                    if domain is None:
                        url = f"https://{company}.eightfold.ai/careers"
                        response = send_requests(url)
                        pattern = r"(?<=domain=)[^&]+"
                        result = re.search(pattern, response.text)
                        
                        if result:
                            domain = result.group(0)

                            url = f"https://{company}.eightfold.ai/api/pcsx/search?domain={domain}&start={page}&num=10&sort_by=date"
                            print(url)
                            response = send_requests(url)
                        
                        if not response.ok:
                            break

                if response.ok:
                    data = response.json()
                    print("=======", url)
                    
                    if not data:
                        break

                    get_results(data, company)
                    if count % 15 == 0:
                        time.sleep(2)
                    else:
                        time.sleep(2)
                    count += 1
                elif response.status_code == 404:
                    process_data.remove_not_found(FILE_PATH, company)
                else:
                    print(
                        f"=> eightfold.ai: Status code {response.status_code} for {company}.")
                    break
        except Exception as e:
            print(f"=> eightfold.ai: Error for {company}. {e}.")
            print(format_stack())
    
    domain = None

def send_requests(url):
    headers = {"User-Agent": random.choice(user_agents)}
    response = requests.get(url, headers=headers)
    return response

def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)


if __name__ == "__main__":
    main()