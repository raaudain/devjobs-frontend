const results = document.getElementById("results");
const jobsPerPage = 8;

// For loading animation
// for (let i = 0; i < jobsPerPage; i++) {
//     const card = document.createElement("div");
//     card.className = "card border-0 loading-card mb-5";
//     card.style = "height: 14.5rem; width: 17rem;";
//     jobs.appendChild(card);
// }

const endpoint = "../json/data.json";
const request = new XMLHttpRequest();
const postings = document.getElementById("jobs");

let data = [];
let filteredData = [];
let currentPage = 1;

request.open("GET", endpoint);
request.onload = () => {
    try {
        const response = JSON.parse(request.responseText);
    
        // Displays loading text when loading
        const loading = document.getElementById("loading");
        results.innerText ? loading.style.display = "block" : loading.style.display = "none";
        // Clears loading cards animation
        if (loading.style.display = "none") postings.textContent = "";
    
        data = response;
        results.textContent = `Total jobs: ${response.length}`;
        
        renderLimit(data, jobsPerPage, currentPage);

        const totalPages = Math.floor(data.length/jobsPerPage);
        const paginationButtons = new PaginationButtons(totalPages);
        
        paginationButtons.render();
        
        paginationButtons.onChange(event => {
            currentPage = event.target.value * jobsPerPage;
            renderLimit(data, jobsPerPage, currentPage);
        });
    }
    catch(err) {
        console.error(err);
    }
}
request.send(null);

function pageNumbers(total, max, current) {
    const half = Math.round(max / 2);
    let to = max;

    // If current page is at the end
    if (current + half >= total) to = total;
    // If current page is greater than half
    else if (current > half) to = current + half;

    let from = to - max;

    return Array.from({length: max}, (_, i) => (i + 1) + from);
}

// Changes number of pages listed
const maxPages = window.innerWidth > 600 ? 10 : 3;

function PaginationButtons(totalPages, maxPageVisible = maxPages, currentPage = 1) {
    let pages = pageNumbers(totalPages, maxPageVisible, currentPage);
    let currentPageBtn = null;

    const buttons = new Map();

    const fragment = document.createDocumentFragment();

    const paginationButtonsContainer = document.createElement("div");
    paginationButtonsContainer.className = "pagination-buttons";

    const disabled = {
        start: () => pages[0] === 1,
        prev: () => currentPage === 1,
        end: () => pages.at(-1) === totalPages,
        next: () => currentPage === totalPages
    }

    const createAndSetupButton = (label = "", cls = "", disabled = false, handleClick) => {
        const button = document.createElement("button");
        button.textContent = label;
        button.className = `page-btn ${cls}`;
        button.disabled = disabled;
        button.addEventListener("click", event => {
            // window.scrollTo(0,0);
            handleClick(event);
            this.update();
            paginationButtonsContainer.value = currentPage;
            paginationButtonsContainer.dispatchEvent(new Event("change"));
        });

        return button;
    }

    const onPageButtonClick = event => currentPage = +event.currentTarget.textContent;
    const onPageButtonUpdate = index => btn => {
        btn.textContent = pages[index];

        if (pages[index] === currentPage)  {
            currentPageBtn.classList.remove("active");
            btn.classList.add("active");
            currentPageBtn = btn;
            currentPageBtn.focus()
        }
    }

    buttons.set(
        createAndSetupButton("start", "start-page", disabled.start(), () => currentPage = 1),
        (btn) => btn.disabled = disabled.start()
    )

    buttons.set(
        createAndSetupButton("prev", "prev-page", disabled.prev(), () => currentPage--),
        (btn) => btn.disabled = disabled.prev()
    )

    pages.forEach((pageNumber, index) => {
        const isCurrentPage = pageNumber === currentPage;
        const button = createAndSetupButton(pageNumber, isCurrentPage ? "active" : "", false, onPageButtonClick);
        if (isCurrentPage) currentPageBtn = button;
        buttons.set(button, onPageButtonUpdate(index))
    })

    buttons.set(
        createAndSetupButton("next", "next-page", disabled.next(), () => currentPage++),
        (btn) => btn.disabled = disabled.next()
    )

    buttons.set(
        createAndSetupButton("end", "end-page", disabled.end(), () => currentPage = totalPages),
        (btn) => btn.disabled = disabled.end()
    )

    buttons.forEach((_, btn) => fragment.appendChild(btn));

    this.render = (container = document.querySelector(".container")) => {
        removeButtons();
        paginationButtonsContainer.appendChild(fragment);
        container.appendChild(paginationButtonsContainer);
    }

    this.update = (newPageNumber = currentPage) => {
        currentPage = newPageNumber;
        pages = pageNumbers(totalPages, maxPageVisible, currentPage);
        buttons.forEach((updateButton, button) => updateButton(button));
    }

    this.onChange = (handler) => paginationButtonsContainer.addEventListener("change", handler);
}


// Sets a limit on the number of job postings rendered
function renderLimit(jobsArray, jobsPerPage, currPage) {
    currPage--; // index 
    postings.innerHTML = ""; // clears job posts

    let start = currPage;
    let end = start + jobsPerPage;
    let paginated = jobsArray.slice(start, end);
    
    renderJobs(paginated);
}

// Renders job postings
function renderJobs(jobsArray) {
    jobsArray.map(jobInfo => {
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
        job.className = "card-body d-flex flex-column justify-content-between";
        // job.style = "height: 100%;";
        posted.className = "card-header";
        title.className = "card-title";
        button.className = "btn btn-primary btn-md";
        button.style = "width: 100%;";
        company.className = "card-subtitle mb-2 text-muted";
        location.className = "card-subtitle mb-2 text-muted";
        source.className = "fw-light text-muted";
        sourceURL.href = jobInfo.source_url+"?ref=https://devjobs.cc";
        sourceURL.target = "_blank";
        sourceURL.rel = "noopener follow";
        sourceURL.className = "source-url";
        logo.src = jobInfo.company_logo ? jobInfo.company_logo : "../img/logoipsum-logo-35.svg";
        logo.alt = `${jobInfo.company} logo`;
        logo.className = "logo img-thumbnail mb-2";
        url.href = jobInfo.url.includes("craig") ? jobInfo.url : jobInfo.url.includes("?") ? jobInfo.url+"&ref=https://devjobs.cc" : jobInfo.url+"?ref=https://devjobs.cc";
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


// Forces top of the page on load
window.addEventListener("load", () => window.scrollTo(0, 0));


// Handles search
const searchBtn = document.getElementById("search-button");
searchBtn.addEventListener("click", event => {
    event.preventDefault();

    const searchInput = document.getElementById("search-input");
    const word = searchInput[0].value;
    const place = searchInput[1].value;

    if (word.length || place.length) {
        currentPage = 1;

        function getData(value) {
            let title = value.title.toLowerCase();
            // If company exists, use company. Else use empty string.
            let company = value.company ? value.company.toLowerCase() : "";
            // If location exists, use the location. Else location is an empty string.
            let location = value.location ? value.location.toLowerCase() : "";

            if ((title.includes(word.toLowerCase()) || company.includes(word.toLowerCase())) && location.includes(place.toLowerCase())) {
                return value;
            }
            // Looks for "remote" in title and location fields
            else if (place.toLowerCase() === "remote") {
                if (title.includes(word.toLowerCase()) && (title.includes(place.toLowerCase()) || location.includes(place.toLowerCase()))) {
                    return value;
                }
            }
        }

        const filtered = data.filter(getData);
        
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

        if (filtered.length <= jobsPerPage) {
            removeButtons();   
        }
        else {
            const totalFilteredPages = Math.floor(filtered.length/jobsPerPage);
            const paginationButtons = totalFilteredPages < 10 ? new PaginationButtons(totalFilteredPages, totalFilteredPages) : new PaginationButtons(totalFilteredPages);
    
            paginationButtons.render();
    
            paginationButtons.onChange(event => {
                currentPage = event.target.value * jobsPerPage
                renderLimit(filtered, jobsPerPage, currentPage);
            });
        }
    }
    else {
        // Resets page only if page has been filtered
        if (filteredData.length) location.reload();
    }
});


// Removes buttons so new ones can render
function removeButtons() {
    let list = [...document.getElementsByClassName("pagination-buttons")]
    if (list.length) list[0].remove();    
}