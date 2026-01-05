"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import dynamic from "next/dynamic";
import {
  Zap, Target, ArrowUpDown, Settings, RefreshCw, ArrowRight,
  AlertTriangle, Sparkles, TrendingUp
} from "lucide-react";
import { toast } from "react-toastify";
import { TOKENS as TOKEN_LIST } from "../../lib/tokens.js";
import ERC20_ABI from "../../abis/TokenContract.json";
import Router_ABI from "../../abis/RouterContract.json";
import PriceQuoter_ABI from "../../abis/PriceQuoterContract.json";
import {
  useAccount, useBalance, useReadContracts, useWriteContract,
  usePublicClient, useConnect
} from "wagmi";
import { zeroAddress, parseUnits, formatUnits } from "viem";
// import { useGetAllTokenPriceQuery, usePutAllRecentActivityMutation } from "@/services/auth";

function TradingInterface({ onPairChange = () => {}, onSwapComplete = () => {} }) {

  const PRICE_QUOTER_ADDRESS=import.meta.env.VITE_PRICE_QUOTER_ADDRESS;
  const ROUTER_CONTRACT_ADDRESS=import.meta.env.VITE_ROUTER_CONTRACT_ADDRESS;

  const SLIPPAGE_OPTIONS = [0.1, 0.5, 1, 3];
  const ETH_META = { key: "ETH", address: zeroAddress, decimals: 18, priceKey: "Ethereum" };

  const fmtUSD = (n) =>
    Number.isFinite(n)
      ? n.toLocaleString(undefined, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 2 })
      : "$0.00";
  const displayName = (k) => (k === "HEDGEX" ? "HGXD" : k === "BITORIO" ? "BITORIO" : k);
  const gradientFor = (symbol) => ({
    BTC: "from-orange-400 to-orange-600",
    WBTC: "from-orange-400 to-orange-600",
    ETH: "from-blue-400 to-purple-600",
    WETH: "from-blue-400 to-purple-600",
    USDC: "from-blue-500 to-blue-700",
    HEDGEX: "from-emerald-400 to-teal-600",
    BITORIO: "from-purple-400 to-pink-600",
  }[symbol] || "from-gray-400 to-gray-600");

  const META_BY_KEY = useMemo(
    () => Object.fromEntries([ETH_META, ...TOKEN_LIST].map(t => [t.key, t])),
    []
  );
  const SELECTABLE = ["WBTC", "HEDGEX", "ETH", "USDC", "BITORIO", "WETH"].filter(k => META_BY_KEY[k]);

  // ------- state -------
  const [mode, setMode] = useState("spot");
  // Default pair = WBTC → HEDGEX
  const [fromKey, setFromKey] = useState("WBTC");
  // const [putRecentActivity] = usePutAllRecentActivityMutation();
  const [toKey, setToKey] = useState("HEDGEX");
  const [inAmount, setInAmount] = useState("");
  const [outAmount, setOutAmount] = useState("");
  const [slip, setSlip] = useState(0.5);
  const [advanced, setAdvanced] = useState(false);

  const [isQuoting, setIsQuoting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [maxBusy, setMaxBusy] = useState(false);

  // ------- wagmi / prices -------
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { connectAsync, connectors } = useConnect();

  // const { data: priceResp } = useGetAllTokenPriceQuery();
  const parsePrice = (s) => (s ? Number(String(s).replace(/[$,]/g, "")) || 0 : 0);

  // const priceMap = useMemo(() => {
  //   const m = Object.create(null);
  //   for (const item of priceResp?.data || []) m[item.name?.toLowerCase?.() || ""] = parsePrice(item.price);
  //   m["usdc"] = 1;
  //   m["weth"] = m["ethereum"] ?? 0;
  //   m["wbtc"] = m["bitcoin"] ?? 0;
  //   m["hedgex"] = m["hedgex"] ?? 0;
  //   m["bitorio"] = m["bitorio"] ?? 0;
  //   return m;
  // }, [priceResp]);

  // const { data: nativeBalance } = useBalance({ address, query: { enabled: !!address } });
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
  address,
  query: { enabled: !!address },
  watch: true, // auto-refetch on new blocks
 });

  const erc20BalanceContracts = useMemo(() => {
    if (!address) return [];
    return TOKEN_LIST.map(t => ({
      abi: ERC20_ABI, address: t.address, functionName: "balanceOf", args: [address]
    }));
  }, [address]);

  // const { data: erc20BalancesData } = useReadContracts({
  const { data: erc20BalancesData, refetch: refetchErc20Balances } = useReadContracts({
    contracts: erc20BalanceContracts,
    query: { enabled: !!address && erc20BalanceContracts.length > 0 },
  });

  const balancesByKey = useMemo(() => {
    const out = {};
    out.ETH = nativeBalance ? Number(nativeBalance.formatted) : 0;
    TOKEN_LIST.forEach((t, i) => {
      const res = erc20BalancesData?.[i]?.result;
      out[t.key] = res ? Number(formatUnits(res, t.decimals)) : 0;
    });
    return out;
  }, [nativeBalance, erc20BalancesData]);

  const usdValue = (key, amountStr) => {
    const meta = META_BY_KEY[key]; if (!meta) return "$0.00";
    // const px = priceMap[(meta.priceKey || key).toLowerCase()] ?? priceMap[key.toLowerCase()] ?? 0;
    const amt = Number(amountStr || 0);
    // return fmtUSD(amt * px);
    return 0;
  };

  useEffect(() => {
    onPairChange?.({ fromKey, toKey });
  }, [fromKey, toKey, onPairChange]);

  // ------- route + quoting + gas -------
  const [routeAddrs, setRouteAddrs] = useState([]);
  const [minReceived, setMinReceived] = useState("0");
  const [gasEth, setGasEth] = useState(0);
  const [gasUsd, setGasUsd] = useState(0);
  const quoteTimer = useRef();

  const routeSymbols = useMemo(() => {
    if (!routeAddrs?.length) return `${displayName(fromKey)} → ${displayName(toKey)}`;
    const mapAddrToKey = (addr) => {
      if (!addr) return "???";
      if (addr.toLowerCase() === zeroAddress) return "ETH";
      const found = TOKEN_LIST.find(t => t.address?.toLowerCase() === addr.toLowerCase());
      return found ? displayName(found.key) : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    };
    return routeAddrs.map(mapAddrToKey).join(" → ");
  }, [routeAddrs, fromKey, toKey]);

  const doQuoteAndGas = async () => {
    if (mode !== "spot") return;
    const f = META_BY_KEY[fromKey], t = META_BY_KEY[toKey];
    const inNum = Number(inAmount || 0);
    if (!f || !t || !inNum || inNum <= 0) {
      setOutAmount(""); setMinReceived("0"); setGasEth(0); setGasUsd(0); return;
    }
    try {
      setIsQuoting(true);
      const amountIn = parseUnits(String(inAmount), f.decimals);

      // route path (adjust to your router selector if different)
      try {
        const route = await publicClient.readContract({
          abi: Router_ABI,
          address: ROUTER_CONTRACT_ADDRESS,
          functionName: "getDirectionalPath",
          args: [f.address, t.address],
        });
        setRouteAddrs(Array.isArray(route) ? route : []);
      } catch {
        setRouteAddrs([]);
      }

      // quote exact-in
      const quoted = await publicClient.readContract({
        abi: PriceQuoter_ABI,
        address: PRICE_QUOTER_ADDRESS,
        functionName: "quoteSwapAmount",
        args: [f.address, t.address, amountIn, true],
      });
      const out = Number(formatUnits(quoted ?? 0n, t.decimals));
      setOutAmount(String(out));

      // min received
      const slipFrac = Math.max(0, Number(slip)) / 100;
      setMinReceived((out - (out * slipFrac)).toFixed(Math.max(6, Math.min(8, t.decimals))));

      // gas (only if we know account)
      if (address) {
        try {
          const gas = await publicClient.estimateContractGas({
            abi: Router_ABI,
            address: ROUTER_CONTRACT_ADDRESS,
            functionName: "executeSwap",
            args: [f.address, t.address, amountIn, Math.floor((Number(slip) || 0) * 100), true],
            account: address,
            ...(fromKey === "ETH" ? { value: amountIn } : {}),
          });
          const gp = await publicClient.getGasPrice();
          const feeWei = gas * gp;
          const feeEth = Number(formatUnits(feeWei, 18));
          setGasEth(feeEth);
          const ethPx = priceMap["weth"] ?? 0;
          setGasUsd(feeEth * ethPx);
        } catch {
          setGasEth(0); setGasUsd(0);
        }
      } else {
        setGasEth(0); setGasUsd(0);
      }
    } catch {
      setOutAmount(""); setMinReceived("0"); setGasEth(0); setGasUsd(0);
    } finally {
      setIsQuoting(false);
    }
  };

  useEffect(() => {
    clearTimeout(quoteTimer.current);
    if (fromKey && toKey && fromKey !== toKey && mode === "spot") {
      quoteTimer.current = setTimeout(doQuoteAndGas, 180);
    } else {
      setOutAmount(""); setMinReceived("0"); setGasEth(0); setGasUsd(0);
    }
    return () => clearTimeout(quoteTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, toKey, inAmount, slip, mode, address]);

  // ------- notify parent (chart) about pair changes -------
  // useEffect(() => {
  //   onPairChange({ fromKey, toKey });
  // }, [fromKey, toKey, onPairChange]);

  // ------- interactions -------
  const ensureConnected = async () => {
    if (isConnected) return true;
    try {
      const connector = connectors?.[0];
      if (!connector) { toast.error("No wallet connector available"); return false; }
      await connectAsync({ connector });
      toast.info("Please Connect Wallet First");
      return true;
    } catch(e) {
      toast.info("Please Connect Wallet First");
      return false;
    }
  };

  const handleFromAmountChange = (val) => {
    const bal = balancesByKey[fromKey] ?? 0;
    const num = Number(val);
    if (!Number.isFinite(num) || num < 0) { setInAmount(""); return; }
    setInAmount(num > bal ? String(bal) : val);
  };
//   const handleFromAmountChange = (val) => {
//   if (!/^\d*\.?\d*$/.test(val)) return; // allow only numbers & decimal
//   setInAmount(val);
// };

  const handleMax = async () => {
    if (!isConnected) { await ensureConnected(); return; }
    try {
      setMaxBusy(true);
      const bal = balancesByKey[fromKey] ?? 0;
      if (fromKey !== "ETH") { setInAmount(String(bal)); return; }
      const gasPrice = await publicClient.getGasPrice();
      const gasLimit = 300000n; // buffer
      const feeWei = gasPrice * gasLimit;
      const balWei = parseUnits(String(bal), 18);
      const availWei = balWei > feeWei ? balWei - feeWei : 0n;
      setInAmount(String(Number(formatUnits(availWei, 18))));
    } catch {
      setInAmount(String(Math.max((balancesByKey[fromKey] ?? 0) - 0.003, 0)));
    } finally {
      setMaxBusy(false);
    }
  };

  const needsApproval = async (tokenKey, owner, spender, amount) => {
    if (tokenKey === "ETH") return false;
    const meta = META_BY_KEY[tokenKey];
    if (!meta?.address) return false;
    try {
      const allowance = await publicClient.readContract({
        abi: ERC20_ABI, address: meta.address, functionName: "allowance", args: [owner, spender],
      });
      return allowance < amount;
    } catch { return true; }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const approveToken = async (tokenKey, amount) => {
    const meta = META_BY_KEY[tokenKey];
    const txHash = await writeContractAsync({
      abi: ERC20_ABI, address: meta.address, functionName: "approve",
      args: [ROUTER_CONTRACT_ADDRESS, amount],
    });
    // ⏳ wait 5 seconds before checking
    await sleep(3500);
    const r = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return r?.status === "success";
  };

  const executeSwap = async () => {
    if (mode !== "spot") { toast.info("Limit orders are coming soon."); return; }
    if (!fromKey || !toKey || fromKey === toKey) { toast.error("Select two different tokens"); return; }
    const f = META_BY_KEY[fromKey], t = META_BY_KEY[toKey];
    const inNum = Number(inAmount || 0);
    if (!f || !t || !inNum || inNum <= 0) { toast.error("Enter a valid amount"); return; }
    const bal = balancesByKey[fromKey] ?? 0;
    if (inNum > bal) { toast.error("Amount exceeds balance"); return; }
    const ok = await ensureConnected(); if (!ok) return;

    try {
      setIsSwapping(true);
      const amountIn = parseUnits(String(inAmount), f.decimals);
      const slipBps = Math.floor((Number(slip) || 0) * 100);

      if (fromKey !== "ETH" && (await needsApproval(fromKey, address, ROUTER_CONTRACT_ADDRESS, amountIn))) {
        toast.info("Approving token…");
        const okApprove = await approveToken(fromKey, amountIn);
        if (!okApprove) throw new Error("Approval failed");
      }

      const txHash = await writeContractAsync({
        abi: Router_ABI,
        address: ROUTER_CONTRACT_ADDRESS,
        functionName: "executeSwap",
        args: [f.address, t.address, amountIn, slipBps, true],
        ...(fromKey === "ETH" ? { value: amountIn } : {}),
      });

      toast.info("Transaction submitted, waiting for confirmation…");

      // ⏳ wait 5 seconds before checking
      await sleep(5000);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const humanAmount = Number(formatUnits(amountIn, f.decimals));

      if (receipt?.status === "success") {
        toast.success("Swap confirmed on-chain!");

        // notify parent to refresh recent trades immediately
          try { await onSwapComplete(); } catch (_) {}

        // log SUCCESS to recent-activity API
        
         // refresh balances after confirmation
        try {
          await Promise.allSettled([
            refetchNativeBalance?.(),
            refetchErc20Balances?.(),
          ]);
      } catch (_) {}
      //    try {
      //      await putRecentActivity({
      //        walletAddress: address,
      //        message: `Executed : ${fromKey} → ${toKey} swap`,
      //        status: "success",         // "success" | "failed"
      //        amount: humanAmount,       // Number (schema expects Number)
      //        type: "trade",             // "trade" for swaps
      //      }).unwrap();
      //    } catch (e) {
      //  }
        setInAmount("");
        setOutAmount("");
        setMinReceived("0");
      } else {
        toast.error("Swap reverted");
        // log FAILED (reverted) to recent-activity API
        try {
        // await putRecentActivity({
        //   walletAddress: address,
        //   message: `Swap reverted: ${fromKey} → ${toKey}`,
        //   status: "failed",
        //   amount: humanAmount,
        //   type: "trade",
        // }).unwrap();
      } catch (e) {
      }
      }
    } catch(e) {
      // best-effort log FAILED to API even if we errored before receipt
      try {
        const fallbackAmount =
          (f?.decimals != null && !isNaN(Number(inAmount)))
            ? Number(inAmount)
            : 0;
        // await putRecentActivity({
        //   walletAddress: address,
        //   message: `Swap failed: ${fromKey} → ${toKey}`,
        //   status: "failed",
        //   amount: fallbackAmount,
        //   type: "trade",
        // }).unwrap();
      } catch (_) {}
      toast.error("Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  // ------- button -------
  const btn = useMemo(() => {
    if (mode === "limit")
      return { onClick: () => {}, disabled: true, text: "Limit orders coming soon", icon: Target,
        className: "bg-gray-600/20 text-gray-400 border border-gray-500/20 cursor-not-allowed" };
    if (!isConnected)
      return { onClick: ensureConnected, disabled: false, text: "Connect Wallet", icon: Sparkles,
        className: "bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30" };
    if (isSwapping)
      return { onClick: () => {}, disabled: true, text: "Processing Swap...", icon: RefreshCw,
        className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" };
    if (!inAmount || Number(inAmount) <= 0)
      return { onClick: () => {}, disabled: true, text: "Enter amount", icon: AlertTriangle,
        className: "bg-gray-600/20 text-gray-500 border border-gray-500/20" };
    if ((balancesByKey[fromKey] ?? 0) < Number(inAmount))
      return { onClick: () => {}, disabled: true, text: "Insufficient balance", icon: AlertTriangle,
        className: "bg-gray-600/20 text-gray-500 border border-gray-500/20" };
    return { onClick: executeSwap, disabled: false, text: "Swap Now", icon: ArrowRight,
      className: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-blue-500/30" };
  }, [mode, isConnected, isSwapping, inAmount, fromKey, balancesByKey]);

  // ------- UI -------
  const disabledPanel = mode === "limit";
  const fromUSD = usdValue(fromKey, inAmount || 0);
  const toUSD = usdValue(toKey, outAmount || 0);

  return (
    <div className="w-full max-w-full">
      <motion.div className="space-y-6" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
        <motion.div className="glass-pro rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>

          {/* MODE SWITCH */}
          <div className="relative rounded-2xl p-1 mb-6 bg-black/30 border border-white/20 overflow-hidden">
            <motion.div
              className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 border border-emerald-600"
              style={{ width: "50%" }}
              animate={{ left: mode === "spot" ? "0%" : "50%" }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            />
            <div className="grid grid-cols-2 relative z-10">
              <button
                onClick={() => setMode("spot")}
                className={`py-3 rounded-xl font-medium ${mode === "spot" ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" /><span>Spot Trade</span>
                </div>
              </button>
              <button
                onClick={() => setMode("limit")}
                className={`py-3 rounded-xl font-medium ${mode === "limit" ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-5 w-5" /><span>Limit Order</span>
                </div>
              </button>
            </div>
          </div>

          {/* TRADE CONTENT (blurred in limit mode) */}
          <div className={disabledPanel ? "pointer-events-none opacity-60 blur-[1px]" : ""}>
            {/* FROM */}
            <div className="relative group">
              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald/10 group-hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" /> From
                  </label>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                    Balance: {(balancesByKey[fromKey] ?? 0).toFixed(6)} {displayName(fromKey)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-full sm:w-30 min-w-[9.5rem]">
                    <select
                      value={fromKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === toKey) setToKey(fromKey);
                        setFromKey(val);
                        setOutAmount("");
                        setInAmount("");
                      }}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-3 text-white font-medium backdrop-blur-sm pr-8"
                    >
                      {SELECTABLE.map((k) => (
                        <option key={k} value={k}>{displayName(k)}</option>
                      ))}
                    </select>
                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br ${gradientFor(fromKey)} pointer-events-none`} />
                  </div>

                  <input
                    type="number"
                    inputMode="decimal"
                    value={inAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 w-full bg-transparent text-left sm:text-right text-2xl font-bold text-white placeholder-gray-500 outline-none"
                  />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-400">{fromUSD}</span>
                  <button
                    onClick={handleMax}
                    disabled={maxBusy}
                    className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 hover:border-blue-500/40"
                  >
                    {fromKey === "ETH" ? "MAX (minus gas)" : "MAX"}
                  </button>
                </div>
              </div>
            </div>

            {/* SWITCH */}
            <div className="flex justify-center py-2">
              <motion.button
                onClick={() => { const a = fromKey; const b = toKey; setFromKey(b); setToKey(a); setOutAmount(""); }}
                className="relative p-4 glass-pro rounded-full hover:bg-white/10 transition-all group"
                whileHover={{ scale: 1.15, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowUpDown className="h-6 w-6 text-gray-400 group-hover:text-white" />
              </motion.button>
            </div>

            {/* TO (read-only exact-in) */}
            <div className="relative group">
              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald/10 group-hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" /> To
                  </label>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                    Balance: {(balancesByKey[toKey] ?? 0).toFixed(6)} {displayName(toKey)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-full sm:w-30 min-w-[9.5rem]">
                    <select
                      value={toKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === fromKey) setFromKey(toKey);
                        setToKey(val); 
                        setOutAmount("");
                        setInAmount("");
                      }}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-3 text-white font-medium backdrop-blur-sm pr-8"
                    >
                      {SELECTABLE.map((k) => (
                        <option key={k} value={k}>{displayName(k)}</option>
                      ))}
                    </select>
                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br ${gradientFor(toKey)} pointer-events-none`} />
                  </div>

                  <input
                    type="number"
                    value={outAmount}
                    readOnly
                    placeholder={mode === "spot" ? (isQuoting ? "Quoting…" : "0.00") : "Coming soon"}
                    className="flex-1 w-full bg-transparent text-left sm:text-right text-2xl font-bold text-white placeholder-gray-500 outline-none opacity-90"
                  />
                </div>

                <div className="text-left sm:text-right mt-4">
                  <span className="text-sm text-gray-400">{toUSD}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ADVANCED */}
          <div className="space-y-3 mt-4">
            <button
              onClick={() => setAdvanced(!advanced)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              disabled={mode === "limit"}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Advanced Settings</span>
            </button>

            <AnimatePresence>
              {advanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`glass-pro rounded-2xl p-6 backdrop-blur-xl space-y-4 ${mode === "limit" ? "pointer-events-none opacity-60 blur-[1px]" : ""}`}
                >
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-purple-400" />
                      Slippage Tolerance
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SLIPPAGE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSlip(opt)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            slip === opt
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                          disabled={mode === "limit"}
                        >
                          {opt}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between">
                      <span>Minimum received:</span>
                      <span className="text-emerald-400 font-medium">
                        {mode === "limit" ? "—" : `${minReceived} ${displayName(toKey)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network fee:</span>
                      <span className="text-blue-400 font-medium">
                        {mode === "limit" ? "—" : `${gasEth.toFixed(6)} ETH (${fmtUSD(gasUsd)})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="text-purple-400 font-medium">
                        {mode === "limit" ? "Coming soon" : routeSymbols}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LIMIT OVERLAY — does NOT block clicks anymore */}
          <AnimatePresence>
            {mode === "limit" && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-black/70 px-6 py-5 text-white text-center pointer-events-none">
                  <div className="flex items-center justify-center gap-3">
                    <Target className="h-7 w-7 text-emerald-400" />
                    <div className="text-xl font-semibold">
                      Limit orders are <span className="text-emerald-400">coming soon</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Charts & recent trades are disabled in this mode
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTION BUTTON */}
          <motion.button
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={`w-full mt-6 py-5 rounded-2xl font-bold text-lg transition-all relative overflow-hidden ${btn.className}`}
            whileHover={!btn.disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!btn.disabled ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              <btn.icon className="h-6 w-6" />
              <span>{btn.text}</span>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default TradingInterface;
