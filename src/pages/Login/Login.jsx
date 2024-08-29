import React, { useState } from "react";
import assets from "../../assets/assets.js";
import "./Login.css";
import { login, signup,resetPass } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign Up") {
      signup(userName, email, password);
    
    } else {
      login(email, password);
      
    }
    
  };

  return (
    <div className="login">
      <img src={assets.logo_big} alt="logo" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign Up" ? (
          <input
            type="text"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            value={userName}
            className="form-input"
            placeholder="User Name"
            required
          />
        ) : null}
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="form-input"
          placeholder="Email Address"
          required
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="form-input"
          placeholder="Password"
          required
        />
        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {currState === "Login" ? (
          <p className="login-toggle">
            Forgot Password <span onClick={() => resetPass(email)}>Reset here</span>
          </p>
        ) : null}
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the Terms of Use & Privacy Policy</p>
        </div>
        <div className="login-forget">
          {currState === "Sign Up" ? (
            <p className="login-toggle">
              Already have an account{" "}
              <span onClick={() => setCurrState("Login")}>Login</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account ?{" "}
              <span onClick={() => setCurrState("Sign Up")}>Click here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
