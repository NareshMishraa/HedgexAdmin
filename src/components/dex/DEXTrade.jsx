
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import RecentTrades from "./RecentTrades.jsx";
import TradingChart from "./TradingChart.jsx";
import TradingInterface from "./TradingInterface.jsx"

// Decide which token name the chart API should use
// Prefer token-in (unless it's USDC), and map to one of: WETH, HEDGEX, BITORIO, WBTC
const chartNameFor = (from, to) => {
  const MAP = { ETH: "WETH", WETH: "WETH", HEDGEX: "HEDGEX", BITORIO: "BITORIO", WBTC: "WBTC" };
  if (from === "USDC") return MAP[to] || "WETH";
  return MAP[from] || "WETH";
};

export default function DEXTrade() {
  // Default pair: WBTC -> HEDGEX
  const [pair, setPair] = useState({
    fromKey: "WBTC",
    toKey: "HEDGEX",
    chartTokenName: "WBTC",
  });

  const [recentTick, setRecentTick] = useState(0);

  const handlePairChange = useCallback(({ fromKey, toKey }) => {
    const next = {
      fromKey,
      toKey,
      chartTokenName: chartNameFor(fromKey, toKey),
    };

    // IMPORTANT: only update when *actually* changed to avoid loops
    setPair((prev) => {
      if (
        prev.fromKey === next.fromKey &&
        prev.toKey === next.toKey &&
        prev.chartTokenName === next.chartTokenName
      ) {
        return prev; // no state change => no rerender
      }
      return next;
    });
  }, []);

  // Called by TradingInterface whenever the user changes tokens
  //const handlePairChange = ({ fromKey, toKey }) => setPair({ fromKey, toKey });

  return (
    <div className="space-y-6">
      {/* Top row: Interface + Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Trading panel */}
        <div className="lg:col-span-1">
          {/* <TradingInterface onPairChange={handlePairChange} /> */}
          <TradingInterface
            onPairChange={handlePairChange}
            onSwapComplete={() => setRecentTick((t) => t + 1)}
        />
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-1">
          <TradingChart
            fromToken={pair.fromKey}
            toToken={pair.toKey}
            tokenNameForChart={pair.chartTokenName}
          />
        </div>

        {/* Bottom: Recent Trades — full width */}
        <motion.div
          className="lg:col-span-2"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* <RecentTrades fromToken={pair.fromKey} toToken={pair.toKey} /> */}
         <RecentTrades fromToken={pair.fromKey} toToken={pair.toKey} refreshKey={recentTick} />
        </motion.div>
      </div>
    </div>
  );
}
