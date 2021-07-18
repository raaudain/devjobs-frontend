
const body = document.querySelector("body");
const container = document.createElement("div");
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
const headline = document.createElement("p");
const loading = document.createElement("div");
const loader = document.createElement("img");
const home = document.createElement("a");

container.className = "container";

h1.textContent = "DevJobs";
h1.className = "display-1 fw-bold";

home.className = "text-decoration-none";
home.href = "/";

headline.className = "fs-2";
headline.textContent = "A job board aggregator for tech people.";

search.className = "fas fa-search";

jobs.id = "jobs";
// jobs.className = "d-flex justify-content-between flex-wrap";

form.id = "search-input";
form.className = "input-group mb-3";

input.placeholder = "Enter job title or company";
input.type = "text";
input.className = "form-control";

locationInput.placeholder = "Enter location";
locationInput.type = "text";
locationInput.className = "form-control";

button.className = "btn btn-primary btn-lg";
button.id = "search-button";
button.type = "submit";
button.textContent = "Search";

reset.className = "btn btn-secondary btn-lg";
reset.id = "reset-button";
reset.type = "reset";
reset.textContent = "Reset";

loading.id = "loading";

loader.alt = "Loading...";
loader.src = "../img/loader.gif";

body.appendChild(container);
container.appendChild(home);
home.appendChild(h1);
container.appendChild(headline);
container.appendChild(form);
form.appendChild(input);
form.appendChild(locationInput);
form.appendChild(button);
// form.appendChild(reset);
container.appendChild(loading);
loading.appendChild(loader);
container.appendChild(results);
results.after(linebreak);
container.appendChild(jobs);

// const endpoint = "https://devjobsapp-backend.herokuapp.com/data/data.json";
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

    // Displays image when loading
    results.innerText ? loading.style.display = "block" : loading.style.display = "none";

    data = response;
    results.textContent = `Total jobs: ${response.length}`;
    
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
    jobsArray.map((jobInfo, i) => {
        const jobCard = document.createElement("div");
        const job = document.createElement("div");
        const date = document.createElement("p")
        const title = document.createElement("h5");
        const company = document.createElement("h6");
        const location = document.createElement("h6");
        const url = document.createElement("a");
        const source = document.createElement("p");
        const sourceURL = document.createElement("a");
        const button = document.createElement("button");

        jobCard.className = "card border border-1 mb-5 shadow";
        jobCard.id = `card_${i+1}`;
        jobCard.style = "width: 25rem";
        
        job.className = "card-body d-flex flex-column justify-content-between";
        job.style = "height: 100%";

        date.className = "card-header";

        title.className = "card-title";

        button.className = "btn btn-primary btn-md";
        button.style = "width: 100%;"

        company.className = "card-subtitle mb-2 text-muted";

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

        // 1e3 is equal to 1000.  It's supposed to use less resources
        const dt = new Date(jobInfo.timestamp * 1e3);
        const month = dt.getMonth();
        const day = dt.getDate();
        const t = dt.getDay();
        const year = dt.getFullYear();
        const hour = dt.getHours() === 0 ? "12" : dt.getHours();
        const min = `${dt.getMinutes()}`.length < 2 ? "0"+`${dt.getMinutes()}` : dt.getMinutes();
        const sec = `${dt.getSeconds()}`.length < 2 ? "0"+`${dt.getSeconds()}` : dt.getSeconds();
        const time = hour > 12 ? `${hour-12}:${min}:${sec} PM` : `${hour}:${min}:${sec} AM`;

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
        if (company) job.appendChild(company);
        if (location) job.appendChild(location);
        job.appendChild(sourceURL);
        url.appendChild(button);
        sourceURL.appendChild(source);
        job.appendChild(url);
        // job.after(linebreak);
    })
}


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
        if (scrollTop + clientHeight > scrollHeight - 100) {
            currentPage++;
            setTimeout(renderLimit(filteredData, jobsPerPage, currentPage), 2000);
        }
    }
});

// Forces top of the page on load
window.addEventListener("load", () => window.scrollTo(0, 0));

const searchBtn = document.getElementById("search-button");
const resetBtn = document.getElementById("reset-button");

// Handles search
searchBtn.addEventListener("click", event => {
    event.preventDefault();
    postings.innerHTML = "";
    currentPage = 1;

    const word = document.getElementById("search-input")[0].value;
    const place = document.getElementById("search-input")[1].value;

    const filtered = [];
    let i = 0;


    while (i < data.length) {
        let title = data[i].title.toLowerCase();
        let company = data[i].company.toLowerCase();
        // If location exists, use the location. Else location is an empty string.
        let location = data[i].location ? data[i].location.toLowerCase() : "";

        if ((title.includes(word.toLowerCase()) || company.includes(word.toLowerCase())) && location.includes(place.toLowerCase())) {
            filtered.push(data[i]);
        }

        i++;
    }
    
    
    filteredData = filtered;

    if (filteredData.length === data.length) {
        results.textContent = `Total jobs: ${filtered.length}`;
    }
    else {
        if (filtered.length) {
            if (word.length && place.length) {
                results.textContent = `Results for "${word}, ${place}": ${filtered.length}`;
            }
            else if (word.length && !place.length){
                results.textContent = `Results for "${word}": ${filtered.length}`;
            }
            else {
                results.textContent = `Results for "${place}": ${filtered.length}`;
            }
        }
        else {
            if (word.length && place.length) {
                results.textContent = `No results for "${word}, ${place}"`;
            }
            else if (word.length && !place.length){
                results.textContent = `No results for "${word}"`;
            }
            else {
                results.textContent = `No results for "${place}"`;
            }
        }
    }

    // Clears inputs
    document.getElementById("search-input")[0].value = "";
    document.getElementById("search-input")[1].value = "";

    renderLimit(filtered, jobsPerPage, currentPage);
});

// Reloads page
// resetBtn.addEventListener("click", () => location.reload());


// const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// console.log(tz);