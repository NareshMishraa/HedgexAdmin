import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Mail, Shield, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useSendResetPasswordOtpMutation,
  useVerifyResetPasswordOtpMutation,
  useResetPasswordMutation,
} from "../api/authApi";

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // ✅ RTK Query Mutations
  const [sendOtp, { isLoading: sendingOtp }] = useSendResetPasswordOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] =
    useVerifyResetPasswordOtpMutation();
  const [resetPwd, { isLoading: resettingPwd }] = useResetPasswordMutation();

  // ===== Handlers =====
  const handleSendOtp = async () => {
    if (!email) return toast.error("Please enter your email");

    try {
      const result = await sendOtp({ email }).unwrap();
      toast.success(result?.message || "OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send OTP");
    }
  };

  const handleOtpInput = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(data)) {
      setOtp(data.split(""));
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) return toast.error("Enter all 6 digits");

    try {
      const result = await verifyOtp({ email, otp: otpValue }).unwrap();
      toast.success(result?.message || "OTP verified successfully!");
      setStep("reset");
    } catch (err) {
      toast.error(err?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword)
      return toast.error("Please fill out all fields");

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const result = await resetPwd({ email, password, confirmPassword }).unwrap();
      toast.success(result?.message || "Password reset successful!");
      navigate("/");
      // reset states
      setStep("email");
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: -10 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateX: 10 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative bg-gray-950 border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
        />

        <button
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <Mail className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">
                  Forgot Password
                </h3>
                <p className="text-gray-400 text-sm">
                  Enter your registered email to receive an OTP
                </p>
              </div>

              <input
                type="email"
                className="w-full p-3 mb-4 rounded-lg bg-gray-900 border border-gray-700 text-white"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">Verify OTP</h3>
                <p className="text-gray-400 text-sm">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-emerald-400">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((d, i) => (
                  <motion.input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all focus:bg-white/15 focus:scale-110"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              <p
                onClick={() => setStep("email")}
                className="text-gray-400 text-sm mt-4 text-center cursor-pointer hover:text-emerald-400"
              >
                ← Back to Email
              </p>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              key="reset-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <KeyRound className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">
                  Set New Password
                </h3>
                <p className="text-gray-400 text-sm">
                  Enter and confirm your new password
                </p>
              </div>

              <input
                type="password"
                placeholder="New Password"
                className="w-full mb-4 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full mb-6 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                onClick={handleResetPassword}
                disabled={resettingPwd}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {resettingPwd ? "Changing..." : "Change Password"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
