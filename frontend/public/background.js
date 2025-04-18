// background.js

// Clear any previous login flag when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove("loggedIn");
});

// Listen for requests from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "request-login") {
    // Open the popup window only if there's an active window
    chrome.windows.getCurrent({ populate: true }, (window) => {
      if (!window) {
        console.warn("No active window found. Cannot open popup.");
        sendResponse({ status: "no_active_window" });
        return;
      }

      // Let the popup open naturally via browser action (or just send a signal)
      chrome.action.openPopup();
      sendResponse({ status: "popup_opened" });
    });

    return true; // Needed for async sendResponse
  }

  if (message === "signout") {
    chrome.storage.local.remove("loggedIn", () => {
      sendResponse({ status: "signed_out" });
    });
    return true;
  }
});
