#!/user/bin/env python3

import sys, subprocess
sys.path.insert(0, ".")
from src.job_boards._main import main as scrap_sites
from run_params_updater import main as params_updater


def submit_to_gitlab():
    cmd = "git add . && git commit -m '$(date)'"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)

if __name__ == "__main__":
    # params_updater()
    scrap_sites()
    submit_to_gitlab()
