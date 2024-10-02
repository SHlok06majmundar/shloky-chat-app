import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5WLKDz3TTi4Mitlna8ivqRpAHxzMWPPw",
  authDomain: "chat-app-c6012.firebaseapp.com",
  projectId: "chat-app-c6012",
  storageBucket: "chat-app-c6012.appspot.com",
  messagingSenderId: "378105730193",
  appId: "1:378105730193:web:a8eb640169b5b5f2529b30",
  measurementId: "G-T23765Q7C7"
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
