// firebase.initializeApp(window.firebaseConfig);
// const auth = firebase.auth();

// const emailIn = document.getElementById("email");
// const passIn = document.getElementById("password");
// const errorDiv = document.getElementById("error");
// const loginBtn = document.getElementById("loginBtn");
// const signupBtn = document.getElementById("signupBtn");
// const logoutBtn = document.getElementById("logoutBtn");
// const authSection = document.getElementById("authSection");
// const statusSection = document.getElementById("statusSection");

// function isEduEmail(email) {
//   return email.endsWith(".edu");
// }

// function isValidEmailFormat(email) {
//   return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
// }

// function isValidPassword(password) {
//   const pattern =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
//   return password.length >= 8 && pattern.test(password);
// }

// function showError(msg) {
//   errorDiv.style.color = "red";
//   errorDiv.textContent = msg;
// }

// function showSuccess(msg) {
//   errorDiv.style.color = "green";
//   errorDiv.textContent = msg;
// }

// // ✅ Auto-check login status
// auth.onAuthStateChanged((user) => {
//   if (user) {
//     authSection.style.display = "none";
//     statusSection.style.display = "block";

//     chrome.storage.local.set({ loggedIn: true }, () => {
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0]?.id) {
//           chrome.tabs.sendMessage(tabs[0].id, { type: "login-success" });
//         }
//       });
//     });
//   } else {
//     authSection.style.display = "block";
//     statusSection.style.display = "none";
//   }
// });

// // 🔐 Login
// loginBtn.addEventListener("click", async () => {
//   const email = emailIn.value.trim();
//   const password = passIn.value;

//   if (!isEduEmail(email))
//     return showError("Only .edu email addresses are allowed.");
//   try {
//     await auth.signInWithEmailAndPassword(email, password);
//     showSuccess("Authentication successful!");
//   } catch (err) {
//     const code = err.code;
//     if (code === "auth/user-not-found")
//       return showError("Email not registered.");
//     if (code === "auth/wrong-password")
//       return showError("Email or password mismatch.");
//     showError(err.message);
//   }
// });

// // 🧾 Sign up
// signupBtn.addEventListener("click", async () => {
//   const email = emailIn.value.trim();
//   const password = passIn.value;

//   if (!isEduEmail(email))
//     return showError("Only .edu email addresses are allowed.");
//   if (!isValidPassword(password)) {
//     return showError(
//       "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
//     );
//   }

//   try {
//     await auth.createUserWithEmailAndPassword(email, password);
//     showSuccess("Account created successfully!");
//   } catch (err) {
//     showError(err.message);
//   }
// });

// // // 🚪 Logout
// // logoutBtn.addEventListener("click", async () => {
// //   try {
// //     await auth.signOut();
// //     chrome.storage.local.remove("loggedIn");
// //     showSuccess("Logged out!");
// //     // UI will auto-reset via onAuthStateChanged
// //   } catch (err) {
// //     showError("Logout failed: " + err.message);
// //   }
// // });
// logoutBtn.addEventListener("click", async () => {
//   try {
//     await auth.signOut();
//     chrome.storage.local.remove("loggedIn", () => {
//       // Inform content script to disable/cleanup
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0]?.id) {
//           chrome.tabs.sendMessage(tabs[0].id, { type: "logout-success" });
//         }
//       });
//     });
//     showSuccess("Logged out!");
//   } catch (err) {
//     showError("Logout failed: " + err.message);
//   }
// });

/////////////////

firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();

const emailIn = document.getElementById("email");
const passIn = document.getElementById("password");
const errorDiv = document.getElementById("error");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("authSection");
const statusSection = document.getElementById("statusSection");

function isEduEmail(email) {
  return email.endsWith(".edu");
}

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  const pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
  return password.length >= 8 && pattern.test(password);
}

function showError(msg) {
  errorDiv.style.color = "red";
  errorDiv.textContent = msg;
}

function showSuccess(msg) {
  errorDiv.style.color = "green";
  errorDiv.textContent = msg;
}

// ✅ Auto-check login status
auth.onAuthStateChanged((user) => {
  if (user && user.emailVerified) {
    authSection.style.display = "none";
    statusSection.style.display = "block";

    chrome.storage.local.set({ loggedIn: true }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "login-success" });
        }
      });
    });
  } else {
    authSection.style.display = "block";
    statusSection.style.display = "none";
  }
});

// 🔐 Login
loginBtn.addEventListener("click", async () => {
  const email = emailIn.value.trim();
  const password = passIn.value;

  if (!isValidEmailFormat(email)) return showError("Invalid email format.");
  if (!isEduEmail(email))
    return showError("Only .edu email addresses are allowed.");

  try {
    const { user } = await auth.signInWithEmailAndPassword(email, password);
    if (!user.emailVerified) {
      await auth.signOut();
      showError("Please verify your email before logging in.");
      return;
    }
    showSuccess("Authentication successful!");
  } catch (err) {
    const code = err.code;
    if (code === "auth/user-not-found")
      return showError("Email not registered.");
    if (code === "auth/wrong-password")
      return showError("Email or password mismatch.");
    showError(err.message);
  }
});

// 🧾 Sign up
signupBtn.addEventListener("click", async () => {
  const email = emailIn.value.trim();
  const password = passIn.value;

  if (!isValidEmailFormat(email)) return showError("Invalid email format.");
  if (!isEduEmail(email))
    return showError("Only .edu email addresses are allowed.");
  if (!isValidPassword(password)) {
    return showError(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
  }

  try {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    // ✅ Store credentials for verify.js to reuse
    sessionStorage.setItem("pendingEmail", email);
    sessionStorage.setItem("pendingPass", password);
    await user.sendEmailVerification();
    await auth.signOut();
    const verificationTab = window.open(
      chrome.runtime.getURL("verify.html"),
      "_blank",
      "width=400,height=400"
    );
    showSuccess("Verification email sent. Please verify before logging in.");
  } catch (err) {
    showError(err.message);
  }
});

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    chrome.storage.local.remove("loggedIn", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "logout-success" });
        }
      });
    });
    showSuccess("Logged out!");
  } catch (err) {
    showError("Logout failed: " + err.message);
  }
});
