import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, getDocs, where } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyCicxdmmefZDquQeUTPh_IaSlyx02OLpv8",
  authDomain: "wullarchat-dd4aa.firebaseapp.com",
  projectId: "wullarchat-dd4aa",
  storageBucket: "wullarchat-dd4aa.appspot.com",
  messagingSenderId: "823377746186",
  appId: "1:823377746186:web:f2859a21306b8d2d0b42f3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, I am Robot",
      lastseen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      toast.error("Email already in use. Please use a different email.");
    } else {
      toast.error(`Signup failed: ${error.message}`);
    }
    console.error("Error during signup:", error);
  }
};

const login = async (email, password) => {
  // login logic here
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast("Sucessfully Login");
  } catch (error) {
    //auth/invalid-credential
    if (error.code === "auth/invalid-credential") {
      toast.error("Invald Credentials");
    } else {
      toast.error(`Login failed: ${error.message}`);
    }
    console.error("Error during Login:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/").join[1].split(" "));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast("Enter your email!")
    return null;
  }
  try {
    const userref = collection(db, 'users');
    const q = query(userref, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email");
    }
    else {
      toast.error("Email doesn't exists");
    }
  } catch (error) {
    console.error(error)
  }
}


export { signup, login, logout, auth, db,resetPass };
