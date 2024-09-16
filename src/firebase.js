import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD-vl5zHRtRqvo1Em4_LurGLzR_n5N9uUQ",
  authDomain: "user-management-system-a79b5.firebaseapp.com",
  projectId: "user-management-system-a79b5",
  storageBucket: "user-management-system-a79b5.appspot.com",
  messagingSenderId: "401875684781",
  appId: "1:401875684781:web:eef940142f458aeebb6524",
  measurementId: "G-XKPKBF4M7G",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
