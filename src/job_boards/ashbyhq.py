import requests
import json
import sys
import time
import random
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, user_agents


process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/ashbyhq.txt"


def get_results(item: str, param: str, name: str, logo: str):
    jobs = item["data"]["jobBoard"]["jobPostings"]

    for data in jobs:
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(
            datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        job_id = data["id"].strip()
        apply_url = f"https://jobs.ashbyhq.com/{param}/{job_id}"
        company_name = name
        position = data["title"].strip()
        locations_string = data["locationName"].strip()
        source_url = f"https://jobs.ashbyhq.com/{param}"
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "company_logo": logo,
            "url": apply_url,
            "location": locations_string,
            "source": company_name,
            "source_url": source_url,
        })


def get_url(companies: list):
    page = 1
    for company in companies:
        try:
            headers = {"User-Agent": random.choice(user_agents)}
            url1 = "https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams"
            url2 = "https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiOrganizationFromHostedJobsPageName"
            payload = {
                "operationName":"ApiJobBoardWithTeams","variables":{"organizationHostedJobsPageName":company},"query":"query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {\n  jobBoard: jobBoardWithTeams(\n    organizationHostedJobsPageName: $organizationHostedJobsPageName\n  ) {\n    teams {\n      id\n      name\n      parentTeamId\n      __typename\n    }\n    jobPostings {\n      id\n      title\n      teamId\n      locationId\n      locationName\n      workplaceType\n      employmentType\n      secondaryLocations {\n        ...JobPostingSecondaryLocationParts\n        __typename\n      }\n      compensationTierSummary\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment JobPostingSecondaryLocationParts on JobPostingSecondaryLocation {\n  locationId\n  locationName\n  __typename\n}"
            }
            payload_2 = {
                "operationName":"ApiOrganizationFromHostedJobsPageName","variables":{"organizationHostedJobsPageName":company,"searchContext":"JobBoard"},"query":"query ApiOrganizationFromHostedJobsPageName($organizationHostedJobsPageName: String!, $searchContext: OrganizationSearchContext) {\n  organization: organizationFromHostedJobsPageName(\n    organizationHostedJobsPageName: $organizationHostedJobsPageName\n    searchContext: $searchContext\n  ) {\n    ...OrganizationParts\n    __typename\n  }\n}\n\nfragment OrganizationParts on Organization {\n  name\n  publicWebsite\n  customJobsPageUrl\n  hostedJobsPageSlug\n  allowJobPostIndexing\n  theme {\n    colors\n    showJobFilters\n    showTeams\n    showAutofillApplicationsBox\n    logoWordmarkImageUrl\n    logoSquareImageUrl\n    applicationSubmittedSuccessMessage\n    jobBoardTopDescriptionHtml\n    jobBoardBottomDescriptionHtml\n    jobPostingBackUrl\n    __typename\n  }\n  appConfirmationTrackingPixelHtml\n  recruitingPrivacyPolicyUrl\n  activeFeatureFlags\n  timezone\n  __typename\n}"
            }
            response = requests.post(url1, json=payload, headers=headers)
            res = requests.post(url2, json=payload_2, headers=headers)

            if response.ok and res.ok:
                data = json.loads(response.text)
                name = None
                logo = None
                if "organization" in json.loads(res.text)["data"]:
                    name = json.loads(res.text)["data"]["organization"]["name"]
                    logo = json.loads(res.text)["data"]["organization"]["theme"]["logoWordmarkImageUrl"] if json.loads(res.text)["data"]["organization"]["theme"] else None
                else:
                    process_data.remove_not_found(FILE_PATH, company)
                get_results(data, company, name, logo)
                if page % 10 == 0:
                    time.sleep(5)
                else:
                    time.sleep(0.2)
                page += 1
        except Exception as e:
            print(f"=> ashbyhq: Failed to scrape {company}. Error: {e}.")

def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)


if __name__ == "__main__":
    main()
