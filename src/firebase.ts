
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDR_WMNlHY-gx1Cne0SzVeIKc5Aoe53keU",
  authDomain: "masm4832.firebaseapp.com",
  projectId: "masm4832",
  storageBucket: "masm4832.appspot.com",
  messagingSenderId: "220887093128",
  appId: "1:220887093128:web:aee12c6a6bf9246bdb343d",
  measurementId: "G-WN4XDEH3N7"
};

const app = initializeApp(firebaseConfig);

// Analytics can only be used in supported environments (not SSR, not some browsers)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
