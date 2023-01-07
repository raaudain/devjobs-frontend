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

        const totalPages = Math.ceil(data.length/jobsPerPage);
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


function pageNumbers(total, max, current) {
    const half = Math.ceil(max / 2);
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

    // Limits characters
    function limitString(str) {
        const limit = 40;
        const { length: len } = str;
        if (limit < len) return str.slice(0, limit) + "...";
        else return str;
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
                    <button class="btn btn-primary btn-md">Apply</button>
                </a>
            </div>
        </article>`
    ).join("");

    jobs.innerHTML = jobCards;
}

// Forces top of the page on load
window.addEventListener("load", () => window.scrollTo(0, 0));

// Handles filter
const filterJobs = (debounce(() => {
    const searchInput = document.getElementById("search-input");
    const word = searchInput[0].value;
    const place = searchInput[1].value;

    currentPage = 1;

    function parseString(query, value) {
        query = query.split(" ").every(keyword => value.includes(keyword.toLowerCase()));
        return query;
    }

    function getData(value) {
        let title = value.title.toLowerCase();
        // If company, source, or location exists, use input. Else use empty string.
        let company = value.company ? value.company.toLowerCase() : "";
        let source = value.source ? value.source.toLowerCase() : "";
        let location = value.location ? value.location.toLowerCase() : "";
        
        const titleQuery = parseString(word, title);
        const companyQuery = parseString(word, company);
        const sourceQuery = parseString(word, source);
        const locationQuery = parseString(place, location);

        if ((titleQuery || companyQuery || sourceQuery) && locationQuery) return value;
    }

    const filtered = data.filter(getData);

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
        const totalFilteredPages = Math.ceil(filtered.length/jobsPerPage);
        const paginationButtons = totalFilteredPages < 10 ? new PaginationButtons(totalFilteredPages, totalFilteredPages) : new PaginationButtons(totalFilteredPages);

        paginationButtons.render();

        paginationButtons.onChange(event => {
            currentPage = event.target.value * jobsPerPage - (jobsPerPage - 1);
            renderLimit(filtered, jobsPerPage, currentPage);
        });
    }
}));

input1.addEventListener("input", event => filterJobs(event.target.value));
input2.addEventListener("input", event => filterJobs(event.target.value));

// Delays filtering
function debounce(cb, delay = 600) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}

// Removes buttons so new ones can render
function removeButtons() {
    let list = [...document.getElementsByClassName("pagination-buttons")];
    if (list.length) list[0].remove();    
}

const icon = document.querySelector("i");

// Checks if localStorage contains "dark-mode". If not, go with system preference.
if (localStorage.getItem("dark-mode") === null) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("dark-mode", true);
        icon.classList = "ri-sun-fill";
    }
}
else if (localStorage.getItem("dark-mode") == "true") {
    document.documentElement.setAttribute("dark-mode", true);
    icon.classList = "ri-sun-fill";
}


icon.addEventListener("click", event =>  {
    event.preventDefault();
    
    if (icon.className == "ri-sun-fill") {
        icon.classList = "ri-moon-fill";
        document.documentElement.removeAttribute("dark-mode");
    }
    else if (icon.className == "ri-moon-fill") {
        icon.classList = "ri-sun-fill";
        document.documentElement.setAttribute("dark-mode", true);
    }

    if (document.documentElement.hasAttribute("dark-mode")) {
        localStorage.setItem("dark-mode", true);
    }
    else {
        localStorage.setItem("dark-mode", false);
    }
})

