import { useState } from "react";
import Navbar from "../components/Navbar";
import DEXTrade from "../components/dex/DEXTrade";

const HedgingRebalance = ({ activeTab, setActiveTab }) => {
 
  return (
    <div className="min-h-screen flex flex-col text-white bg-black">
      {/* <Navbar activeTab={activeTab} setActiveTab={setActiveTab} /> */}

      <div className="flex-1 p-6 text-slate-400 text-center">
        {activeTab === "pool" ? (
          <DEXTrade />
        ) : (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-2 text-white">
              Rebalance Details
            </h3>
            <p>Coming soon: track rebalance actions and performance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HedgingRebalance;
