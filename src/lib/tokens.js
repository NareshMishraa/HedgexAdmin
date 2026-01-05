import { isAddress } from "viem";



  const TOKEN_ADDRESS=import.meta.env.VITE_PUBLIC_TOKEN_ADDRESS;
  const BITORIO_TOKEN_ADDRESS=import.meta.env.VITE_PUBLIC_BITORIO_TOKEN_ADDRESS;
  const USDC_CONTRACT_ADDRESS=import.meta.env.VITE_PUBLIC_USDC_CONTRACT_ADDRESS;
  const WBTC_CONTRACT_ADDRESS=import.meta.env.VITE_PUBLIC_WBTC_CONTRACT_ADDRESS;
  const ETH_WBTC_ADDRESS=import.meta.env.VITE_PUBLIC_ETH_WBTC_ADDRESS; 


export const HEDGEX_ADDRESS  = TOKEN_ADDRESS;
export const BITORIO_ADDRESS = BITORIO_TOKEN_ADDRESS;
export const USDC_ADDRESS    = USDC_CONTRACT_ADDRESS;
export const WBTC_ADDRESS    = WBTC_CONTRACT_ADDRESS;
export const WETH_ADDRESS    = ETH_WBTC_ADDRESS; // see note below

export const TOKENS = [
 { key: "HEDGEX",  address: HEDGEX_ADDRESS,  decimals: 18, priceKey: "Hedgex"   },
  // { key: "BITORIO", address: BITORIO_ADDRESS, decimals: 18, priceKey: "Bitorio"  },
  { key: "USDC",    address: USDC_ADDRESS,    decimals: 6,  priceKey: "USDC"     },
  { key: "WBTC",    address: WBTC_ADDRESS,    decimals: 8,  priceKey: "Bitcoin"  },
  { key: "WETH",    address: WETH_ADDRESS,    decimals: 18, priceKey: "Ethereum" },
].filter(t => isAddress(t.address));

if (typeof window !== "undefined") {
  console.groupCollapsed("[TOKENS] Loaded from .env");
  console.table(TOKENS.map(t => ({ key: t.key, address: t.address, decimals: t.decimals, priceKey: t.priceKey })));
  console.groupEnd();

  if (!TOKENS.length) {
    console.warn("[TOKENS] is EMPTY. Check .env names (NEXT_PUBLIC_*), restart dev server.");
  }
}