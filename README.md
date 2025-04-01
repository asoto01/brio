# Brio MealTime Automation 


## MealTime Scripts 
The purpose for these MealTime scripts are to save time on the ASP based web applicaiton. There are not batch uploads for entering multiple IDs and thus a user has to enter them manually in the UI clicking various buttons. The scripts allow you to automate it either with Python or with Javascript. The Python solution requires running a selenium server and then running a Python script. The Javascript solution can be ran on the web browser itself. One solution is requires more time to setup but can read from a csv file where the other requires less time to set up but you have to manually paste the Ids into the code. 
### Directions for Python Solution
1. Open up terminal, use tmux to split panes and run source steps.txt. This will open up a Chrome instance for testing. This assumes you have the proper libraries set up.
2. Once Chrome is up, log into MealTime and go into backtracking POS and configure the desired meal and toggle speed mode.
3. Ensure you have mealtime_data.csv set up in the working directory where automate.py.
4. Run auotmate.py
 

### Directions for Javascriopt Solution
Under js_scripts folder you can find scripts to automate the process from the web console.
#### Transactions
For transactions paste to charge students that are in queue during POS.
#### Backtrack
1. Log into MealTime and go into backtracking POS and configure the desired meal and toggle speed mode.
2. Enter Ids into code.
3. Run code from web console.
