import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import assets from '../../assets/assets';
import { signup, login, resetPassword } from "../../config/firebase.js"; // import resetPassword

const Login = () => {
    const [currState, setCurrState] = useState("Sign up");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [forgotPassword, setForgotPassword] = useState(false); // Add forgotPassword state
    const navigate = useNavigate();

    // Validate password to contain at least 2 alphanumeric characters
    const isPasswordValid = (password) => {
        const alphanumericCount = password.replace(/[^a-z0-9]/gi, '').length;
        return alphanumericCount >= 2;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (forgotPassword) {
            // Handle Password Reset
            try {
                await resetPassword(email);
                alert("Password reset email sent. Check your inbox.");
                setForgotPassword(false); // Reset state after email is sent
            } catch (error) {
                alert(`Error sending password reset email: ${error.message}`);
            }
        } else if (currState === "Sign up") {
            // Sign up logic
            if (!isPasswordValid(password)) {
                alert("Password must contain at least 2 alphanumeric characters.");
                return;
            }
            try {
                await signup(userName, email, password);
                alert("Account created successfully");
                navigate("/chat");
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    alert("Email is already registered. Please log in or use another email.");
                } else {
                    alert(`Error creating account: ${error.message}`);
                }
            }
        } else {
            // Login logic
            try {
                await login(email, password);
                alert("Login successful");
                navigate("/chat");
            } catch (error) {
                if (error.code === 'auth/wrong-password') {
                    alert("Incorrect password. Please try again.");
                } else if (error.code === 'auth/user-not-found') {
                    alert("No account found with this email. Please sign up.");
                } else {
                    alert(`Error logging in: ${error.message}`);
                }
            }
        }
    };

    return (
        <div className="login">
            <img src={assets.logo_big} alt="Logo" className="logo" />
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>{forgotPassword ? "Reset Password" : currState}</h2>
                {currState === "Sign up" && !forgotPassword && (
                    <input
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        type="text"
                        placeholder="Username"
                        className="form-input"
                        required
                    />
                )}
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Email address"
                    className="form-input"
                    required
                />
                {!forgotPassword && (
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        placeholder="Password"
                        className="form-input"
                        required
                    />
                )}
                <button type="submit" className="form-btn">
                    {forgotPassword ? "Send Reset Email" : currState === "Sign up" ? "Create Account" : "Login"}
                </button>
                {currState === "Sign up" && !forgotPassword && (
                    <div className="login-term">
                        <input type="checkbox" required />
                        <p>By signing up, you agree to our Terms and Conditions</p>
                    </div>
                )}
                <div className="login-forgot">
                    {!forgotPassword && (
                        <p
                            className="forgot-password"
                            onClick={() => setForgotPassword(true)}
                        >
                            Forgot Password? Click here
                        </p>
                    )}
                    {forgotPassword && (
                        <p
                            className="login-toggle"
                            onClick={() => setForgotPassword(false)}
                        >
                            Back to login
                        </p>
                    )}
                    {!forgotPassword && (
                        <p className="login-toggle">
                            {currState === "Sign up"
                                ? "Already have an account? "
                                : "New to the platform? "}
                            <span onClick={() => setCurrState(currState === "Sign up" ? "Login" : "Sign up")}>
                                {currState === "Sign up" ? "Login here" : "Create account here"}
                            </span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
