import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";




const firebaseConfig = {
  apiKey: "AIzaSyDL1etbU_dTrjcwhq-ZyYo-ytl66ito_WA",
  authDomain: "quickvote-69134.firebaseapp.com",
  projectId: "quickvote-69134",
  storageBucket: "quickvote-69134.appspot.com",
  messagingSenderId: "588080730778",
  appId: "1:588080730778:web:52f1e98da9be1ab2a10523",
  measurementId: "G-5DHG9ZN23J"
};

// Initialize Firebase
export const LionApp = initializeApp(firebaseConfig);
export const Analytics = getAnalytics(LionApp);
export const LionAppDb = getFirestore(LionApp);
export const LionStorage = getStorage(LionApp);
