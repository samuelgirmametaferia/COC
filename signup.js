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

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const form = document.getElementById("signupForm");
const message = document.getElementById("message");
const verifyNotice = document.getElementById("verifyNotice");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = Math.random().toString(36).slice(-10); // Generate temp password
  const phone = form.phone.value.trim();
  const skills = form.skills.value.trim();
  const achievements = form.achievements.value.trim();
  const parentName = form.parentName.value.trim();
  const parentEmail = form.parentEmail.value.trim();
  const parentPhone = form.parentPhone.value.trim();
  const contractChecked = form.contractCheck.checked;

  if (!contractChecked) {
    message.style.color = "#ff4444";
    message.textContent = "You must confirm contract submission.";
    return;
  }

  message.textContent = "Registering...";

  try {
    // Create Firebase user
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCred.user;

    // Send verification email
    await user.sendEmailVerification();
	await auth.currentUser.getIdToken(true);
    // Save user data
    await db.ref("participants/" + user.uid).set({
      name,
      email,
      phone,
      skills,
      achievements,
      parentName,
      parentEmail,
      parentPhone,
      hasContract: contractChecked,
      verified: false,
      timestamp: new Date().toISOString()
    });

    message.style.color = "#66ff66";
    message.textContent = "Account created! Please check your email to verify. Don't close this tab until you have verified your account!";
// Check email verification every 5 seconds
const checkVerificationInterval = setInterval(async () => {
  await user.reload(); // Refresh user data
  if (user.emailVerified) {
    clearInterval(checkVerificationInterval); // Stop checking once verified

    // Update in database
    await db.ref("participants/" + user.uid).update({
      verified: true,
      emailVerified: true
    });

    message.style.color = "#66ff66";
    message.textContent = "Email verified! You may now close this tab.";
    verifyNotice.innerHTML = "<strong>Email verified!</strong> Thank you.";
  }
}, 5000);

    
    form.reset();
    form.classList.add("hidden");
    verifyNotice.classList.remove("hidden");

  } catch (error) {
    message.style.color = "#ff4444";
    message.textContent = error.message;
  }
});
