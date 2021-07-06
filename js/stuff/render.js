

// Sets a limit on the number of job postings rendered
export function renderLimit(jobsArray, jobsPerPage, currPage) {
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