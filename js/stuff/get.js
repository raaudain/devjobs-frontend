import { renderLimit } from "./render";
import { results } from "./foundation";

const endpoint = "https://raw.githubusercontent.com/raaudain/devjobs/main/server/data/data.json";
const request = new XMLHttpRequest();
const jobsPerPage = 30;

export let data = [];
export let currentPage = 1;

request.open("GET", endpoint);
request.onload = () => {
    const response = JSON.parse(request.responseText);
    
    data = response;
    results.textContent = `Results: ${response.length}`;
    
    renderLimit(response, jobsPerPage, currentPage);
}
request.onerror = () => console.warn("Request error...");
request.send();
