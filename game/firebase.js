import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebasestorage.app",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770",
  measurementId: "G-TNJ32PDHHR"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

export function getPlayerDoc(playerId) {
  return doc(db, "players", playerId);
}

export async function savePlayerData(playerId, data) {
  try {
    const playerDoc = getPlayerDoc(playerId);
    await setDoc(playerDoc, data);
  } catch (e) {
    console.error("Błąd zapisu do Firebase:", e);
  }
}

export async function loadPlayerData(playerId) {
  try {
    const playerDoc = getPlayerDoc(playerId);
    const snap = await getDoc(playerDoc);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error("Błąd wczytywania z Firebase:", e);
  }
  return null;
}
