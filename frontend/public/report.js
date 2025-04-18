firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();
const userEmailEl = document.getElementById("userEmail");
const companyNameEl = document.getElementById("companyName");

let userEmail = "";
auth.onAuthStateChanged((user) => {
  if (user) {
    userEmail = user.email;
    userEmailEl.textContent = "Reporting as: " + user.email;
  }
});

const urlParams = new URLSearchParams(window.location.search);
const company = urlParams.get("company") || "";
companyNameEl.textContent = "Company: " + company;

document.getElementById("submitReport").addEventListener("click", async () => {
  const feedback = document.getElementById("feedback").value;
  if (!feedback.trim()) return alert("Please enter some feedback");

  await fetch("http://localhost:8080/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      company,
      message: feedback,
    }),
  });

  document.getElementById("statusMsg").textContent =
    "Report submitted successfully!";
});
