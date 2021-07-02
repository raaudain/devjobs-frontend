const body = document.querySelector("body");
const container = document.createElement("div");
const h1 = document.createElement("h1");
const form = document.createElement("form")
const input = document.createElement("input");
const button = document.createElement("button");
const jobs = document.createElement("div");
const linebreak = document.createElement("br");
const results = document.createElement("div");

container.className = "container";

jobs.id = "jobs";
jobs.className = "d-flex justify-content-between flex-wrap";

form.id = "search-input";
form.className = "input-group mb-3";

input.placeholder = "Enter job title";
input.type = "text";
input.className = "form-control"

button.className = "btn btn-outline-dark btn-lg";
button.id = "search-button";
button.type = "button"
button.textContent = "Search"

h1.className = "h1";
h1.textContent = "DevJobs";

body.appendChild(container);
container.appendChild(h1);
form.appendChild(input);
form.appendChild(button);
container.appendChild(form);
container.appendChild(results);
results.after(linebreak);
container.appendChild(jobs);


const endpoint = "https://raw.githubusercontent.com/raaudain/devjobs/main/server/data/data.json";
const request = new XMLHttpRequest();
const jobsPerPage = 20;
const postings = document.getElementById("jobs");
const pagination = document.getElementById("pages");

let data = [];
let filteredData = [];
let currentPage = 1;

request.open("GET", endpoint);
request.onload = () => {
    const response = JSON.parse(request.responseText);
    
    data = response;
    results.textContent = `Results: ${response.length}`;
    
    renderLimit(response, jobsPerPage, currentPage);
}
request.onerror = () => console.warn("Request error...");
request.send();

// Sets a limit on the number of job postings rendered
function renderLimit(jobsArray, jobsPerPage, currPage) {
    currPage--;

    let start = jobsPerPage * currPage;
    let end = start + jobsPerPage;
    let paginated = jobsArray.slice(start, end);

    renderJobs(paginated);
}

// Renders job postings
function renderJobs(jobsArray) {
    jobsArray.map(jobInfo => {

        const jobCard = document.createElement("div");
        const job = document.createElement("div");
        const date = document.createElement("p")
        const title = document.createElement("h5");
        const company = document.createElement("h6");
        const location = document.createElement("h6");
        const linebreak = document.createElement("br");
        const url = document.createElement("a");
        const source = document.createElement("p");
        const sourceURL = document.createElement("a");
        const button = document.createElement("button");

        jobCard.className = "card border border-3 mb-5";
        jobCard.style = "width: 25rem;"

        job.className = "card-body";
        // job.style.backgroundColor = "#ffffed";

        date.className = "card-header";

        title.id = "title";
        title.className = "card-title";

        button.className = "btn btn-dark btn-md"
        button.style = "width: 100%;"

        company.id = "company";
        company.className = "card-subtitle mb-2 text-muted";

        location.id = "location";
        location.className = "card-subtitle mb-2 text-muted";

        url.className = "url";

        source.className = "fw-light text-muted"

        sourceURL.className = "url text-decoration-none";
        // linebreak.id = i;

        url.href = jobInfo.url;
        url.target = "_blank";
        url.rel = "noopener noreferrer";

        sourceURL.href = jobInfo.source_url;
        sourceURL.target = "_blank";
        sourceURL.rel = "noopener noreferrer";
        
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const d = new Date(jobInfo.timestamp * 1000);
        const month = d.getMonth();
        const day = d.getDate();
        const t = d.getDay();
        const year = d.getFullYear();
        const hour = d.getHours();
        const min = d.getMinutes();
        const time = d.toString("hh:mm tt")

        date.textContent = `Posted: ${days[t]} ${months[month]} ${day}, ${year}`;
        title.textContent = `${jobInfo.title}`;
        company.textContent = `${jobInfo.company}`;
        location.textContent = `${jobInfo.location}`;
        source.textContent = `Source: ${jobInfo.source}`;
        button.textContent = "Apply"
        
        jobs.appendChild(jobCard);
        jobCard.appendChild(date);
        jobCard.appendChild(job)
        job.appendChild(title);
        
        if (company.textContent != "None" || company.textContent != null) {
            job.appendChild(company);
        }
        if (location.textContent != "None" || location.textContent != null) {
            job.appendChild(location);
        }

        job.appendChild(sourceURL);
        url.appendChild(button);
        sourceURL.appendChild(source);
        job.appendChild(url);
        // job.after(linebreak);
    })
}


const searchBtn = document.getElementById("search-button");
const formControl = document.getElementById("search-input");

// Handles infinite scroll
window.addEventListener("scroll", () => {
    const {scrollHeight, scrollTop, clientHeight} = document.documentElement;

    if (!filteredData.length) {
        if (scrollTop + clientHeight > scrollHeight - 100) {
            currentPage++;
            setTimeout(renderLimit(data, jobsPerPage, currentPage), 2000);
        }
    }
    else {
        if (scrollTop + clientHeight > scrollHeight - 10) {
            currentPage++;
            setTimeout(renderLimit(filteredData, jobsPerPage, currentPage), 2000);
        }
    }
});

// Forces top of the page on load
window.addEventListener("load", () => window.scrollTo(0, 0));

// Handles search
formControl.addEventListener("keypress", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBtn.click();
    }
});

searchBtn.addEventListener("click", event => {
    event.preventDefault();
    postings.innerHTML = "";
    currentPage = 1;

    const word = document.getElementById("search-input")[0].value.toLowerCase();
    const filtered = [];
    let i = 0;

    while (i < data.length) {
        let title = data[i].title.toLowerCase();

        if (title.includes(word)) {
            filtered.push(data[i]);
        }

        i++;
    }

    filteredData = filtered;
    results.textContent = `Results: ${filtered.length}`;

    renderLimit(filtered, jobsPerPage, currentPage);
});