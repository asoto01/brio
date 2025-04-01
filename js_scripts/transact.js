// Script to complete transactions of students in queue for lunch.

(function() {
  let buttonClickInterval;
  let popupObserver;

  function startButtonClickLoop() {
    buttonClickInterval = setInterval(() => {
      const button = document.getElementById('payFromAccount');
      if (button) {
        button.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    }, 2000); // Click every 2 seconds

    popupObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('popup') || node.classList.contains('modal') || node.id === 'popupId')) {
              stopButtonClickLoop();
            }
          });
        }
      });
    });

    popupObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopButtonClickLoop() {
    if (buttonClickInterval) {
      clearInterval(buttonClickInterval);
      buttonClickInterval = null;
    }
    if (popupObserver) {
      popupObserver.disconnect();
      popupObserver = null;
    }
  }

  window.start = startButtonClickLoop;
  window.stop = stopButtonClickLoop;
})();

// To start, simply paste the code into the console and then type:
// start();

// To stop, type:
// stop();
