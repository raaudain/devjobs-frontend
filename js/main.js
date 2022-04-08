const results = document.getElementById("results");
const jobsPerPage = 30;

// For loading animation
for (let i = 0; i < jobsPerPage; i++) {
    const card = document.createElement("div");
    card.className = "card border-0 loading-card mb-5";
    card.style = "height: 14.5rem; width: 25rem;";
    jobs.appendChild(card);
}

const endpoint = "../json/data.json";
const request = new XMLHttpRequest();
const postings = document.getElementById("jobs");
const pagination = document.getElementById("pages");

let data = [];
let filteredData = [];
let currentPage = 1;

request.open("GET", endpoint);
request.onload = () => {
    const response = JSON.parse(request.responseText);

    // Displays loading text when loading
    const loading = document.getElementById("loading");
    results.innerText ? loading.style.display = "block" : loading.style.display = "none";
    // Clears loading cards animation
    if (loading.style.display = "none") postings.textContent = "";

    data = response;
    results.textContent = `Total jobs: ${response.length}`;
    
    renderLimit(response, jobsPerPage, currentPage);
    createDatalist(response);
}
request.send(null);

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
    jobsArray.map((jobInfo) => {
        const jobCard = document.createElement("article");
        const job = document.createElement("div");
        const date = document.createElement("time");
        const posted = document.createElement("span");
        const title = document.createElement("div");
        const company = document.createElement("div");
        const logo = document.createElement("img");
        const location = document.createElement("div");
        const url = document.createElement("a");
        const source = document.createElement("p");
        const sourceURL = document.createElement("a");
        const button = document.createElement("button");

        jobCard.className = "card border border-1 mb-5 shadow zoom fade-in-card";
        jobCard.style = "width: 25rem;";
        job.className = "card-body d-flex flex-column justify-content-between";
        job.style = "height: 100%;";
        posted.className = "card-header";
        title.className = "card-title";
        button.className = "btn btn-primary btn-md";
        button.style = "width: 100%;";
        company.className = "card-subtitle mb-2 text-muted";
        location.className = "card-subtitle mb-2 text-muted";
        source.className = "fw-light text-muted";
        sourceURL.href = jobInfo.source_url+"?referrer=https://devjobs.cc";
        sourceURL.target = "_blank";
        sourceURL.rel = "noopener follow";
        sourceURL.className = "source-url";
        logo.src = jobInfo.company_logo ? jobInfo.company_logo : "../img/logoipsum-logo-35.svg";
        logo.alt = `${jobInfo.company} logo`;
        logo.className = "logo img-thumbnail mb-2";
        url.href = jobInfo.url;
        url.target = "_blank";
        url.rel = "noopener follow";
        url.className = "url";
        const isLocationTrue = jobInfo.location ? ` in ${jobInfo.location}.` : ".";
        const notRemote = `Apply for ${jobInfo.title} job` + isLocationTrue;
        url.title = jobInfo.location && jobInfo.location.toLowerCase() == "remote" ? `Apply for remote ${jobInfo.title} job.` : notRemote;

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        // 1e3 is equal to 1000.  It's supposed to use less resources
        const dt = new Date(jobInfo.timestamp * 1e3);
        const month = dt.getMonth();
        const day = dt.getDate();
        const d = dt.getDay();
        const year = dt.getFullYear();
        const hour = dt.getHours() === 0 ? "12" : dt.getHours();
        const min = `${dt.getMinutes()}`.length < 2 ? "0"+`${dt.getMinutes()}` : dt.getMinutes();
        const sec = `${dt.getSeconds()}`.length < 2 ? "0"+`${dt.getSeconds()}` : dt.getSeconds();
        const t = hour > 12 ? `${hour-12}:${min}:${sec} PM` : `${hour}:${min}:${sec} AM`;
        
        date.textContent = `${days[d]}, ${months[month]} ${day}, ${year}`;
        date.dateTime = `${year}-${month+1}-${day}`;
        posted.textContent = "Posted: ";
        title.textContent = jobInfo.title;
        company.textContent = jobInfo.company;
        location.textContent = jobInfo.location;
        source.textContent = `Source: ${jobInfo.source}`;
        button.textContent = "Apply"
        
        jobs.appendChild(jobCard);
        jobCard.appendChild(posted);
        posted.appendChild(date);
        jobCard.appendChild(job);
        job.appendChild(logo);
        job.appendChild(title);
        if (company) job.appendChild(company);
        if (location) job.appendChild(location);
        job.appendChild(sourceURL);
        url.appendChild(button);
        sourceURL.appendChild(source);
        job.appendChild(url);
    })
}

function createDatalist(data) {
    const form = document.querySelector("#search-input");
    const d1 = document.createElement("datalist");
    
    d1.id = "titles";

    const positions = new Set();
    data.forEach(e => positions.add(e.title.toLowerCase().trim()));

    for (let p of positions) {
        const option = document.createElement("option");
        option.value = p;
        d1.appendChild(option);
    }

    form.after(d1);
}

// datalist()


// Handles infinite scroll
window.addEventListener("scroll", () => {
    const {scrollHeight, scrollTop, clientHeight} = document.documentElement;

    if (!filteredData.length) {
        if (scrollTop + clientHeight > scrollHeight - 300) {
            currentPage++;
            setTimeout(renderLimit(data, jobsPerPage, currentPage), 2000);
        }
    }
    else {
        if (scrollTop + clientHeight > scrollHeight - 300) {
            currentPage++;
            setTimeout(renderLimit(filteredData, jobsPerPage, currentPage), 2000);
        }
    }
});

// Forces top of the page on load
window.addEventListener("load", () => window.scrollTo(0, 0));

// Handles search
const searchBtn = document.getElementById("search-button");
searchBtn.addEventListener("click", event => {
    event.preventDefault();

    const word = document.getElementById("search-input")[0].value;
    const place = document.getElementById("search-input")[1].value;

    if (word.length || place.length) {
        postings.innerHTML = "";
        results.removeAttribute("class");
        currentPage = 1;

        const filtered = [];
        let i = 0;

        while (i < data.length) {
            let title = data[i].title.toLowerCase();
            // If company exists, use company. Else use empty string.
            let company = data[i].company ? data[i].company.toLowerCase() : "";
            // If location exists, use the location. Else location is an empty string.
            let location = data[i].location ? data[i].location.toLowerCase() : "";

            if ((title.includes(word.toLowerCase()) || company.includes(word.toLowerCase())) && location.includes(place.toLowerCase())) {
                filtered.push(data[i]);
            }
            // Looks for "remote" in title and location fields
            else if (place.toLowerCase() === "remote") {
                if (title.includes(word.toLowerCase()) && (title.includes(place.toLowerCase()) || location.includes(place.toLowerCase()))) {
                    filtered.push(data[i]);
                }
            }

            i++;
        }
        
        // filteredData is used for infinite scroll event listener
        filteredData = filtered;

        if (filtered.length) {
            if (word.length && place.length) results.textContent = `Results for ${word}, ${place}: ${filtered.length}`;
            else if (word.length && !place.length) results.textContent = `Results for ${word}: ${filtered.length}`;
            else results.textContent = `Results for ${place}: ${filtered.length}`;
        }
        else {
            if (word.length && place.length) results.textContent = `No results for ${word}, ${place}`;
            else if (word.length && !place.length) results.textContent = `No results for ${word}`;
            else results.textContent = `No results for ${place}`;
        }

        renderLimit(filtered, jobsPerPage, currentPage);
    }
    else {
        results.textContent = "Please enter a keyword.";
        results.setAttribute("class", "search-warning");
    }
});

// Reloads page
// resetBtn.addEventListener("click", () => location.reload());


// const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// console.log(tz);