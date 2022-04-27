const results = document.getElementById("results");
const jobs = document.getElementById("jobs");
const jobsPerPage = 8;

// For loading animation
for (let i = 0; i < jobsPerPage; i++) {
    const card = document.createElement("div");
    card.className = "card border-0 loading-card mb-5";
    jobs.appendChild(card);
}

const endpoint = "../json/data.json";
const request = new XMLHttpRequest();

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
        if (loading.style.display = "none") jobs.textContent = "";
    
        data = response;
        results.textContent = `Total jobs: ${response.length}`;
        
        renderLimit(data, jobsPerPage, currentPage);

        const totalPages = Math.floor(data.length/jobsPerPage);
        const paginationButtons = new PaginationButtons(totalPages);
        
        paginationButtons.render();
        
        paginationButtons.onChange(event => {
            currentPage = event.target.value * jobsPerPage - (jobsPerPage - 1);
            renderLimit(data, jobsPerPage, currentPage);
        });
    }
    catch(err) {
        console.error(err);
    }
}
request.send(null);

const input = document.querySelector("input");
const matchList = document.getElementById("autocomplete");

const updateText = debounce(text => {
    const matches = data.filter(v => {
        const regex = new RegExp(`${text}`, "gi");
        if (text.length > 2) return v.title.match(regex);
    });
    outputHTML(matches);
});

function outputHTML(html) {
    const output = html.map(match => 
        `<option value="${match.title}">
            ${match.title}
        </option>`
    ).join("")

    // matchList.innerHTML = output;
}

input.addEventListener("input", event => updateText(event.target.value));

function debounce(cb, delay = 1000) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}

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
    jobs.innerHTML = ""; // clears job posts

    let start = currPage;
    let end = start + jobsPerPage;
    let paginated = jobsArray.slice(start, end);
    
    renderJobs(paginated);
}

// Renders job postings
function renderJobs(jobsArray) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function getDateTime(item) {
        const dt = new Date(item.timestamp * 1e3);
        const month = dt.getMonth();
        const day = dt.getDate();
        const year = dt.getFullYear();
        return `${year}-${month+1}-${day}`;
    }
    
    function getDate(item) {
        const dt = new Date(item.timestamp * 1e3);
        const month = dt.getMonth();
        const day = dt.getDate();
        const d = dt.getDay();
        const year = dt.getFullYear();
        return `${days[d]}, ${months[month]} ${day}, ${year}`;
    }
    
    function generateTitle(item) {
        const isLocationTrue = item.location ? ` in ${item.location}.` : ".";
        const notRemote = `Apply for ${item.title} job` + isLocationTrue;
        return item.location && item.location.toLowerCase() == "remote" ? `Apply for remote ${item.title} job.` : notRemote;
    }

    const jobCards = jobsArray.map(jobInfo => 
        `<article class="card border border-1 mb-5 shadow zoom ">
            <span class="card-header fade-in-card">
                Posted: 
                <time datetime="${getDateTime(jobInfo)}">
                    ${getDate(jobInfo)}
                </time>
            </span>
            <div class="card-body d-flex flex-column justify-content-between fade-in-card">
                <img class="logo img-thumbnail mb-2" src="${jobInfo.company_logo && jobInfo.company_logo !== '/img/v1.1/logos/jazzhr-logo.png' ? jobInfo.company_logo : '../img/logoipsum-logo-35.svg'}" alt="${jobInfo.company} logo" />
                <div class="card-title">
                    <span title="${limitString(jobInfo.title).includes("...") ? jobInfo.title : ''}">
                        ${limitString(jobInfo.title)}
                    </span>
                </div>
                <div class="card-subtitle mb-2 text-muted" title="${jobInfo.company && limitString(jobInfo.company).includes("...") ? jobInfo.company : ''}">
                    ${jobInfo.company ? limitString(jobInfo.company) : ""}
                </div>
                <div class="card-subtitle mb-2 text-muted">
                    <span title="${jobInfo.location && limitString(jobInfo.location).includes("...") ? jobInfo.location : ''}">
                        ${jobInfo.location ? limitString(jobInfo.location) : ""}
                    </span>
                </div>
                <a class="source-url" href="${jobInfo.source_url}" target="_blank" rel="noopener follow" title="${jobInfo.source.length !== limitString(jobInfo.source).length ? jobInfo.source : ''}">
                    <p class="fw-light text-muted">Source: ${limitString(jobInfo.source)}</p>
                </a>
                <a class="url" href="${jobInfo.url}" target="_blank" rel="noopener follow" title="${generateTitle(jobInfo)}">
                    <button class="btn btn-primary btn-md" style="width: 100%">Apply</button>
                </a>
            </div>
        </article>`
    ).join("");

    jobs.innerHTML = jobCards;
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
                currentPage = event.target.value * jobsPerPage - (jobsPerPage - 1);
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
    let list = [...document.getElementsByClassName("pagination-buttons")];
    if (list.length) list[0].remove();    
}

// Limit characters
function limitString(str) {
    const limit = 40;
    const { length: len } = str;
    if (limit < len) return str.slice(0, limit) + "...";
    else return str;
}
