// Check initial login status
chrome.storage.local.get("loggedIn", ({ loggedIn }) => {
  if (!loggedIn) {
    chrome.runtime.sendMessage("request-login");
    return;
  }
  observeJobChanges();
});

// Listen for login or logout events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "login-success") {
    observeJobChanges();
  }
  if (message.type === "logout-success") {
    const button = document.querySelector(".h1b-info-button");
    if (button) button.remove();
    const reportBtn = document.querySelector(".report-button");
    if (reportBtn) reportBtn.remove();
    const status = document.querySelector(".sponsorship-status");
    if (status) status.remove();
    chrome.runtime.sendMessage("request-login");
  }
});

function observeJobChanges() {
  let currentJobId = null;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" || mutation.type === "subtree") {
        const newJobId = getCurrentJobIdFromUrl();
        if (newJobId && newJobId !== currentJobId) {
          currentJobId = newJobId;
          removeEligibilityText();
          setTimeout(addButton, 500);
          break;
        }
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    currentJobId = getCurrentJobIdFromUrl();
    addButton();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function getCompanyName() {
  const companyElement = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name a"
  );
  return companyElement ? companyElement.textContent.trim() : null;
}

function getJobDescription() {
  return new Promise((resolve) => {
    const descriptionContainer = document.querySelector(
      ".job-details-about-the-job-module__description"
    );
    if (!descriptionContainer) return resolve(null);

    const toggleButton = descriptionContainer.querySelector(
      ".feed-shared-inline-show-more-text__see-more-less-toggle"
    );
    if (
      toggleButton &&
      toggleButton.textContent.trim().toLowerCase() === "show more"
    ) {
      toggleButton.click();
    }

    setTimeout(() => {
      const jobDescElement = descriptionContainer.querySelector(
        ".feed-shared-inline-show-more-text"
      );
      if (jobDescElement) {
        const clone = jobDescElement.cloneNode(true);
        const buttonInClone = clone.querySelector(
          ".feed-shared-inline-show-more-text__see-more-less-toggle"
        );
        if (buttonInClone) buttonInClone.remove();
        resolve(clone.innerText.trim());
      } else {
        resolve(null);
      }
    }, 500);
  });
}

function checkEligibility(jobDescription) {
  if (!jobDescription) return "Eligibility Unknown";

  const descLower = jobDescription.toLowerCase();
  const boilerplateIndicators = [
    "equal opportunity",
    "affirmative action",
    "reasonable accommodations",
    "genetic information",
    "background screening",
    "drug-free workplace",
  ];

  const ineligiblePhrases = [
    "us citizen",
    "permanent resident",
    "green cards",
    "gc",
    "usc",
    "without the need for current or future sponsorship",
    "u.s. work authorization required",
    "no sponsorship available",
    "will not sponsor work visas",
    "no employment sponsorship",
    "permanent work authorization",
    "unrestricted work authorization",
    "u.s. citizen",
    "secret clearance",
    "top secret",
    "ts/ sci",
    "ts/sci",
    "full scope polygraph",
    "polygraph testing",
    "candidates requiring visa sponsorship will not be considered",
    "must hold a valid, current work permit that does not require future sponsorship",
    "eligible to work without further authorization",
    "long-term work authorization",
    "must have long-term work authorization",
    "dod security clearance",
    "ability to obtain and maintain dod security clearance is required",
    "ability to obtain dod security clearance is required",
  ];

  for (let phrase of ineligiblePhrases) {
    if (
      descLower.includes(phrase) &&
      !boilerplateIndicators.some((b) => descLower.includes(b))
    ) {
      return "❌ Not Eligible for Sponsorship (High Confidence)";
    }
  }

  return "✅ No Sponsorship Restrictions Detected";
}

async function fetchH1BInfo(companyName) {
  const baseUrl = "http://localhost:8080";
  try {
    const response = await fetch(
      `${baseUrl}/${encodeURIComponent(companyName)}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Error fetching H1B info:", error);
    return null;
  }
}

function getCurrentJobIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("currentJobId");
}

function removeEligibilityText() {
  const statusSpan = document.querySelector(".sponsorship-status");
  if (statusSpan) statusSpan.textContent = "";
}

function addButton() {
  const companyNameContainer = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name"
  );
  if (!companyNameContainer) {
    setTimeout(addButton, 1000);
    return;
  }

  if (document.querySelector(".h1b-info-button")) return;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "inline-flex";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.marginLeft = "10px";

  const button = document.createElement("button");
  button.textContent = "H1B Info";
  button.className = "h1b-info-button";
  button.style.padding = "5px 10px";
  button.style.backgroundColor = "#0a66c2";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";

  const reportBtn = document.createElement("button");
  reportBtn.className = "report-button";
  reportBtn.textContent = "Report Issue";
  reportBtn.style.marginLeft = "8px";
  reportBtn.style.backgroundColor = "#ff4d4d";
  reportBtn.style.color = "white";
  reportBtn.style.border = "none";
  reportBtn.style.borderRadius = "4px";
  reportBtn.style.cursor = "pointer";
  reportBtn.style.padding = "5px 10px";

  const statusSpan = document.createElement("span");
  statusSpan.className = "sponsorship-status";
  statusSpan.style.marginLeft = "10px";
  statusSpan.style.color = "#666";

  button.addEventListener("click", async () => {
    chrome.storage.local.get("loggedIn", async ({ loggedIn }) => {
      if (!loggedIn) {
        chrome.runtime.sendMessage("request-login");
        return;
      }

      const companyName = getCompanyName();
      const jobDescription = await getJobDescription();

      if (companyName) {
        const eligibilityStatus = checkEligibility(jobDescription);
        statusSpan.textContent = eligibilityStatus;

        const html = await fetchH1BInfo(companyName);
        if (html) console.log("H1B data:", html);

        window.open(
          `http://localhost:8080/${companyName}`,
          "H1b Data Analysis",
          "width=400,height=400"
        );
      } else {
        alert("Company name not found");
      }
    });
  });

  reportBtn.addEventListener("click", () => {
    chrome.storage.local.get("loggedIn", async ({ loggedIn }) => {
      if (!loggedIn) {
        chrome.runtime.sendMessage("request-login");
        return;
      }
      const company = getCompanyName() || "";
      const reportUrl = chrome.runtime.getURL(
        `report.html?company=${encodeURIComponent(company)}`
      );
      window.open(reportUrl, "_blank", "width=500,height=500");
    });
  });

  buttonContainer.appendChild(button);
  buttonContainer.appendChild(reportBtn);
  buttonContainer.appendChild(statusSpan);
  companyNameContainer.appendChild(buttonContainer);
}
