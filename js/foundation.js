export const body = document.querySelector("body");
const container = document.createElement("div");
const h1 = document.createElement("h1");
const headline = document.createElement("p");
const form = document.createElement("form")
const input = document.createElement("input");
const locationInput = document.createElement("input");
const button = document.createElement("button");
const reset = document.createElement("button");
const jobs = document.createElement("div");
const linebreak = document.createElement("br");
export const results = document.createElement("div");


container.className = "container";

h1.className = "display-1 fw-bold";
h1.textContent = "DevJobs";

headline.className = "fs-2";
headline.textContent = "A job board aggregator for tech people.";

jobs.id = "jobs";
jobs.className = "d-flex justify-content-between flex-wrap";

form.id = "search-input";
form.className = "input-group mb-3";

input.placeholder = "Enter job title";
input.type = "text";
input.className = "form-control";

locationInput.placeholder = "Enter location";
locationInput.type = "text";
locationInput.className = "form-control";

button.className = "btn btn-primary btn-lg";
button.id = "search-button";
button.type = "submit"
button.textContent = "Search";

reset.className = "btn btn-secondary btn-lg";
reset.id = "reset-button";
reset.type = "reset";
reset.textContent = "Reset";


body.appendChild(container);
container.appendChild(h1);
container.appendChild(headline)
container.appendChild(form);
form.appendChild(input);
form.appendChild(locationInput);
form.appendChild(button);
form.appendChild(reset);
container.appendChild(results);
results.after(linebreak);
container.appendChild(jobs);
