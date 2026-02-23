import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
// import { useGetRecentTradesQuery } from '@/services/auth';
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
// import { skipToken } from '@reduxjs/toolkit/query';
import { useGetAdminLimitOrdersQuery } from "../../api/authApi.js";

export default function RecentTrades({ refreshKey,mode }) {
  const { address } = useAccount();
  const [page, setPage] = useState(1);

  const queryEnabled = Boolean(address);

  // const {
  //   data,
  //   error,
  //   isLoading,
  //   refetch,
  // } = useGetRecentTradesQuery(
  //   queryEnabled
  //     ? {
  //       walletAddress: address,
  //       page,
  //       limit: 5,
  //     }
  //     : skipToken,
  //   { refetchOnMountOrArgChange: true }
  // );

  // Reset to page 1 on wallet change
  useEffect(() => {
    setPage(1);
  }, [address]);

  // Auto-refresh every 1 minute (only if wallet is connected)
  // useEffect(() => {
  //   if (!queryEnabled || !refetch) return;

  //   const interval = setInterval(() => {
  //     refetch();
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, [refetch, queryEnabled]);

  // Instant refresh when a trade completes (safe refetch)
  // useEffect(() => {
  //   if (refreshKey !== undefined && queryEnabled && refetch) {
  //     refetch();
  //   }
  // }, [refreshKey, refetch, queryEnabled]);

  // Placeholder UI if wallet not connected
  // if (!queryEnabled) {
  //   return (
  //     <motion.div
  //       className="glass-pro rounded-2xl p-6 backdrop-blur-xl text-center text-gray-400"
  //       initial={{ opacity: 0, y: 20 }}
  //       animate={{ opacity: 1, y: 0 }}
  //       transition={{ delay: 0.3, duration: 0.5 }}
  //     >
  //       Please connect your wallet to view recent trades.
  //     </motion.div>
  //   );
  // }

  // const trades = data?.trades || [];
  // const totalTrades = data?.totalTrades || 0;

  // const totalHgxSell = trades
  //   .filter((t) => t.pair.split("/")[0] === "HGX")
  //   .reduce((sum, t) => sum + parseFloat(t.amount.split(" ")[0] || 0), 0);

  // const totalBtcOrders = trades
  //   .filter((t) => t.pair.split("/")[0] === "BTC")
  //   .reduce((sum, t) => sum + parseFloat(t.amount.split(" ")[0] || 0), 0);

   //get data from api of recent limit order trade
  const { data, isLoading, isError, refetch } = useGetAdminLimitOrdersQuery();
  console.log(data);

  return (
    <motion.div
      className="glass-pro rounded-2xl p-6 backdrop-blur-xl border border-emerald/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
     {mode==="spot" &&
     <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Activity className="h-5 w-5 text-purple-400" />
        </motion.div>
        <h3 className="text-lg font-bold text-white">Recent Trades</h3>
      </div>

      <div className="space-y-4">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-400 px-2">
          <span>Pair</span>
          <span>Created At</span>
          <span>Amount</span>
          <span>Slippage</span>
          <span className="text-right">Tx Hash</span>
        </div>

        {/* Trades */}
        <div className="space-y-2">
          {/* {trades.map((trade, index) => (
            <motion.div
              key={trade.txHash}
              className="grid grid-cols-5 gap-4 text-xs py-3 px-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01, x: 5 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{trade.pair}</span>
              </div>

              <span className="text-gray-300">{trade.time || "-"}</span>
              <span className="text-gray-300 font-medium">{trade.amount}</span>
              <span className="text-gray-300">{trade.slippge ?? "-"}</span>

              <div className="text-right">
                <a
                  href={`https://basescan.org/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  {trade.txHash.slice(0, 6)}...{trade.txHash.slice(-4)}
                </a>
              </div>
            </motion.div>
          ))} */}
        </div>

        {/* Totals */}
        <motion.div
          className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="text-lg font-bold text-emerald-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* {totalHgxSell.toFixed(2)} */}
            </motion.div>
            <div className="text-xs text-gray-400">Total HGXD Orders</div>
          </div>

          <div className="text-center">
            <motion.div
              className="text-lg font-bold text-blue-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {/* {totalTrades} */}
            </motion.div>
            <div className="text-xs text-gray-400">Total Trades</div>
          </div>

          <div className="text-center">
            <motion.div
              className="text-lg font-bold text-yellow-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              {/* {totalBtcOrders.toFixed(2)} */}
            </motion.div>
            <div className="text-xs text-gray-400">BTC Total Orders</div>
          </div>
        </motion.div>

        {/* Pagination */}
        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-xs text-gray-300">Page {page}</span>
            <button
              // disabled={page * 5 >= totalTrades}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
      </div>
    } 
    {mode === "limit" && (
  <div>
    {/* Header */}
    <div className="flex items-center gap-2 mb-6">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <Activity className="h-5 w-5 text-emerald-400" />
      </motion.div>
      <h3 className="text-lg font-bold text-white">Recent Limit Orders</h3>
    </div>

    {/* Loading / Error states */}
    {isLoading && (
      <div className="text-center text-gray-400 py-4">Loading orders...</div>
    )}
    {isError && (
      <div className="text-center text-red-400 py-4">Failed to load orders.</div>
    )}

    {/* Orders Table */}
    {data?.data?.length > 0 ? (
      <div className="space-y-3">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-3 text-xs font-medium text-gray-400 px-2">
          <span>Pair</span>
          <span>Side</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Status</span>
          <span className="text-right">Created</span>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {data.data.map((order, index) => (
            <motion.div
              key={order._id}
              className={`grid grid-cols-6 gap-3 text-xs py-3 px-2 rounded-xl border border-white/5 transition-all cursor-pointer hover:bg-white/5 ${
                order.side === "BUY"
                  ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                  : "bg-red-500/5 hover:bg-red-500/10"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-white font-medium">{order.symbol}</span>
              <span
                className={`font-semibold ${
                  order.side === "BUY" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {order.side}
              </span>
              <span className="text-gray-300">{order.price}</span>
              <span className="text-gray-300">{order.quantity}</span>
              <span
                className={`${
                  order.status === "OPEN"
                    ? "text-yellow-400"
                    : order.status === "FILLED"
                    ? "text-emerald-400"
                    : "text-gray-400"
                } font-medium`}
              >
                {order.status}
              </span>
              <span className="text-right text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    ) : (
      !isLoading && (
        <div className="text-center text-gray-400 py-6">
          No limit orders found.
        </div>
      )
    )}
  </div>
)}

    </motion.div>
  );
}
