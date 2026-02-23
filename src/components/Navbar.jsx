import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Shuffle, LogOut, Menu, X, Ticket } from "lucide-react";
import WalletConnect from "./WalletConnect";
import { useNavigate } from "react-router-dom";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // 👈 mobile menu toggle

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkToken();
    window.addEventListener("auth-change", checkToken);
    return () => window.removeEventListener("auth-change", checkToken);
  }, []);

  const handleWalletConnect = (wallet) => {
    setConnectedWallet(wallet);
    setIsWalletConnected(true);
  };

  const handleWalletDisconnect = () => {
    setConnectedWallet(null);
    setIsWalletConnected(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    handleWalletDisconnect();
    navigate("/");
    window.dispatchEvent(new Event("auth-change"));
    setMenuOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-950 via-black to-slate-950 border-b border-slate-800 backdrop-blur-xl relative z-50">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* === Left Section: Logo === */}
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-950 rounded-lg">
              <img src="/favicon.ico" alt="Logo" width={150} height={150} />
            </div>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">HedgeX</h1>
            <p className="text-slate-400 text-sm">Admin Portal</p>
          </div>
        </div>

        {/* === Desktop Center Tabs === */}
        <div className="hidden sm:flex items-center gap-4">
          {isLoggedIn && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab("pool");
                  navigate("/hedgingRebalance");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === "pool"
                    ? "bg-emerald-600/20 border border-emerald-600 text-emerald-400"
                    : "hover:bg-slate-800 text-slate-300"
                  }`}
              >
                <LineChart size={18} />
                <span>Pool Hedging</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {setActiveTab("rebalance"),
                  navigate("/hedgingRebalance")
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === "rebalance"
                    ? "bg-emerald-600/20 border border-emerald-600 text-emerald-400"
                    : "hover:bg-slate-800 text-slate-300"
                  }`}
              >
                <Shuffle size={18} />
                <span>Rebalance Details</span>
              </motion.button>
            </>
          )}
        </div>

        {/* === Desktop Wallet/Logout === */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn && (
            <>
              {/* Tickets */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                 onClick={() => {
                  setActiveTab("");
                  navigate("/tickets");
                }
              }
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-emerald-600/20 border border-emerald-600
                           text-emerald-400 hover:bg-emerald-600/30"
              >
                <Ticket size={16} />
                Tickets
              </motion.button>

              <WalletConnect
                isConnected={isWalletConnected}
                connectedWallet={connectedWallet}
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                showModal={showWalletModal}
                setShowModal={setShowWalletModal}
              />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.05]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* === Mobile Menu Button === */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-300 hover:text-emerald-400 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* === Mobile Dropdown Menu === */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-black border-t border-slate-800 px-4 pb-4 space-y-3"
          >


            {/* Tabs */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab("pool");
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "pool"
                    ? "bg-emerald-600/20 border border-emerald-600 text-emerald-400"
                    : "hover:bg-slate-800 text-slate-300"
                  }`}
              >
                <LineChart size={18} />
                <span>Pool Hedging</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("rebalance");
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "rebalance"
                    ? "bg-emerald-600/20 border border-emerald-600 text-emerald-400"
                    : "hover:bg-slate-800 text-slate-300"
                  }`}
              >
                <Shuffle size={18} />
                <span>Rebalance Details</span>
              </button>
            </div>
            {/* Wallet Connect */}
            {isLoggedIn && (
              <WalletConnect
                isConnected={isWalletConnected}
                connectedWallet={connectedWallet}
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                showModal={showWalletModal}
                setShowModal={setShowWalletModal}
              />
            )}
            {/* Logout */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.03]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
