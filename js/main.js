const body = document.querySelector("body");
const container = document.createElement("div");
const fluid = document.createElement("div");
const h1 = document.createElement("h1");
const form = document.createElement("form")
const input = document.createElement("input");
const locationInput = document.createElement("input");
const button = document.createElement("button");
const reset = document.createElement("button");
const search = document.createElement("i");
const jobs = document.createElement("div");
const linebreak = document.createElement("br");
const results = document.createElement("div");
const jumbotron = document.createElement("div");
const jumboH1 = document.createElement("h1");
const headline = document.createElement("p");

container.className = "container";

fluid.className = "jumbotron container";
jumbotron.className = "jumbotron";

jumboH1.textContent = "DevJobs"
jumboH1.className = "display-1 fw-bold";

headline.className = "fs-2"
headline.textContent = "A job board aggregator for tech people."

search.className = "fas fa-search"

jobs.id = "jobs";
jobs.className = "d-flex justify-content-between flex-wrap";

form.id = "search-input";
form.className = "input-group mb-3";

input.placeholder = "Enter job title";
input.type = "text";
input.className = "form-control"

locationInput.placeholder = "Enter location";
locationInput.type = "text";
locationInput.className = "form-control"

button.className = "btn btn-primary btn-lg";
button.id = "search-button";
button.type = "submit"
button.textContent = "Search";

reset.className = "btn btn-secondary btn-lg";
reset.id = "reset-button";
reset.type = "reset";
reset.textContent = "Reset";

h1.className = "h1";
h1.textContent = "DevJobs";

body.appendChild(fluid);
body.appendChild(container);

fluid.appendChild(jumbotron)
// fluid.appendChild(bg)
jumbotron.appendChild(jumboH1)
jumbotron.appendChild(headline)

// container.appendChild(h1);
container.appendChild(form);
form.appendChild(input);
form.appendChild(locationInput);
form.appendChild(button);
form.appendChild(reset);
// button.appendChild(search)
container.appendChild(results);
results.after(linebreak);
container.appendChild(jobs);


const endpoint = "https://raw.githubusercontent.com/raaudain/devjobs/main/server/data/data.json";
const request = new XMLHttpRequest();
const jobsPerPage = 30;
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

        jobCard.className = "card border border-1 mb-5 shadow";
        jobCard.style = "width: 25rem";
        
        job.className = "card-body d-flex flex-column justify-content-between";
        job.style = "height: 100%";
        // job.style = "height: 15rem";


        date.className = "card-header";

        title.id = "title";
        title.className = "card-title";

        button.className = "btn btn-primary btn-md";
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
        title.textContent = jobInfo.title;
        company.textContent = jobInfo.company;
        location.textContent = jobInfo.location;
        source.textContent = `Source: ${jobInfo.source}`;
        button.textContent = "Apply"
        
        jobs.appendChild(jobCard);
        jobCard.appendChild(date);
        jobCard.appendChild(job)
        job.appendChild(title);
        
        if (company !== null) {
            job.appendChild(company);
        }
        if (location !== null) {
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
const resetBtn = document.getElementById("reset-button");


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
searchBtn.addEventListener("click", event => {
    event.preventDefault();
    postings.innerHTML = "";
    currentPage = 1;

    const word = document.getElementById("search-input")[0].value.toLowerCase();
    const place = document.getElementById("search-input")[1].value.toLowerCase();

    const filtered = [];
    let i = 0;

    while (i < data.length) {
        let title = data[i].title.toLowerCase();
        // If location exists, use the location. Else location is an empty string.
        let location = data[i].location ? data[i].location.toLowerCase() : "";

        if (title.includes(word) && location.includes(place)) {
            filtered.push(data[i]);
        }

        i++;
    }

    filteredData = filtered;
    results.textContent = `Results: ${filtered.length}`;

    renderLimit(filtered, jobsPerPage, currentPage);
});

// Clears input
resetBtn.addEventListener("click", event => {
    event.preventDefault();
    postings.innerHTML = "";
    currentPage = 1;

    // Sets input value to empty string
    const word = document.getElementById("search-input")[0].value = "";
    const place = document.getElementById("search-input")[1].value = "";
    
    const filtered = [];
    let i = 0;

    while (i < data.length) {
        let title = data[i].title.toLowerCase();
        let location = data[i].location ? data[i].location.toLowerCase() : "";
        
        if (title.includes(word) && location.includes(place)) {
            filtered.push(data[i]);
        }

        i++;
    }

    
    filteredData = filtered;
    results.textContent = `Results: ${filtered.length}`;
    
    renderLimit(filtered, jobsPerPage, currentPage);
});