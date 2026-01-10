from furl import furl

url1 = "https://jobs.ashbyhq.com/Lynk?gh_src=One+Way+Ventures+job+board"
f = furl(url1)
print(f.path.segments[0])