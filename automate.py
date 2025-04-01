import pandas as pd
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException

# Step 1: Read the CSV file
file_path = "mealtime_data.csv"
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
        search_bar = driver.find_element(By.ID, "customerSearchText")
        search_bar.clear()
        time.sleep(1)  # Delay to ensure clearing registers

        # Enter the ID and trigger search
        search_bar.send_keys(str(id_value))
        search_bar.send_keys(Keys.RETURN)
        time.sleep(2)  # Delay for results to load

        # Click the customer search result
        customer_result = driver.find_element(By.ID, "customerSearch0")
        customer_result.click()
        time.sleep(2)  # Delay for server processing

        # Check for "Confirm Seconds" popup
        try:
            popup = driver.find_element(By.ID, "transMessage")
            if popup.is_displayed():
                dont_serve_button = driver.find_element(By.ID, "modalButton1")
                dont_serve_button.click()
                print(f"ID {id_value}: Popup detected, clicked 'Don’t Serve'")
                time.sleep(2)  # Delay after clicking "Don't Serve"

                # Handle "Transaction Cancelled" popup
                try:
                    trans_cancelled_popup = driver.find_element(By.ID, "transCancelledModal")
                    if trans_cancelled_popup.is_displayed():
                        ok_button = driver.find_element(By.ID, "modalButton0")
                        ok_button.click()
                        print(f"ID {id_value}: 'Transaction Cancelled' popup detected, clicked 'OK'")
                        time.sleep(2)  # Delay after clicking "OK"
                    else:
                        print(f"ID {id_value}: No 'Transaction Cancelled' popup")
                except NoSuchElementException:
                    print(f"ID {id_value}: No 'Transaction Cancelled' popup detected")
            else:
                print(f"ID {id_value}: Processed normally (no 'Confirm Seconds' popup)")
        except NoSuchElementException:
            print(f"ID {id_value}: Processed normally (no 'Confirm Seconds' popup)")

    except NoSuchElementException as e:
        print(f"Error with ID {id_value}: {e} (element not found)")
    except Exception as e:
        print(f"Unexpected error with ID {id_value}: {e}")

# Keep browser open until you close it
input("Press Enter to close the browser...")
driver.quit()
