// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2H-_1HQEu9uFL_AEsrxuAfVcH_cWjh20",
  authDomain: "clashofcode-30630.firebaseapp.com",
  databaseURL: "https://clashofcode-30630-default-rtdb.firebaseio.com",
  projectId: "clashofcode-30630",
  storageBucket: "clashofcode-30630.firebasestorage.app",
  messagingSenderId: "381779416062",
  appId: "1:381779416062:web:51df727eff4882ae46a6af",
  measurementId: "G-8BVX3NVG3E"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  loginMessage.textContent = "Logging in...";
  loginMessage.style.color = "#000";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginMessage.textContent = "Login successful! Redirecting...";
    loginMessage.style.color = "green";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  } catch (error) {
    loginMessage.textContent = `Error: ${error.message}`;
    loginMessage.style.color = "red";
  }
});

