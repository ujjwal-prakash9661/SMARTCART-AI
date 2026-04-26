import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCqMB2gUnP714X19lbxyXRNnZkcbJG3KWc",
  authDomain: "smartcart-ai-ccfaf.firebaseapp.com",
  projectId: "smartcart-ai-ccfaf",
  storageBucket: "smartcart-ai-ccfaf.firebasestorage.app",
  messagingSenderId: "1002748262120",
  appId: "1:1002748262120:web:68049314acf45e6d167b5d",
  measurementId: "G-WYZB18EEHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported and in a browser environment
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(err => console.log("Analytics not supported in this environment"));

export const auth = getAuth(app);
export { analytics };
