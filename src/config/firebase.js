import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaAlHyQV_IMVrE3aQfBcjEW7fdbHCWT2M",
  authDomain: "shlok-chat-app-a8727.firebaseapp.com",
  projectId: "shlok-chat-app-a8727",
  storageBucket: "shlok-chat-app-a8727.appspot.com",
  messagingSenderId: "887314576740",
  appId: "1:887314576740:web:2ad6b0b154ebdabc8c7671",
  measurementId: "G-KMHZZ18011"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Signup function
const signup = async (username, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created:", user.uid);

    // Add user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "", 
      avatar: "", 
      bio: "Hey, there! I am using chatapp",
      lastSeen: Date.now(),
    });

    console.log("User data added to Firestore");

    // Initialize an empty chat document for the user
    await setDoc(doc(db, "chats", user.uid), {
      chatdata: [],
    });

    console.log("Chat data initialized for the user");
  } catch (error) {
    console.error("Error during signup:", error.message);
    throw new Error("Signup failed. Please try again.");
  }
};

// Login function
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in user:", userCredential.user.uid);
  } catch (error) {
    console.error("Error during login:", error.message);
    throw new Error("Login failed. Please check your credentials.");
  }
};

// Reset Password function
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to", email);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    throw new Error("Failed to send reset email. Please try again.");
  }
};

export { auth, db, signup, login, resetPassword };
