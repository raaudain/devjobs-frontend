import { currentPage, jobsPerPage } from "./api";
import { renderLimit } from "./render";
import { results } from "./foundation";

const postings = document.getElementById("jobs");
let filteredData = [];


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

// Reloads page
resetBtn.addEventListener("click", () => location.reload());
