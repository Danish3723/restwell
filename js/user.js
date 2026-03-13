/* ================================
   GLOBAL API
================================ */
const API = "https://restwell-backend.onrender.com/api/bookings";

/* ================================
   AUTO-FILL SERVICE ON PAGE LOAD
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const serviceSelect = document.getElementById("service");

  const storedService = localStorage.getItem("selectedService");
  const params = new URLSearchParams(window.location.search);
  const urlService = params.get("service");
  const finalService = urlService || storedService;

  if (finalService && serviceSelect) {
    serviceSelect.value = finalService;
  }

  toggleCustomOptions();
  setupLogout();
  revealElements();
});

/* ================================
   SHOW / HIDE CUSTOM OPTIONS
================================ */
function toggleCustomOptions() {
  const service = document.getElementById("service")?.value;
  const customOptions = document.getElementById("customOptions");

  if (!customOptions) return;

  customOptions.style.display =
    service === "Custom Furniture" ? "block" : "none";
}

/* ================================
   BOOK SERVICE
================================ */
async function bookService() {

  console.log("NEW BOOK SERVICE RUNNING");

  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const service = document.getElementById("service")?.value;
  const customType = document.getElementById("customType")?.value;
  const preferredDate = document.getElementById("preferredDate")?.value;
  const timeSlot = document.getElementById("timeSlot")?.value;
  const description = document.getElementById("description")?.value;

  const msgBox = document.getElementById("bookingMessage");

  if (!msgBox) {
    console.log("bookingMessage div not found");
    return;
  }

  msgBox.innerHTML = "";

  if (!name || phone.length !== 10) {
    msgBox.innerHTML = `<div class="booking-msg error">
      Enter valid name and 10-digit phone number
    </div>`;
    return;
  }

  try {

    console.log("Sending request...");

    const res = await fetch(
      "https://restwell-backend.onrender.com/api/bookings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: name,
          phone,
          serviceName: service,
          preferredDate,
          timeSlot,
          description
        })
      }
    );

    console.log("Response received");

    if (!res.ok) throw new Error("Failed");

    /* ===== SUCCESS UI FIRST ===== */
    msgBox.innerHTML = `
      <div class="booking-msg success">
        Booking Created Successfully 🎉
      </div>
    `;

    /* ===== THEN CREATE WHATSAPP LINK ===== */
    const message = `Hi RestWell,
Service: ${service}
Name: ${name}
Phone: ${phone}
Date: ${preferredDate}
Time: ${timeSlot}
Description: ${description}`;

    const whatsappURL =
      `https://api.whatsapp.com/send?phone=919029551130&text=${encodeURIComponent(message)}`;

    msgBox.innerHTML += `
      <div style="margin-top:10px;">
        <a href="${whatsappURL}" target="_blank" class="whatsapp-btn">
          Confirm on WhatsApp
        </a>
      </div>
    `;

    /* ===== SAFE RESET ===== */
    const form = document.getElementById("bookingForm");
    if (form) form.reset();

    const customOptions = document.getElementById("customOptions");
    if (customOptions) customOptions.style.display = "none";

  } catch (err) {

    console.log("ERROR OCCURRED:", err);

    msgBox.innerHTML = `
      <div class="booking-msg error">
        Something went wrong. Try again.
      </div>
    `;
  }
}

/* ================================
   SHOW MESSAGE
================================ */
function showMessage(text, type) {
  const msgBox = document.getElementById("bookingMessage");
  msgBox.innerText = text;
  msgBox.className = type === "success" ? "msg success" : "msg error";
  msgBox.style.display = "block";
}

/* ================================
   SCROLL REVEAL
================================ */
function revealElements() {
  document.querySelectorAll(".reveal").forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealElements);

/* ================================
   SERVICE CLICK HANDLER
================================ */
function handleServiceClick(serviceName) {
  const userId = localStorage.getItem("userId");

  localStorage.setItem("selectedService", serviceName);

  if (!userId) {
    document.getElementById("loginModal").style.display = "flex";
  } else {
    window.location.href = "booking.html";
  }
}

/* ================================
   FIREBASE AUTH STATE
================================ */
firebase.auth().onAuthStateChanged(async user => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    localStorage.setItem("userId", user.uid);

    if (logoutBtn) logoutBtn.style.display = "inline-block";

    // Auto-fill booking form
    const phoneInput = document.getElementById("phone");
    const nameInput = document.getElementById("name");

    if (phoneInput || nameInput) {
      const userDoc = await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      if (userDoc.exists) {
        const data = userDoc.data();
        if (phoneInput) {
          phoneInput.value = data.phone || "";
          phoneInput.readOnly = true;
        }
        if (nameInput) nameInput.value = data.email || "";
      }
    }

  } else {
    localStorage.removeItem("userId");
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

/* ================================
   REGISTER USER
================================ */
function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const phone = document.getElementById("regPhone").value.trim();

  if (phone.length !== 10) {
    return document.getElementById("registerError").innerText =
      "Enter valid 10-digit phone";
  }

  firebase.auth()
    .createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      return firebase.firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set({
          email,
          phone,
          createdAt: new Date()
        });
    })
    .then(() => {
      alert("Registration successful!");
      window.location.href = "index.html";
    })
    .catch(error => {
      document.getElementById("registerError").innerText = error.message;
    });
}

/* ================================
   LOGIN USER
================================ */
function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();

  if (phone.length !== 10) {
    return document.getElementById("loginError").innerText =
      "Enter valid 10-digit phone";
  }

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(async userCredential => {
      const userDoc = await firebase.firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .get();

      if (!userDoc.exists || userDoc.data().phone !== phone) {
        throw new Error("Phone mismatch");
      }

      window.location.href = "booking.html";
    })
    .catch(error => {
      document.getElementById("loginError").innerText = error.message;
    });
}

/* ================================
   LOGOUT
================================ */
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    firebase.auth().signOut().then(() => {
      window.location.href = "home.html";
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {

  const dateInput = document.getElementById("preferredDate");

  const today = new Date().toISOString().split("T")[0];

  dateInput.setAttribute("min", today);

});
