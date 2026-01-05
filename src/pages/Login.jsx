import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useUserLoginMutation,
  useVerifyLoginOtpMutation,
} from "../api/authApi";

export default function Login() {
  const [step, setStep] = useState("login"); // login | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  // RTK Mutations
  const [userLogin, { isLoading: isLoginLoading }] = useUserLoginMutation();
  const [verifyLoginOtp, { isLoading: isVerifying }] =
    useVerifyLoginOtpMutation();

  // ===== Handlers =====
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter both email and password");
      return;
    }

    try {
      const result = await userLogin({ email, password }).unwrap();
      toast.success(result?.message || "OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  const handleOtpInput = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      document.getElementById("otp-5")?.focus();
    } else {
      toast.error("Please paste a 6-digit numeric code.");
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Enter all 6 digits");
      return;
    }

    try {
      const result = await verifyLoginOtp({ email, otp: otpValue }).unwrap();
      toast.success(result?.message || "Login successful!");
      if (result?.token) localStorage.setItem("token", result.token);
      window.dispatchEvent(new Event("auth-change"));
      setOtp(["", "", "", "", "", ""]);
      navigate("/hedgingRebalance"); // redirect
    } catch (err) {
      toast.error(err?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-gray-950 mt-[80px] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl relative overflow-hidden backdrop-blur-xl">
        {step === "login" && (
          <div>
            <h2 className="text-white text-2xl font-semibold text-center mb-6">
              Login
            </h2>

            <div className="mb-4">
              <label className="text-gray-300 text-sm">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-300 text-sm">Password</label>
              <input
                type="password"
                className="w-full mt-1 p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end mb-4">
              <button
                className="text-emerald-400 text-sm cursor-pointer hover:text-emerald transition-colors"
                onClick={() => navigate("/forgotPassword")}
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoginLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] text-white p-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoginLoading ? "Sending OTP..." : "Login"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                Verify Your Email
              </h3>
              <p className="text-gray-400">
                Enter the 6-digit code sent to{" "}
                <span className="text-emerald-400">{email}</span>
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-8 h-8 sm:w-12 sm:h-12 bg-white/10 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all focus:bg-white/15 focus:scale-110"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                />
              ))}
            </div>

            <motion.button
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <AnimatePresence mode="wait">
                {isVerifying ? (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </motion.div>
                    <span>Verifying...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <span>Verify & Continue</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <p
              onClick={() => setStep("login")}
              className="text-sm text-emerald-500 text-center mt-6 cursor-pointer hover:text-emerald-400"
            >
              Back to Login
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
