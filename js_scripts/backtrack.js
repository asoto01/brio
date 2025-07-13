// --- Configuration ---
const IDS_TO_PROCESS = `
`; // <-- Paste your IDs between the backticks

// --- Selectors ---
const SEARCH_INPUT_SELECTOR = '#customerSearchText';
const SEARCH_RESULT_SELECTOR = '#customerSearch0';
const MODAL_1_CONTAINER_SELECTOR = '#transMessage';
const MODAL_1_DONT_SERVE_BUTTON_SELECTOR = '#modalButton1';
const MODAL_2_CONTAINER_SELECTOR = '#transCancelledModal';
const MODAL_2_OK_BUTTON_SELECTOR = '#modalButton0';
const SERVE_COUNT_SELECTOR = 'span.serveCount'; // Selector for the 'Served' count number

// --- Delays and Timing ---
const TIME_AFTER_INPUT = 150;
const TIME_AFTER_RESULT_CLICK = 150;
const POLL_INTERVAL = 150; // Original poll interval for other things (e.g., waiting for modals to disappear)
const MAX_WAIT_TIMEOUT = 10000;
const TIME_BETWEEN_IDS = 150;

// --- Polling for Served Count (ADJUSTED FOR FASTER CHECKS) ---
const POLLING_TOTAL_DURATION_MS = 150; // Reduced from 5000ms to 0.15 seconds
const POLLING_CHECK_INTERVAL_MS = 150;  // Reduced from 500ms to 0.15 seconds

// --- Stop Flag ---
window.stopAutomation = false;
function stopScript() {
    window.stopAutomation = true;
    console.warn("Stop signal received. Automation will halt after the current ID finishes processing.");
}

// --- Helper Function for Delays ---
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// --- Helper Function to check visibility ---
function isElementVisible(selector) {
    const element = document.querySelector(selector);
    if (!element) return false;
    return element.offsetParent !== null || window.getComputedStyle(element).display !== 'none';
}

// --- Helper Function to wait for element disappearance ---
async function waitForElementToDisappear(selector, maxWait = MAX_WAIT_TIMEOUT) {
    console.log(`Waiting for element (${selector}) to disappear...`);
    let elapsedTime = 0;
    while (isElementVisible(selector)) {
        if (elapsedTime >= maxWait) {
            console.warn(`Element (${selector}) did not disappear within ${maxWait / 1000}s timeout.`);
            return false;
        }
        await delay(POLL_INTERVAL); // Uses the general POLL_INTERVAL
        elapsedTime += POLL_INTERVAL;
    }
    console.log(`Element (${selector}) disappeared.`);
    return true;
}


// --- Main Automation Function ---
async function automateCustomerAction() {
    console.log("Starting automation...");

    // --- Prompt for target 'Served' count (RETAINED) ---
    let targetServedCountInput = prompt(`Please enter the target 'Served' count to reach on the page (e.g., 139).\nEnter 0, leave blank, or cancel to run without this specific stop condition.`);
    let targetServedCount = Infinity; // Default to run indefinitely

    if (targetServedCountInput === null || targetServedCountInput.trim() === "") {
        console.log("No target 'Served' count set. Script will process all IDs or until manually stopped, without checking page's served count for limit.");
        targetServedCount = Infinity;
    } else {
        const parsedInput = parseInt(targetServedCountInput, 10);
        if (isNaN(parsedInput)) {
            console.error("Invalid input for target 'Served' count. Please enter a number. Aborting script.");
            return;
        }
        if (parsedInput <= 0) {
            console.log("Target 'Served' count is 0 or negative. Script will run without checking page's served count for a limit.");
            targetServedCount = Infinity;
        } else {
            targetServedCount = parsedInput;
            console.log(`Script will attempt to stop when 'Served' count on page reaches ${targetServedCount}, or when all IDs are processed/manually stopped.`);
        }
    }
    // --- End prompt ---

    let successfulNoPopupCount = 0;
    let totalSuccessCount = 0;
    let idsAttempted = 0;
    let stoppedByServedCountLimit = false; // Retained

    window.stopAutomation = false;

    const ids = IDS_TO_PROCESS.split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

    if (ids.length === 0) {
        console.error("No IDs found. Paste IDs into the IDS_TO_PROCESS variable.");
        return;
    }
    const totalIdsToProcess = ids.length;

    console.log(`Found ${totalIdsToProcess} IDs to process.`);
    console.log("To stop the script early, type stopScript() in the console and press Enter.");

    for (let i = 0; i < totalIdsToProcess; i++) {
        idsAttempted++;

        if (window.stopAutomation) {
            console.log("Automation stopped by user signal.");
            idsAttempted--;
            break;
        }

        // --- NEW LOGIC: Check 'Served' count BEFORE processing the current ID ---
        if (targetServedCount !== Infinity) { // Only check if a target was set
            const serveCountElement = document.querySelector(SERVE_COUNT_SELECTOR);
            if (serveCountElement) {
                const currentServedCountText = serveCountElement.textContent || serveCountElement.innerText || "0";
                const currentServedCount = parseInt(currentServedCountText, 10);
                
                if (!isNaN(currentServedCount) && currentServedCount >= targetServedCount) {
                    console.log(`Pre-check: Target 'Served' count of ${targetServedCount} already reached on page (current: ${currentServedCount}). Stopping automation BEFORE processing next ID.`);
                    stoppedByServedCountLimit = true;
                    idsAttempted--; // This ID wasn't processed
                    break; // Exit the main loop
                }
            } else {
                console.warn(`Pre-check: Could not find the 'Served' count element (${SERVE_COUNT_SELECTOR}). Cannot verify target before processing ID.`);
            }
        }
        // --- END NEW LOGIC ---

        const currentId = ids[i];
        console.log(`\n--- Processing ID ${idsAttempted}/${totalIdsToProcess}: ${currentId} ---`);
        let didModal1Appear = false;

        try {
            // --- Step 1: Search ---
            const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
            if (!searchInput) throw new Error(`Search input (${SEARCH_INPUT_SELECTOR}) not found.`);
            searchInput.focus();
            searchInput.value = currentId;
            searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
            console.log(`Entered ID: ${currentId} and dispatched events.`);
            console.log(`Waiting ${TIME_AFTER_INPUT / 1000}s for search results...`);
            await delay(TIME_AFTER_INPUT);

            // --- Step 2: Click Result ---
            const searchResult = document.querySelector(SEARCH_RESULT_SELECTOR);
            if (!isElementVisible(SEARCH_RESULT_SELECTOR)) {
                throw new Error(`Search result (${SEARCH_RESULT_SELECTOR}) not found or not visible for ID ${currentId}. Skipping.`);
            }
            console.log("Clicking search result...");
            searchResult.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            console.log(`Waiting ${TIME_AFTER_RESULT_CLICK / 1000}s for potential popups...`);
            await delay(TIME_AFTER_RESULT_CLICK);

            // --- Step 3 & 4: Modal Handling ---
            if (isElementVisible(MODAL_1_CONTAINER_SELECTOR)) {
                console.log(`Modal 1 (${MODAL_1_CONTAINER_SELECTOR}) detected.`);
                didModal1Appear = true;
                const dontServeButton = document.querySelector(MODAL_1_DONT_SERVE_BUTTON_SELECTOR);
                if (isElementVisible(MODAL_1_DONT_SERVE_BUTTON_SELECTOR)) {
                    console.log("Clicking 'Don't Serve' button on Modal 1...");
                    dontServeButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                    const modal1Disappeared = await waitForElementToDisappear(MODAL_1_CONTAINER_SELECTOR);
                    if (!modal1Disappeared) {
                        throw new Error(`Modal 1 (${MODAL_1_CONTAINER_SELECTOR}) did not disappear after clicking 'Don't Serve'. Stopping processing for this ID.`);
                    }
                    await delay(POLL_INTERVAL);
                    if (isElementVisible(MODAL_2_CONTAINER_SELECTOR)) {
                        console.log(`Modal 2 (${MODAL_2_CONTAINER_SELECTOR}) detected.`);
                        const okButton = document.querySelector(MODAL_2_OK_BUTTON_SELECTOR);
                        if (isElementVisible(MODAL_2_OK_BUTTON_SELECTOR)) {
                            console.log("Clicking 'OK' button on Modal 2...");
                            okButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                            const modal2Disappeared = await waitForElementToDisappear(MODAL_2_CONTAINER_SELECTOR);
                            if (!modal2Disappeared) {
                                console.warn(`Modal 2 (${MODAL_2_CONTAINER_SELECTOR}) did not disappear after clicking 'OK'. May interfere with next ID.`);
                            }
                        } else {
                            console.warn(`'OK' button (${MODAL_2_OK_BUTTON_SELECTOR}) not found or visible on Modal 2.`);
                        }
                    } else {
                        console.log(`Modal 2 (${MODAL_2_CONTAINER_SELECTOR}) did not appear after closing Modal 1.`);
                    }
                } else {
                    console.warn(`'Don't Serve' button (${MODAL_1_DONT_SERVE_BUTTON_SELECTOR}) not found or visible on Modal 1.`);
                }
            } else {
                console.log(`Modal 1 (${MODAL_1_CONTAINER_SELECTOR}) was not detected.`);
                successfulNoPopupCount++;
            }
            // --- End of your core processing logic for an ID ---

            totalSuccessCount++;

            if (!didModal1Appear) {
                console.log(`Successfully processed ID (no modals): ${currentId}`);
            } else {
                console.log(`Successfully processed modal workflow for ID: ${currentId}`);
            }

        } catch (error) {
            console.error(`Error processing ID ${currentId}:`, error.message);
        }

        // --- MODIFIED SECTION: Check 'Served' count on the page with polling ---
        // This check is now redundant for stopping the *next* ID,
        // but it's still useful for logging the *current* state of the served count.
        // It will only break the loop if target is met *during* its polling window
        // for the *current* ID, or if manual stop occurs.
        // The primary "stop before processing next ID" logic is now at the top of the loop.
        if (targetServedCount !== Infinity && !window.stopAutomation) { 
            console.log(`Polling for 'Served' count to reach target of ${targetServedCount}...`);
            let pollingElapsedTime = 0;
            let targetReachedInPolling = false;

            while (pollingElapsedTime < POLLING_TOTAL_DURATION_MS) {
                const serveCountElement = document.querySelector(SERVE_COUNT_SELECTOR);
                if (serveCountElement) {
                    const currentServedCountText = serveCountElement.textContent || serveCountElement.innerText || "0";
                    const currentServedCount = parseInt(currentServedCountText, 10);
                    
                    console.log(`Polling: Page 'Served' count is ${currentServedCount} (Raw: '${currentServedCountText}'). Target: ${targetServedCount}.`);

                    if (!isNaN(currentServedCount) && currentServedCount >= targetServedCount) {
                        console.log(`Target 'Served' count of ${targetServedCount} reached on page (current: ${currentServedCount}). Stopping automation.`);
                        stoppedByServedCountLimit = true;
                        targetReachedInPolling = true;
                        break; // Exit this polling loop
                    }
                } else {
                    console.warn(`Polling: Could not find the 'Served' count element (${SERVE_COUNT_SELECTOR}). Will retry.`);
                }

                // If already decided to stop due to target being reached in polling, exit while loop.
                if (targetReachedInPolling) break;

                await delay(POLLING_CHECK_INTERVAL_MS); // Use the adjusted polling interval
                pollingElapsedTime += POLLING_CHECK_INTERVAL_MS;

                // Check if manual stop was triggered during polling delay
                if (window.stopAutomation) {
                    console.log("Manual stop signal received during polling.");
                    break;  
                }
            }

            if (targetReachedInPolling || window.stopAutomation) {
                // If target was reached by polling OR manual stop, break the main loop over IDs
                if(window.stopAutomation && !targetReachedInPolling) console.log("Manual stop signal honored, breaking main loop.");
                break;  
            } else if (pollingElapsedTime >= POLLING_TOTAL_DURATION_MS) {
                console.log(`Polling timed out after ${POLLING_TOTAL_DURATION_MS / 1000}s. 'Served' count did not reach ${targetServedCount} for ID ${currentId}. Continuing...`);
            }
        }
        // --- END MODIFIED SECTION ---

        if (i < totalIdsToProcess - 1 && !window.stopAutomation && !stoppedByServedCountLimit) {
            console.log(`Waiting ${TIME_BETWEEN_IDS / 1000}s before next ID...`);
            await delay(TIME_BETWEEN_IDS);
        }
    } // End of main for loop over IDs

    // --- FINAL SUMMARY LOGGING (Should be largely the same) ---
    console.log("\n--- Automation finished ---");
    console.log(`Attempted to process: ${idsAttempted} / ${totalIdsToProcess} IDs`);
    console.log(`Total successful ID processing events (try block completed): ${totalSuccessCount}`);
    console.log(`    -> Successful completions where Modal 1 did NOT appear: ${successfulNoPopupCount}`);

    if (stoppedByServedCountLimit) {
        console.log(`Automation stopped: 'Served' count on page reached or exceeded target of ${targetServedCount}.`);
    } else if (window.stopAutomation) {
        console.log("Automation was stopped manually by the user.");
    } else if (idsAttempted === totalIdsToProcess) {
        console.log("Automation processed all available IDs.");
    } else if (idsAttempted < totalIdsToProcess) {
        console.log("Automation finished before processing all IDs. Check console for earlier error messages or reasons (e.g., invalid input at prompt, or polling stop).");
    }
    // --- END OF ENHANCED LOGGING ---

} // End of automateCustomerAction function

// --- To Run the Automation ---
 automateCustomerAction();
