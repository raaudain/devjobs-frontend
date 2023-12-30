from datetime import datetime
import sys
import time
import feedparser
import random
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents


process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/recruiterbox.txt"


def get_results(item: str, name: str):
    company_name = item["channel"]["title"].replace("Jobs at", "").strip()
    data = item["entries"]
    for i in data:
        date = i["published"]
        post_date = datetime.timestamp(datetime.strptime(
            str(date), "%a, %d %b %Y %H:%M:%S %z"))
        apply_url = i["link"]
        position = i["title"]
        city = "Remote" if "UTC" in i["job_locationcity"] or "Global" in i[
            "job_locationcity"] else f'{i["job_locationcity"]}'
        region = f', {i["job_locationstate"]}' if i["job_locationstate"] else ""
        country = f', {i["job_locationcountry"]}' if i["job_locationcountry"] else ""
        location = f"{city}{region}{country}"
        source_url = f"https://{name}.recruiterbox.com/jobs"
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "url": apply_url,
            "location": location,
            "source": company_name,
            "source_url": source_url
        })


def get_url(companies: list):
    for company in companies:
        url = f"http://recruiterbox.com/jobfeeds/{company}"
        response = feedparser.parse(url, agent=random.choice(user_agents))
        # bozo flag checks if a feed is malformed
        if response.bozo == False:
            get_results(response, company)
        elif response.status == 404:
            process_data.remove_not_found(FILE_PATH, company)
        else:
            error = response.bozo_exception
            print(f"=> recruiterbox: Failed {company}. Error: {error}")
        time.sleep(0.2)


def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)


if __name__ == "__main__":
    main()
