import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  X, 
  CheckCircle, 
  ExternalLink, 
  Download, 
  Shield,
  Zap,
  Globe,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { SUPPORTED_WALLETS } from './dashboard/dashboardData';
import { useAccount, useBalance, useConnect, useDisconnect, useChainId } from 'wagmi';
/* wagmi v2 hook name */
import { useSwitchChain } from 'wagmi';
/* if you’re on wagmi v1, swap import to:
   import { useSwitchNetwork as useSwitchChain } from 'wagmi';
*/
// import { useGetAllWalletsMutation } from '../services/auth';
import localStore from "../lib/localStore";
// import { useSelector } from "react-redux";
import {STORAGES} from "../lib/constants.js";
import {toast} from "react-toastify";

/* -------- Base Mainnet constants -------- */
const BASE_CHAIN_ID = 8453;
const BASE_HEX = '0x2105'; // 8453 in hex
const BASE_PARAMS = {
  chainId: BASE_HEX,
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getNetworkNameByChainId(id) {
  if (!id && id !== 0) return 'Unknown';
  if (id === BASE_CHAIN_ID) return 'Base';
  return `Chain ${id}`;
}

async function requestAddOrSwitchBase() {
  if (!window?.ethereum) throw new Error('No injected provider');
  try {
    // Try a plain switch first (works if chain already added)
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_HEX }],
    });
  } catch (switchErr) {
    // If chain not added, add it then switch
    if (switchErr?.code === 4902 /* Unrecognized chain */) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_PARAMS],
      });
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_HEX }],
      });
    } else {
      throw switchErr;
    }
  }
}

function WalletConnect({ 
  isConnected: isConnectedProp, 
  connectedWallet, 
  onConnect, 
  onDisconnect, 
  showModal, 
  setShowModal,
  bypassAuthForIdo = false,
}) {
  const [isConnecting, setIsConnecting] = useState(null);
  const [connectionStep, setConnectionStep] = useState('select');
   const [mounted, setMounted] = useState(false); // ✅ NEW

  useEffect(() => {
    setMounted(true); // ✅ Wait until DOM exists
  }, []);

  const lastAddressRef = useRef();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address, chainId, query: { enabled: !!address } });
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  /* wagmi v2 */
  const { switchChainAsync } = useSwitchChain?.() || { switchChainAsync: undefined };
  /* for wagmi v1 you’ll have: const { switchNetworkAsync: switchChainAsync } = useSwitchChain(); */

  // 1) Detect mobile browsers (Chrome/Safari/etc.)
  const isMobileBrowser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || '';
    return /android|iphone|ipad|ipod|mobile/i.test(ua);
  }, []);

  // 2) Decide which wallets to render in the list
  const walletsToRender = useMemo(() => {
    if (isConnected) return [];
    // On mobile: show only WalletConnect option; clicking it opens WC’s wallet list/deep-link flow
    return isMobileBrowser
      ? SUPPORTED_WALLETS.filter(w => w.id === 'walletConnect')
      : SUPPORTED_WALLETS;
  }, [isMobileBrowser, isConnected]);

  // Keep parent callbacks in sync for legacy state usage
  useEffect(() => {
    if (address && lastAddressRef.current !== address) {
      lastAddressRef.current = address;
      onConnect?.(connectedWallet || { id: 'wagmi', name: 'Wallet', icon: '🔗' });
    }
    if (!address && lastAddressRef.current) {
      lastAddressRef.current = undefined;
      onDisconnect?.();
    }
  }, [address, onConnect, onDisconnect, connectedWallet]);

  // Auto-switch to Base when connected on a different chain
  useEffect(() => {
    const doAutoSwitch = async () => {
      if (!isConnected || !chainId) return;
      if (chainId === BASE_CHAIN_ID) return;
      try {
        if (switchChainAsync) {
          await switchChainAsync({ chainId: BASE_CHAIN_ID });
        } else {
          await requestAddOrSwitchBase();
        }
        toast.success('Switched to Base mainnet');
      } catch (err) {
        // Non-blocking; show a CTA button in UI
        toast.warn('Please switch to Base mainnet to continue.');
      }
    };
    doAutoSwitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId]);

  const connectorForWalletId = useMemo(() => {
    const lower = (s) => (s || '').toLowerCase();
    return (walletId) => {

      switch (walletId) {
        case 'metamask':
          return connectors.find(c => lower(c.id).includes('metamasksdk') || lower(c.name).includes('metamask')) || connectors.find(c => lower(c.id) === 'injected');
        case 'walletConnect':
          return connectors.find(c => lower(c.id).includes('walletconnect') || lower(c.name).includes('walletconnect'));
        case 'coinbase':
          return connectors.find(c => lower(c.id).includes('coinbase') || lower(c.name).includes('coinbase'));
        case 'trust':
          return connectors.find(c => lower(c.name).includes('trust')) || connectors.find(c => lower(c.id) === 'injected');
        // case 'rainbow':
        //   return connectors.find(c => lower(c.name).includes('rainbow')) || connectors.find(c => lower(c.id).includes('wallet'));
        case 'phantom':
          return connectors.find(c => lower(c.id).includes('app.phantom')) || connectors.find(c => lower(c.id).includes('phantom')) || connectors.find(c => lower(c.name).includes('phantom'));
        default:
          {
          return connectors[0];
          }
      }
    };
  }, [connectors]);

  const trySwitchToBase = async () => {
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: BASE_CHAIN_ID });
      } else {
        await requestAddOrSwitchBase();
      }
      toast.success('Switched to Base mainnet');
    } catch (err) {
      toast.error('Failed to switch network. Please switch to Base in your wallet.');
    }
  };

  const handleWalletSelect = async (wallet) => {
    
    try {
      setIsConnecting(wallet.id);
      setConnectionStep('connecting');
      
      const connector = connectorForWalletId(wallet.id);
      if (!connector) throw new Error('No compatible connector found');

      const result = await connectAsync({ connector });
      const connectedAddress = (result?.account || result?.accounts?.[0] || address || '').toString();

      // Ensure Base after connect
      try {
        const currentChainId = result?.chainId || chainId;
        if (currentChainId !== BASE_CHAIN_ID) {
          if (switchChainAsync) {
            await switchChainAsync({ chainId: BASE_CHAIN_ID });
          } else {
            await requestAddOrSwitchBase();
          }
        }
      } catch (netErr) {
        // Not fatal; show a banner & CTA later
      }

      // Authorization list check
      // if (!bypassAuthForIdo) {
      //   const matchedEntry = Array.isArray(walletsData)
      //     ? walletsData.find(
      //         (entry) =>
      //           entry?.address &&
      //           entry.address.toLowerCase() === connectedAddress.toLowerCase()
      //       )
      //     : null;
      //   const isAllowed = !!matchedEntry;
      //   if (!isAllowed) {
      //     disconnect();
      //     setConnectionStep('select');
      //     setIsConnecting(null);
      //     setShowModal(true);
      //     toast.error('Your wallet is not whitelisted. Please whitelist it to access our services.');
      //     return;
      //   }
      //   // Only from here on you can safely use matchedEntry data like referralCode
      //   const referralCode = matchedEntry?.referralCode;
      //   if (referralCode) {
      //     localStore.setItem(STORAGES.REFERRAL_CODE || 'referralCode', referralCode);
      //     try { window.dispatchEvent(new Event('referralCodeChanged')); } catch (_) {}
      //   }
      // }
  

      setConnectionStep('success');
      setTimeout(() => {
        onConnect?.(wallet);
        setShowModal(false);
        setConnectionStep('select');
        setIsConnecting(null);
      }, 1000);
    } catch (e) {
      setConnectionStep('select');
      setIsConnecting(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnect?.();
    try { 
      localStore.removeItem(STORAGES.REFERRAL_CODE || 'referralCode'); 
      try { window.dispatchEvent(new Event('referralCodeChanged')); } catch (_) {}
    } catch (_) {}
    setShowModal(false);
  };

  // wallet check 
  // const { email } = useSelector((state) => state.global);
  const localEmail = localStore?.getItem(STORAGES?.REMEMBERED_EMAIL);
  // const [getAllWallets] = useGetAllWalletsMutation();
  const [walletsData, setWalletsData] = useState([]);

  // useEffect(() => {
  //   const userEmail = email || localEmail;
  //   const fetchWallets = async () => {
  //     try {
  //       if (!bypassAuthForIdo) {
  //       const response = await getAllWallets({ email: userEmail }).unwrap();
  //         if (response.wallets.length > 0) setWalletsData(response.wallets);
  //       }
  //     } catch (error) {
  //       // console.error('Failed to fetch wallet status:', error);
  //     }
  //   };
  //   fetchWallets();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [showModal]);

  const wrongChain = isConnected && chainId && chainId !== BASE_CHAIN_ID;

  return (
    <>
      {/* Wallet Connect Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all backdrop-blur-xl border ${
          isConnected
            ? (wrongChain 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30')    
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={wrongChain ? 'Wrong network – click to switch' : undefined}
      >
        <motion.div
          animate={{ 
            rotate: isConnected && !wrongChain ? [0, 360] : 0,
            scale: isConnected ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          {isConnected ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
        </motion.div>
        <span className="text-sm font-medium ">
          {isConnected 
            ? (wrongChain ? 'Switch to Base' : (connectedWallet?.name || truncateAddress(address))) 
            : 'Connect Wallet'}
        </span>
        {isConnected && !wrongChain && (
          <motion.div
            className="w-2 h-2 bg-blue-500/20 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {isConnected && wrongChain && (
          <motion.div
            className="w-2 h-2 bg-blue-500/20 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showModal && (
          
          <motion.div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isConnecting && setShowModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              className="relative self-start w-full max-w-md  bg-gray-900/98 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl "
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
              initial={{ opacity: 0, scale: 0.9}}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Gradient Header */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
              />

              {/* Modal Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <motion.div
                      className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity }
                      }}
                    >
                      <Wallet className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {isConnected ? 'Manage your connection' : 'Choose your preferred wallet'}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.button
                    onClick={() => !isConnecting && setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-xl"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ x: 20, opacity: 0, rotate: -90 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    disabled={!!isConnecting}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[70vh]">
                <div className="p-6">
                <AnimatePresence mode="wait">
                    {connectionStep === 'select' && (
                      <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isConnected ? (
                          /* Connected Wallet Info */
                          <motion.div
                            className="space-y-6"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            {wrongChain && (
                              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
                                You are on <b>{getNetworkNameByChainId(chainId)}</b>. Please switch to <b>Base</b>.
                                <button
                                  onClick={trySwitchToBase}
                                  className="ml-3 inline-flex items-center px-3 py-1 rounded-lg border border-amber-400/40 hover:border-amber-300/60 hover:bg-amber-400/10"
                                >
                                  Switch to Base
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                              <motion.div
                                className="text-4xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {connectedWallet?.icon || '🔗'}
                              </motion.div>
                              <div className="flex-1">
                                <h4 className="font-bold text-white">{connectedWallet?.name || 'Wallet'}</h4>
                                <p className="text-emerald-400 text-sm">Connected successfully</p>
                                <p className="text-gray-400 text-xs mt-1">{truncateAddress(address)}</p>
                              </div>
                              <motion.div
                                className={`w-3 h-3 rounded-full ${wrongChain ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [1, 0.5, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <motion.div 
                                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center"
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="text-lg font-bold text-blue-400">{balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '--'}</div>
                                <div className="text-xs text-gray-400">Balance</div>
                              </motion.div>
                              <motion.div 
                                className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center"
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="text-lg font-bold text-purple-400">{getNetworkNameByChainId(chainId)}</div>
                                <div className="text-xs text-gray-400">Network</div>
                              </motion.div>
                            </div>

                            {wrongChain && (
                              <motion.button
                                onClick={trySwitchToBase}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl transition-all border border-amber-500/30 hover:border-amber-500/50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="font-medium">Switch to Base</span>
                              </motion.button>
                            )}

                            <motion.button
                              onClick={handleDisconnect}
                              className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all border border-red-500/20 hover:border-red-500/40"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <X className="h-4 w-4" />
                              <span className="font-medium">Disconnect Wallet</span>
                            </motion.button>
                          </motion.div>
                        ) : (
                          /* Wallet Selection */
                          <div className="space-y-3">
                            {walletsToRender.map((wallet, index) => (
                              <motion.button
                                key={wallet.id}
                                onClick={() => handleWalletSelect(wallet)}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-white/20 group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={!!isConnecting}
                              >
                                <motion.div
                                  className="text-3xl"
                                  whileHover={{ scale: 1.2, rotate: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {wallet.icon}
                                </motion.div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                                      {wallet.name}
                                    </h4>
                                    {wallet.installed && (
                                      <motion.div
                                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        Installed
                                      </motion.div>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                                    {wallet.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                {!wallet.installed && wallet.downloadLink && (
                                <motion.a
                                  href={wallet.downloadLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  title={`Download ${wallet.name}`}
                                >
                                  <Download className="h-4 w-4" />
                                </motion.a>
                              )}

                              {wallet.shareLink && (
                                <motion.a
                                  href={wallet.shareLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                                  title={`Visit ${wallet.name} Website`}
                                >
                                  <ExternalLink className="h-4 w-4 text-gray-500 hover:text-emerald-400" />
                                </motion.a>
                              )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {connectionStep === 'connecting' && (
                      <motion.div
                        key="connecting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center relative"
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                          }}
                        >
                          <RefreshCw className="h-8 w-8 text-white" />
                          
                          {/* Spinning ring */}
                          <motion.div
                            className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        </motion.div>
                        <h4 className="text-xl font-bold text-white mb-2">Connecting...</h4>
                        <p className="text-gray-400 mb-4">
                          Please confirm the connection in your {SUPPORTED_WALLETS.find(w => w.id === isConnecting)?.name} wallet
                        </p>
                        <motion.div
                          className="flex items-center justify-center gap-2 text-sm text-emerald-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>Check your wallet app</span>
                        </motion.div>
                      </motion.div>
                    )}

                    {connectionStep === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: 2 }}
                          >
                            <CheckCircle className="h-8 w-8 text-white" />
                          </motion.div>
                          
                          {/* Success ring */}
                          <motion.div
                            className="absolute inset-0 border-4 border-emerald-400/30 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                        <h4 className="text-xl font-bold text-white mb-2">Connected!</h4>
                        <p className="text-gray-400">
                          Your wallet has been connected successfully
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default WalletConnect;
