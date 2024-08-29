import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate.jsx";
 import { ToastContainer, toast } from "react-toastify";
 import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/Firebase.js";
import { AppContext } from "./context/AppContext.jsx";
function App() {

  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);
  

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate('/chat')
        await loadUserData(user.uid);
      }
      else {
        navigate('/')
      }
    })
    
  },[])
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false} // Show progress bar or not
        newestOnTop={false} // Newest toast on top
        closeOnClick
        rtl={false}
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/chat" element={<Chat />}></Route>
        <Route path="/profileUpdate" element={<ProfileUpdate />}></Route>
      </Routes>
    </>
  );
}

export default App;
