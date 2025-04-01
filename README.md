# Brio MealTime Automation

Tools in Python and JavaScript to automate MealTime tasks with vigor! Streamline manual ID entry in the ASP-based MealTime web application, where no batch upload exists.

## Overview
The **Brio MealTime Automation** suite tackles the inefficiency of manual ID entry in MealTime’s UI:
- **JavaScript Solution**: Runs directly in the browser console, ideal for quick setup with manual ID pasting.
- **Python Solution**: Uses Selenium for automation, reads IDs from a CSV, but requires more setup (e.g., Chrome debugging session).

Both tools transform a tedious, seconds-per-ID process into a sub-second workflow.

## Efficiency Spotlight
These scripts revolutionize MealTime efficiency:
- **Before**: Manual entry takes 3-10 seconds per ID (best-case: 3s with skilled copy-pasting; worst-case: 10s).
- **After**: Optimized to **~0.6-0.7s per ID** (JavaScript and Python), a reduction of 77-93% per input.
- **Real-World Impact** (368 meals):
  - **Old Way (10s/ID)**: 3,680s (~61 minutes).
  - **New Way (0.7s/ID)**: 257s (~4.3 minutes).
  - **Time Saved**: ~57 minutes.
  - **Efficiency Boost**: **~750-1,400% faster** (3s to 0.7s = 4.3x, 10s to 0.7s = 14.3x).

## JavaScript Automation
Scripts in `js_scripts/` run directly in the MealTime web console.

### Transactions
Automate charging queued students during POS:
1. Open MealTime in Chrome.
3. Open the console (F12 > Console) and paste/run the script.

### Backtrack
Automate backtracking POS:
1. Log into MealTime, navigate to Backtracking POS, set the meal, and enable Speed Mode.
2. Edit `js_scripts/backtrack.js`, pasting IDs into `IDS_TO_PROCESS`.
3. Run in the console.

## Python Automation
The `automate.py` script in the root directory uses Selenium:
1. **Setup**:
   - Install dependencies: `pip install selenium pandas webdriver-manager`.
   - Open a terminal, split with `tmux`, and run `source steps.txt` to launch Chrome with debugging (`--remote-debugging-port=9222`).
2. **Run**:
   - Log into MealTime, go to Backtracking POS, configure the meal, and enable Speed Mode.
   - Ensure `mealtime_data.csv` (with an "ID" column) is in the same directory as `automate.py`.
   - Execute: `python automate.py`.

