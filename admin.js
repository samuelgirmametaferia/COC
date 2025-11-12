// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2H-_1HQEu9uFL_AEsrxuAfVcH_cWjh20",
  authDomain: "clashofcode-30630.firebaseapp.com",
  databaseURL: "https://clashofcode-30630-default-rtdb.firebaseio.com",
  projectId: "clashofcode-30630",
  storageBucket: "clashofcode-30630.appspot.com",
  messagingSenderId: "381779416062",
  appId: "1:381779416062:web:51df727eff4882ae46a6af",
  measurementId: "G-8BVX3NVG3E"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const container = document.getElementById("container");
const adminMessage = document.getElementById("adminMessage");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

let allParticipants = {};

// EmailJS initialization - make sure EmailJS SDK is loaded in your HTML:
// <script type="text/javascript" src="https://cdn.emailjs.com/sdk/2.3.2/email.min.js"></script>
// emailjs.init("your_public_key");
emailjs.init("7fPRhFP1zPRl5zDGy"); // <-- replace with your EmailJS public key

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    displayMessage("Please sign in to continue.", "#000", "#ffeaa7");
    container.innerHTML = "";
    return;
  }

  try {
    const isAdminSnap = await db.ref(`admins/${user.uid}`).get();
    if (!isAdminSnap.exists()) {
      displayMessage("Access denied. Admins only.", "#e74c3c", "#f9ebea");
      container.innerHTML = "";
      return;
    }

    displayMessage("Welcome, Admin!", "#2ecc71", "#ecf9f1");
    initSearchBar();
    loadParticipants();

  } catch (error) {
    console.error("Error verifying admin:", error);
    displayMessage("Error verifying admin status.", "red", "#fff");
  }
});

function displayMessage(text, color, background) {
  adminMessage.textContent = text;
  adminMessage.style.color = color;
  adminMessage.style.background = background;
  adminMessage.style.padding = "12px";
  adminMessage.style.borderRadius = "6px";
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function initSearchBar() {
  const searchInput = document.createElement("input");
  searchInput.id = "searchBar";
  searchInput.placeholder = "Search participants...";
  Object.assign(searchInput.style, {
    width: "100%", padding: "10px", marginBottom: "16px",
    fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc"
  });

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    const filtered = Object.fromEntries(
      Object.entries(allParticipants).filter(([uid, p]) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term))
      )
    );
    renderParticipants(filtered);
  });

  container.before(searchInput);
}

async function loadParticipants() {
  container.innerHTML = "<p style='color:gray;'>Loading participants...</p>";

  try {
    const snapshot = await db.ref("participants").get();

    if (!snapshot.exists()) {
      container.innerHTML = "<p>No participants found.</p>";
      return;
    }

    allParticipants = snapshot.val();
    allParticipants = Object.fromEntries(
      Object.entries(allParticipants).sort((a, b) =>
        (a[1].name || "").localeCompare(b[1].name || "")
      )
    );

    renderParticipants(allParticipants);

  } catch (err) {
    console.error("Error loading participants:", err);
    container.innerHTML = "<p style='color:red;'>Error loading participants.</p>";
  }
}

function renderParticipants(data) {
  container.innerHTML = "";

  Object.entries(data).forEach(([uid, info]) => {
    const previewCard = document.createElement("div");
    previewCard.className = "participant-preview";

    Object.assign(previewCard.style, {
      border: "1px solid #34495e",
      padding: "14px 18px",
      marginBottom: "12px",
      borderRadius: "8px",
      backgroundColor: "black",
      color: "white",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      transition: "background-color 0.3s ease",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      fontFamily: "Segoe UI, sans-serif",
    });
    previewCard.innerHTML = `
      <span style="font-weight: 600; font-size: 1.15em;">
        ${escapeHtml(info.name || "No Name")}
      </span>
      <span style="font-size: 0.9em; color: #bdc3c7; margin-top: 4px;">
        📧 ${escapeHtml(info.email || "No Email")}
      </span>
      <span style="font-size: 0.8em; color: ${info.emailVerified ? "#27ae60" : "#c0392b"}; margin-top: 2px;">
        ${info.emailVerified ? "✔️ Email Verified" : "❌ Email Not Verified"}
      </span>
    `;

    previewCard.addEventListener("mouseenter", () => {
      previewCard.style.backgroundColor = "#34495e";
    });
    previewCard.addEventListener("mouseleave", () => {
      previewCard.style.backgroundColor = "#2c3e50";
    });

    previewCard.addEventListener("click", () => showDetailPanel(uid, info));
    container.appendChild(previewCard);
  });
}

function showDetailPanel(uid, info) {
  modalContent.innerHTML = `
    <h2 style="margin-bottom: 15px; color: white;">${escapeHtml(info.name || "Unnamed Participant")}</h2>
    <p><strong>Email:</strong> ${escapeHtml(info.email || "N/A")}</p>
    <p><strong>Country:</strong> ${escapeHtml(info.country || "N/A")}</p>
    <p><strong>Graduation Year:</strong> ${escapeHtml(info.gradYear || "N/A")}</p>
    <p><strong>Interest Area:</strong> ${escapeHtml(info.interest || "N/A")}</p>
    <p><strong>Motivation:</strong> ${escapeHtml(info.motivation || "N/A")}</p>
    <p><strong>Email Verified:</strong> ${info.emailVerified ? "✅ Yes" : "❌ No"}</p>
    <p><strong>Skills:</strong> ${escapeHtml(info.skills || "N/A")}</p>
    <p><strong>Achievements:</strong> ${escapeHtml(info.achievements || "N/A")}</p>
    <p><strong>Has Contract:</strong> ${info.hasContract ? "✅" : "❌"}</p>
    <p><strong>Verified:</strong> ${info.verified ? "✅" : "❌"}</p>
    <textarea id="reason-${uid}" placeholder="Reason for rejection..." rows="4"
      style="width: 100%; margin-top: 12px; font-size: 14px; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">${escapeHtml(info.rejectionReason || "")}</textarea>
    <div style="margin-top: 20px; display: flex; gap: 15px; justify-content: flex-end;">
      <button id="acceptBtn" style="background-color: #27ae60; color: white; border: none; padding: 10px 16px; border-radius: 5px; cursor: pointer;">✅ Accept</button>
      <button id="rejectBtn" style="background-color: #c0392b; color: white; border: none; padding: 10px 16px; border-radius: 5px; cursor: pointer;">❌ Reject</button>
      <button id="closeBtn" style="background-color: #7f8c8d; color: white; border: none; padding: 10px 16px; border-radius: 5px; cursor: pointer;">✖️ Close</button>
    </div>
  `;

  modal.style.display = "flex";
Object.assign(modalContent.style, {
  backgroundColor: "#1e1e1e",
  color: "white",
  padding: "24px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90%",
  overflowY: "auto",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)",
  fontFamily: "Arial, sans-serif"
});
  document.getElementById("closeBtn").onclick = closeModal;

  document.getElementById("acceptBtn").onclick = () => {
    db.ref(`participants/${uid}`).update({ verified: true, rejectionReason: "" })
      .then(() => {
        
        let reason = "Congratulations! We will be contacting you soon!";
        sendEmail(info.name, info.email, reason, true);
        alert(`Accepted ${info.email}`);
        closeModal();
        loadParticipants();
      })
      .catch((err) => {
        alert("Failed to accept participant.");
        console.error(err);
      });
  };

  document.getElementById("rejectBtn").onclick = () => {
    const reason = document.getElementById(`reason-${uid}`).value.trim();
    if (!confirm(`Reject ${info.email}?\nReason: ${reason || "None"}`)) return;

    db.ref(`participants/${uid}`).update({ verified: false, rejectionReason: reason })
      .then(() => {
        sendEmail(info.name, info.email, reason, false);
        alert(`Rejected ${info.email}`);
        closeModal();
        loadParticipants();
      })
      .catch((err) => {
        alert("Failed to reject participant.");
        console.error(err);
      });
  };
}

function closeModal() {
  modal.style.display = "none";
}
function sendEmail(name, email, reason, accepted) {
  const templateParams = {
    to_name: name || "Participant",
    to_email: email,
    reason: reason || "N/A"
  };

  // Use your exact template IDs here
  const templateID = accepted ? "template_0p6w8pd" : "template_whg8wba";

  emailjs.send("service_1lzidld", templateID, templateParams)
    .then(() => {
      console.log(`Email ${accepted ? "acceptance" : "rejection"} sent to ${email}`);
    })
    .catch((error) => {
      console.error("EmailJS error:", error);
    });
}
