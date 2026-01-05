"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Maximize2 } from "lucide-react";
// import { useFetchTokenPricePointsQuery, useGetAllTokenPriceQuery } from "@/services/auth";

// Controlled by parent. No ETH/USDC defaults here.
export default function TradingChart({ fromToken, toToken, tokenNameForChart, tokenName }) {
  const apiToken = tokenNameForChart || tokenName;
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [change, setChange] = useState("");
  const [hoverPrice, setHoverPrice] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null); // 👈 NEW


  // API: tokenName must be one of: WETH | HEDGEX | BITORIO | WBTC

  // const { data } = useFetchTokenPricePointsQuery(
  //   {
  //     tokenName: apiToken,
  //     time: selectedTimeframe,
  //     limit: 11,
  //   },
  //   {
  //     refetchOnMountOrArgChange: true,  // ✅ ensures new fetch on arg change
  //   }
  // );
  // console.log(data);



  // const series = useMemo(() => {
  //   const arr = Array.isArray(data?.data) ? data.data : [];
  //   if (!arr.length) return [];
  //   if (typeof arr[0] === "number") return arr.map(Number);
  //   if (arr[0] && typeof arr[0].price !== "undefined") return arr.map(p => Number(p.price));
  //   return [];
  // }, [data]);

  // const currentPrice = series.length ? Number(series[series.length - 1]) : 0;
  const [currentPrice, setCurrentPrice] = useState("");
  // const priceChangeStr = String(data?.change24h ?? data?.priceChange ?? "0.00%").trim();
  // const isPositive = priceChangeStr.startsWith("+");
  // const isNegative = priceChangeStr.startsWith("-");

  const WIDTH = 520, HEIGHT = 240, PX = 20, PY = 20;

  // const { pathData, points } = useMemo(() => {
  //   if (!series.length) return { pathData: "", points: [] };
  //   const min = Math.min(...series);
  //   const max = Math.max(...series);
  //   const span = max - min || 1;
  //   const stepX = (WIDTH - PX * 2) / Math.max(series.length - 1, 1);
  //   const pts = series.map((v, i) => {
  //     const x = PX + i * stepX;
  //     const y = HEIGHT - PY - ((v - min) / span) * (HEIGHT - PY * 2);
  //     return { x, y };
  //   });
  //   const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  //   return { pathData: d, points: pts };
  // }, [series]);

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "2h"];
  // const stats = data?.staticsData || [
  //   { name: "24h High", value: "$0" },
  //   { name: "24h Low", value: "$0" },
  //   { name: "Supply", value: "$0" },
  //   { name: "Market Cap", value: "$0" },
  // ];

  const displayBase =
    fromToken === 'USDC'
      ? (toToken || 'WETH')     // when input is USDC, show tokenOut/USDC
      : (fromToken || 'WETH');  // otherwise show tokenIn/USDC

  const pairLabel = `${displayBase}/USDC`;

  // ✅ Hook for fetching all token prices (one-time fetch, cached)
  // const { data: allPrices } = useGetAllTokenPriceQuery();
  // console.log(allPrices);

  // Mapping from displayBase → API key
  const tokenMap = {
    BITORIO: "Bitorio",
    WETH: "Ethereum",
    ETH: "Ethereum",
    WBTC: "Bitcoin",
    HEDGEX: "Hedgex",
  };

  // useEffect(() => {
  //   if (!allPrices?.data) return;

  //   // map displayBase (BITORIO, WETH, WBTC, HEDGEX) → API name (Bitorio, Ethereum, Bitcoin, Hedgex)
  //   const apiName = tokenMap[displayBase];
  //   if (!apiName) return;

  //   const found = allPrices.data.find(t => t.name === apiName);
  //   if (found) {
  //     setChange(found.change24h || "0.00%");
  //     setCurrentPrice(found.price);
  //   }
  // }, [displayBase, allPrices]);

  // console.log("Change for", displayBase, "=", change);

  return (
    <motion.div
      className="glass-pro rounded-2xl p-6 backdrop-blur-xl h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
          >
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {pairLabel}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <motion.span
                className="text-2xl font-bold text-white"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentPrice ? `${currentPrice.toLocaleString()}` : "$0.00"}
              </motion.span>
              <motion.span
                className={`flex items-center gap-1 text-sm font-medium ${change?.trim().startsWith("-")
                  ? "text-red-400"
                  : change?.trim().startsWith("+")
                    ? "text-emerald-400"
                    : "text-gray-400"
                  }`}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {change?.trim().startsWith("-") ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {change || "0.00%"}
              </motion.span>

            </div>
          </div>
        </div>

        {/* <button className="p-2 glass rounded-xl hover:bg-white/10 transition-all">
          <Maximize2 className="h-4 w-4 text-gray-400" />
        </button>  */}
      </div>

      {/* Timeframes */}
      <div className="flex gap-2 mb-6">
        {timeframes.map((tf, i) => (
          <motion.button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTimeframe === tf
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {tf}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-80 bg-black/30 rounded-xl border border-white/10 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 30px",
          }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, 
              rgba(16, 185, 129, 0.05) 0%, 
              rgba(59, 130, 246, 0.03) 50%, 
              rgba(147, 51, 234, 0.05) 100%)`
          }}
          animate={{
            background: [
              "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 50%, rgba(147, 51, 234, 0.05) 100%)",
              "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.03) 50%, rgba(16, 185, 129, 0.05) 100%)",
              "linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(59, 130, 246, 0.05) 100%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 p-4 h-full">
          <svg className="w-full h-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.4)" />
              </linearGradient>
              <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
              </linearGradient>
            </defs>

            {/* {pathData && (
              <motion.path
                d={`${pathData} L ${WIDTH - PX} ${HEIGHT} L ${PX} ${HEIGHT} Z`}
                fill="url(#chartFill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            )} */}

            {/* {pathData && (
              <motion.path
                d={pathData}
                stroke="url(#chartGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 points}}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 1.2, ease: "easeInOut" }}
              />
            )} */}

            {/* {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="rgba(16, 185, 129, 0.8)"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.25, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.5, r: 6 }}
                onMouseEnter={() => {
                  setHoverPrice(series[i]);
                  setHoverPoint(points[i]); // 👈 store coordinates
                }}
                onMouseLeave={() => {
                  setHoverPrice(null);
                  setHoverPoint(null);
                }}
              />
            ))} */}
          </svg>

          {/* current price */}
          {hoverPoint ? (
  <motion.div
    className="absolute"
    style={{
      left: `${Math.min(WIDTH - 100, hoverPoint.x + 20)}px`,
      top: `${hoverPoint.y}px`,
      transform: "translateY(-50%)",
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-3 py-2 shadow-lg">
      <div className="text-xs text-emerald-400 font-semibold">
        ${hoverPrice?.toLocaleString() ?? "0.00"}
      </div>
    </div>
  </motion.div>
) : (
  // fallback current price at right
  <motion.div
    className="absolute right-4 top-1/2 -translate-y-1/2"
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5, duration: 0.4 }}
  >
    <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-lg px-3 py-2">
      <div className="text-xs text-emerald-400 font-medium">
        {currentPrice ? currentPrice.toLocaleString() : "0.00"}
      </div>
    </div>
  </motion.div>
)}

        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
      >
        {/* {stats.map((s, i) => (
          <motion.div
            key={`${s.name}-${i}`}
            className="text-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.05 + i * 0.08, duration: 0.3 }}
          >
            <div className="text-sm font-bold text-emerald-400">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.name}</div>
          </motion.div>
        ))} */}
      </motion.div>
    </motion.div>
  );
}
