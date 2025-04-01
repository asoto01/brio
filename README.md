# Brio MealTime Automation 

Tools in Python or Javascript to automate MealTime Tasks with vigor!

## MealTime Scripts 
The purpose for these MealTime scripts are to save time on the ASP based web applicaiton. A batch upload for Ids does not exist in the system and thus a user has to enter them manually in the UI. The scripts allow you to automate it either with Python or with Javascript. The Python solution requires running a selenium server and then running a Python script. The Javascript solution can run on the web browser itself. The python solution requires more time to setup but can read from a csv file where the other requires less time to set up but you have to manually paste the Ids into the code. 

## Efficiency Spotlight: JavaScript Automation 
The JavaScript solution is a game-changer for efficiency:
- **Before**: A skilled typist might take 3-10 seconds per meal input (best-case: 3 seconds with efficient copy-pasting, worst-case: 10 seconds).
- **After**: Optimized to **<0.5 seconds per input**, a reduction of over 83-95% in processing time.
- **Real-World Impact**: For 368 meals:
  - **Old Way (10s/input)**: 368 × 10 = 3,680 seconds (~61 minutes, or ~1 hour).
  - **New Way (0.5s/input)**: 368 × 0.5 = 184 seconds (~3 minutes).
  - **Time Saved**: ~58 minutes per 368 meals.
  - **Efficiency Increase**: Up to **2,000% faster** (from 10s to 0.5s, a 20x speedup), or at minimum **600% faster** (from 3s to 0.5s, a 6x speedup).

### Directions for Javascript Automation 
Under js_scripts folder you can find scripts to automate the process from the web console.

#### Transactions
For transactions run the code in the web console to charge students that are in queue during POS.

#### Backtrack
1. Log into MealTime and go into backtracking POS and configure the desired meal and toggle speed mode.
2. Enter Ids into code.
3. Run code from web console.

### Directions for Python Automation 
1. Open up terminal, use tmux to split panes and run source steps.txt. This will open up a Chrome instance for testing. This assumes you have the proper libraries set up.
2. Once Chrome is up, log into MealTime and go into backtracking POS and configure the desired meal and toggle speed mode.
3. Ensure you have mealtime_data.csv set up in the working directory where automate.py exists.
4. Run auotmate.py
 
