// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// Twój Firebase config (dostarczony przez użytkownika)
const firebaseConfig = {
  apiKey: "AIzaSyAfdKn7K1robyYcTk--hACy0mYYxYLwq0M",
  authDomain: "megrateraz.firebaseapp.com",
  projectId: "megrateraz",
  storageBucket: "megrateraz.firebasestorage.app",
  messagingSenderId: "930984185478",
  appId: "1:930984185478:web:96c9b2c4d273d37f060b07",
  measurementId: "G-0H0NQ54RQ9"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userDoc = doc(db, "clickerScores", "user1"); // jeden użytkownik na próbę

const scoreEl = document.getElementById("score");
const clickBtn = document.getElementById("clickBtn");

let score = 0;

// Wczytaj wynik z Firestore
async function loadScore() {
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    score = docSnap.data().score;
  } else {
    score = 0;
  }
  updateDisplay();
}

// Zapisz wynik do Firestore
async function saveScore() {
  await setDoc(userDoc, { score });
}

// Aktualizuj widok
function updateDisplay() {
  scoreEl.textContent = score;
}

// Obsługa kliknięcia
clickBtn.addEventListener("click", () => {
  score++;
  updateDisplay();
  saveScore();
});

// Start
loadScore();