import sys
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import ProcessCompanyJobData, use_random_agent


process_data = ProcessCompanyJobData()
FILE_PATH = "src/data/params/ashbyhq.txt"


def get_results(markup):
    soup = BeautifulSoup(markup, "lxml")
    jobs = soup.find_all(class_="_container_j2da7_1")
    img_element_1 = soup.find("img", class_="_navLogoWordmarkImage_5bhg5_104")
    img_element_2 = soup.find("img", class_="_navLogoIconImage_5bhg5_99")
    img_element = img_element_1 if img_element_1 else img_element_2

    if img_element:
        company_name = img_element.get("alt")
        logo = img_element.get("src")
    else:
        title = soup.find("title").text
        company_name = title.replace(" Jobs", "")
        logo = None


    for job in jobs:
        date = datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
        post_date = datetime.timestamp(datetime.strptime(str(date), "%Y-%m-%d %H:%M:%S"))
        job_path = job.get("href")
        apply_url = f"https://jobs.ashbyhq.com{job_path}"
        position = job.find("h3").text
        locations_string = job.find("p").text
        location = locations_string.split("•")[1].strip()
        source_url = f"https://jobs.ashbyhq.com/{company_name.lower()}"
        
        process_data.filter_jobs({
            "timestamp": post_date,
            "title": position,
            "company": company_name,
            "company_logo": logo,
            "url": apply_url,
            "location": location,
            "source": company_name,
            "source_url": source_url,
        })


def get_url(companies: list):
    for company in companies:
        try:
            url = f"https://jobs.ashbyhq.com/{company}"

            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(user_agent=use_random_agent())
                page.goto(url)
                content = page.content()

                if "<title>Jobs</title>" in content:
                    process_data.remove_not_found(FILE_PATH, company)
                else:
                    get_results(content)
                
                browser.close()
        except Exception as e:
            print(f"=> ashbyhq: Failed to scrape https://jobs.ashbyhq.com/{company}. Error: {e}.")

def main():
    companies = process_data.read_list_of_companies(FILE_PATH)
    get_url(companies)



if __name__ == "__main__":
    main()