// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBt2CG-X_PdYCZAIyEdp-lyTL61HhCJYN8",
  authDomain: "usermanagement-2c34d.firebaseapp.com",
  projectId: "usermanagement-2c34d",
  storageBucket: "usermanagement-2c34d.appspot.com",
  messagingSenderId: "151960485470",
  appId: "1:151960485470:web:3d7c5fa9158d1fd2b97ecf",
  measurementId: "G-RVR8QWSWF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// If we're running locally, connect to the emulators
if (window.location.hostname === 'localhost') {
  console.log("Development mode: Connecting to local Firebase emulators.");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { auth, db, functions, analytics };
export default app; 