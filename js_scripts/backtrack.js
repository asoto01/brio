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

// --- Delays and Timing ---
const TIME_AFTER_INPUT = 125;
const TIME_AFTER_RESULT_CLICK = 125;
const POLL_INTERVAL = 125;
const MAX_WAIT_TIMEOUT = 10000;
const TIME_BETWEEN_IDS = 125;

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
        await delay(POLL_INTERVAL);
        elapsedTime += POLL_INTERVAL;
    }
    console.log(`Element (${selector}) disappeared.`);
    return true;
}


// --- Main Automation Function ---
async function automateCustomerAction() {
    console.log("Starting automation...");
    // *** ADDED/MODIFIED COUNTERS ***
    let successfulNoPopupCount = 0; // Count success *without* modals
    let totalSuccessCount = 0;      // Count *any* success (try block completed)
    let idsAttempted = 0;           // Count how many IDs we started processing

    window.stopAutomation = false; // Reset stop flag on start

    // 1. Prepare the IDs
    const ids = IDS_TO_PROCESS.split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

    if (ids.length === 0) {
        console.error("No IDs found. Paste IDs into the IDS_TO_PROCESS variable.");
        return;
    }
    const totalIdsToProcess = ids.length; // Store total for final log

    console.log(`Found ${totalIdsToProcess} IDs to process.`);
    console.log("To stop the script early, type stopScript() in the console and press Enter.");

    // 2. Loop through each ID
    for (let i = 0; i < totalIdsToProcess; i++) {
        idsAttempted++; // Increment attempted count

        if (window.stopAutomation) {
            console.log("Automation stopped by user signal.");
            idsAttempted--; // Decrement because we didn't actually attempt this one fully
            break;
        }

        const currentId = ids[i];
        console.log(`\n--- Processing ID ${idsAttempted}/${totalIdsToProcess}: ${currentId} ---`);
        let didModal1Appear = false;

        try {
            // --- Step 1: Search ---
            // ... (search logic as before) ...
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
            // ... (click result logic as before) ...
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
                    await delay(POLL_INTERVAL); // Short pause

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
                // This path means success *without* modals
                successfulNoPopupCount++; // Increment specific counter
            }

            // *** INCREMENT TOTAL SUCCESS COUNT AT END OF TRY BLOCK ***
            totalSuccessCount++;

            // Log success type
            if (!didModal1Appear) {
                console.log(`Successfully processed ID (no modals): ${currentId}`);
            } else {
                console.log(`Successfully processed modal workflow for ID: ${currentId}`);
            }

        } catch (error) {
            console.error(`Error processing ID ${currentId}:`, error.message);
            // Note: totalSuccessCount is NOT incremented if an error occurs
        }

        // Wait a bit before starting the next ID (only if not stopping)
        if (i < totalIdsToProcess - 1 && !window.stopAutomation) {
           console.log(`Waiting ${TIME_BETWEEN_IDS / 1000}s before next ID...`);
           await delay(TIME_BETWEEN_IDS);
        }
    } // End of loop

    // --- FINAL SUMMARY LOGGING (ENHANCED) ---
    console.log("\n--- Automation finished ---");
    console.log(`Attempted to process: ${idsAttempted} / ${totalIdsToProcess} IDs`);
    console.log(`Total successful completions (try block finished): ${totalSuccessCount}`);
    console.log(`   -> Successful completions where Modal 1 did NOT appear: ${successfulNoPopupCount}`);
    if (window.stopAutomation) {
        console.log("Automation was stopped manually by user.");
    }
    // --- END OF ENHANCED LOGGING ---

} // End of automateCustomerAction function

// --- Run the Automation ---
automateCustomerAction();
