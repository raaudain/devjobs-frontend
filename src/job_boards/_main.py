import random, sys
from datetime import datetime
sys.path.insert(0, ".")
from src.job_boards.tools import CreateJson
from src.job_boards import amazon, ashbyhq, builtin, dailyremote, diversifytech, eightfold, fullstackjob, greenhouse_io, hireart, jobvite, lever_co, nbc, nintendo, polymer, remote_co, remoteok, smartrecruiters, usajobs, weworkremotely, workable, workwithindies, craigslist, breezyhr, bamboohr


def main():
    create_json = CreateJson()

    f = open("src/data/params/craigslist.txt", "r")
    locations = [location.strip() for location in f]
    f.close()

    w = open("src/data/params/workable.txt", "r")
    work = [l.strip() for l in w]
    random.shuffle(work)
    w.close()

    g = open("src/data/params/greenhouse_io.txt", "r")
    green = [l.strip() for l in g]
    g.close()

    # w_half = len(work)//2
    # workable1 = work[:w_half]
    # workable2 = work[w_half:]

    # m = open(f"src/data/params/miami.txt", "r")
    # miamis = [miami.strip() for miami in m]
    # m.close()
    print("=> Scanning job boards")
    start = datetime.now()
    # bamboohr.main()
    # breezyhr.main()
    lever_co.main()
    usajobs.main()
    workable.get_url(work[::5])
    diversifytech.main()
    polymer.main()
    nbc.main()
    workable.get_url(work[1::5])
    smartrecruiters.main()
    greenhouse_io.get_url(green[::2])
    craigslist.get_url(locations)
    jobvite.main()
    eightfold.main()
    workable.get_url(work[2::5])
    craigslist.get_url_it(locations)
    greenhouse_io.get_url(green[1::2])
    ashbyhq.main()
    nintendo.main()
    hireart.main()
    amazon.main()
    craigslist.get_url_web(locations)
    workable.get_url(work[3::5])
    # key_values.main()
    workwithindies.main()
    weworkremotely.main()
    fullstackjob.main()
    remote_co.main()
    remoteok.main()
    craigslist.get_url_network(locations)
    workable.get_url(work[4::5])
    dailyremote.main()
    builtin.main()
    create_json.create_temp_file()
    create_json.create_file()

    print("=> Done")
    print(f"=> Total time: {datetime.now() - start}")


if __name__ == "__main__":
    main()