// Firebase configuration using existing Firebase instance from user's system
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCb4U_ym-isdWjB9vYEPgnS_m1apBgXxtQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fairfield-stock-control.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fairfield-stock-control",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fairfield-stock-control.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "290258377915",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:290258377915:web:888de79df63592ab041d9e"
};
