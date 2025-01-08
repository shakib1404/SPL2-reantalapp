import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgetPassword.scss";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/auth/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        console.error("Failed to send OTP");
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmedPassword) {
      setPasswordMatch(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Failed to reset password");
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  return (
    <div className="forgot-password">
      <div className="forgot-password_content">
        {!otpSent ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
              required
            />
            {!passwordMatch && (
              <p style={{ color: "red" }}>Passwords do not match!</p>
            )}
            <button type="submit" disabled={!passwordMatch}>
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
