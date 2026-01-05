// wagmi v2 style
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import {
  injected,
  walletConnect,
  metaMask,
  coinbaseWallet,
} from "wagmi/connectors";
const PROJECT_ID  = import.meta.env.VITE_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  // IMPORTANT: Prevent auto connecting. User must click a button.
  // If you want resume-on-refresh later, flip to true.
  autoConnect: false,
  connectors: [
    // Trust Wallet (and others) if you're inside the Trust in-app browser or using its desktop extension
    injected({ shimDisconnect: true }),

    // Specific brand connectors (optional but nice UX)
    metaMask({
      dappMetadata: { name: "Hedgex Dao", url: "https://hedgex.io" },
      shimDisconnect: true,
    }),
    coinbaseWallet({ appName: "Hedgex Dao", preference: "all" }),

    // Trust Wallet (and many others) via WalletConnect v2 — used for mobile deep links
    walletConnect({
      projectId: PROJECT_ID,
      showQrModal: true, // we deep-link on mobile ourselves
      metadata: {
        name: "Hedgex Dao",
        description: "Hedgex Dao Hedging Platform",
        url: "https://hedgex.io",
        icons: [
          "https://hedgex-dao-public-files.s3.us-east-1.amazonaws.com/Image.jpeg",
        ],
      },
    }),
  ],
});
