firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    const email = sessionStorage.getItem("pendingEmail");
    const pass = sessionStorage.getItem("pendingPass");
    if (email && pass) {
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (err) {
        console.error("Re-login failed:", err.message);
      }
    }
  } else {
    const checkVerification = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(checkVerification);

        // ✅ Notify extension + close window
        chrome.runtime.sendMessage({ type: "login-success" });
        document.body.innerHTML = "<p>✅ Verified! Logging you in...</p>";
        setTimeout(() => window.close(), 1500);
        window.close(); // ← 🔥 THIS closes the tab automatically
      }
    }, 3000); // Check every 3 seconds
  }
});
