import requests
import json
import sys
import time
import random
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents


process_data = ProcessCompanyJobData()

def get_results(item: str):
    jobs = item["jobs"]
    if jobs:
        for data in jobs:
            apply_url = data["applicationLink"].strip()
            date = data["added"]
            d = datetime.strptime(date, "%Y-%m-%d")
            post_date = datetime.timestamp(
                datetime.strptime(str(d), "%Y-%m-%d %H:%M:%S"))
            company_name = data["company"].strip()
            logo = data["companyLogo"].strip() if len(
                data["companyLogo"]) > 0 else "https://fullstackjob.com/img/icons/favicon-32x32.png"
            position = data["position"].strip()
            location = f"{data['location'].strip()}, " if len(
                data["location"]) > 0 else ""
            country = data["country"].strip()
            remote = " | Remote" if data["remoteOk"] != "false" else ""
            location = location+country+remote
            source = data["ownerTenant"]["host"]
            source_url = "https://"+data["ownerTenant"]["host"]
            process_data.filter_jobs({
                "timestamp": post_date,
                "title": position,
                "company": company_name,
                "company_logo": logo,
                "url": apply_url,
                "location": location,
                "source": source,
                "source_url": source_url
            })


def get_url():
    referers = ["https://javascriptjob.xyz/", "https://fullstackjob.com/"]
    for referer in referers:
        headers = {"User-Agent": random.choice(user_agents), "Referer": referer}
        url = "https://api.fullstackjob.com/v1/app/job"
        response = requests.get(url, headers=headers)
        if response.ok:
            data = json.loads(response.text)
            get_results(data)
        else:
            print("=> fullstackjob: Error - Response status", response.status_code)
        time.sleep(0.2)


def main():
    get_url()


if __name__ == "__main__":
    main()