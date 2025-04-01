import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- Configuration ---
file_path = "mealtime_data.csv"
WAIT_TIMEOUT = 10  # Max seconds to wait for elements (safety net)
POLL_FREQUENCY = 0.1  # Check every 100ms (like JS's 125ms)
SHORT_DELAY = 0.125  # 125ms delay to match JS timing

# Step 1: Read the CSV file
df = pd.read_csv(file_path, skiprows=2, header=0)
ids = df["ID"].tolist()
print(f"Found {len(ids)} IDs: {ids[:5]}...")

# Step 2: Connect to existing Chrome session
options = Options()
options.add_experimental_option("debuggerAddress", "localhost:9222")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
print("Connected to Chrome session")
print(f"Current URL: {driver.current_url}")

# Step 3: Automate search for each ID
for id_value in ids:
    try:
        # Find and clear the search bar
        search_bar = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.element_to_be_clickable((By.ID, "customerSearchText"))
        )
        search_bar.clear()
        driver.implicitly_wait(SHORT_DELAY)  # Minimal wait for UI to catch up

        # Enter the ID and trigger search
        search_bar.send_keys(str(id_value))
        search_bar.send_keys(Keys.RETURN)
        driver.implicitly_wait(SHORT_DELAY)  # Wait for results

        # Click the customer search result
        customer_result = WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.element_to_be_clickable((By.ID, "customerSearch0"))
        )
        customer_result.click()
        driver.implicitly_wait(SHORT_DELAY)  # Wait for processing

        # Check for "Confirm Seconds" popup
        try:
            popup = WebDriverWait(driver, SHORT_DELAY).until(
                EC.visibility_of_element_located((By.ID, "transMessage"))
            )
            dont_serve_button = WebDriverWait(driver, WAIT_TIMEOUT).until(
                EC.element_to_be_clickable((By.ID, "modalButton1"))
            )
            dont_serve_button.click()
            print(f"ID {id_value}: Popup detected, clicked 'Don’t Serve'")
            WebDriverWait(driver, WAIT_TIMEOUT).until_not(
                EC.visibility_of_element_located((By.ID, "transMessage"))
            )

            # Handle "Transaction Cancelled" popup
            try:
                trans_cancelled_popup = WebDriverWait(driver, SHORT_DELAY).until(
                    EC.visibility_of_element_located((By.ID, "transCancelledModal"))
                )
                ok_button = WebDriverWait(driver, WAIT_TIMEOUT).until(
                    EC.element_to_be_clickable((By.ID, "modalButton0"))
                )
                ok_button.click()
                print(f"ID {id_value}: 'Transaction Cancelled' popup detected, clicked 'OK'")
                WebDriverWait(driver, WAIT_TIMEOUT).until_not(
                    EC.visibility_of_element_located((By.ID, "transCancelledModal"))
                )
            except TimeoutException:
                print(f"ID {id_value}: No 'Transaction Cancelled' popup")
        except TimeoutException:
            print(f"ID {id_value}: Processed normally (no 'Confirm Seconds' popup)")

    except TimeoutException as e:
        print(f"Error with ID {id_value}: {e} (element not found in time)")
    except Exception as e:
        print(f"Unexpected error with ID {id_value}: {e}")

# Keep browser open until you close it
input("Press Enter to close the browser...")
driver.quit()
