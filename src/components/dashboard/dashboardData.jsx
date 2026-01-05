export const DASHBOARD_STATS = [
  { label: 'Portfolio Value', value: '$24,892.45', change: '+12.3%', positive: true, icon: 'Wallet' },
  { label: 'Active Hedge', value: '5', change: '+2', positive: true, icon: 'Shield' },
  { label: 'Total Earnings', value: '$3,247.89', change: '+8.7%', positive: true, icon: 'DollarSign' },
  { label: "Today's Rebalance ROI", value: '94.2%', change: '+1.5%', positive: true, icon: 'Target' }
];

export const RECENT_ACTIVITIES = [
  { type: 'hedge', description: 'Created BTC hedge position', amount: '$5,000', time: '2 hours ago', status: 'success' },
  { type: 'reward', description: 'Claimed staking rewards', amount: '$247.89', time: '1 day ago', status: 'success' },
  { type: 'trade', description: 'Executed ETH swap', amount: '$1,200', time: '2 days ago', status: 'success' },
  { type: 'vote', description: 'Voted on DAO proposal #42', amount: null, time: '3 days ago', status: 'success' }
];

export const QUICK_ACTIONS = [
  { 
    label: 'Create Hedge', 
    icon: 'Shield', 
    color: 'emerald', 
    description: 'Protect your assets',
    section: 'hedge',
     href: '/hedge',
  },
  { 
    label: 'DEX Trade', 
    icon: 'Zap', 
    color: 'blue', 
    description: 'Swap tokens instantly',
    section: 'dex',
    href: '/dexTrade' ,
  },
  { 
    label: 'DAO Vote', 
    icon: 'Users', 
    color: 'purple', 
    description: 'Participate in governance',
    section: 'dao',
     href: '/daoVote' ,
  },
  { 
    label: 'Affiliation', 
    icon: 'Award', 
    color: 'orange', 
    description: 'Earn referral rewards',
    section: 'affiliation',
     href: '/affiliation' ,
  }
];

export const PORTFOLIO_DATA = [
  { name: 'BTC', value: 45, color: 'amber' },
  { name: 'ETH', value: 30, color: 'blue' },
  { name: 'HGXD', value: 15, color: 'emerald' },
  { name: 'Others', value: 10, color: 'purple' }
];

export const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'Home', color: 'emerald', href: '/overview' },
  { id: 'hedge', label: 'Create Hedge', icon: 'Shield', color: 'blue', href: '/hedge' },
  { id: 'dex', label: 'DEX Trade', icon: 'Zap', color: 'purple', href: '/dexTrade' },
  { id: 'affiliation', label: 'Affiliation', icon: 'Award', color: 'orange', href: '/affiliation' },
  { id: 'dao', label: 'DAO Vote', icon: 'Users', color: 'teal', href: '/daoVote' },
];
export const PROFILE_MENU_ITEMS = [
  { id: 'account', label: 'Account Settings', icon: 'User' },
  { id: 'security', label: 'Security', icon: 'Lock' },
  { id: 'password', label: 'Change Password', icon: 'Key' },
  { id: 'preferences', label: 'Preferences', icon: 'Palette' },
  { id: 'help', label: 'Help & Support', icon: 'HelpCircle' },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success',
    title: 'Hedge Position Created',
    message: 'Your BTC hedge position of $5,000 has been successfully created.',
    time: '5 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'info',
    title: 'DAO Proposal #42',
    message: 'New proposal for protocol upgrade is now available for voting.',
    time: '2 hours ago',
    read: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Market Volatility Alert',
    message: 'High volatility detected in ETH. Consider adjusting your positions.',
    time: '4 hours ago',
    read: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Rewards Claimed',
    message: 'Successfully claimed $247.89 in staking rewards.',
    time: '1 day ago',
    read: true
  },
  {
    id: '5',
    type: 'error',
    title: 'Transaction Failed',
    message: 'Your swap transaction failed due to insufficient gas. Please try again.',
    time: '2 days ago',
    read: true
  }
];

// Wallet types
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    installed: false,
    downloadLink: 'https://metamask.io/download.html',
    shareLink: 'https://metamask.io/',
  },
  {
    id: 'walletConnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with mobile wallets',
    installed: true,
    downloadLink: 'https://walletconnect.com/downloads',
    shareLink: 'https://walletconnect.com/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🟦',
    description: 'Coinbase official wallet',
    installed: false,
    downloadLink: 'https://www.coinbase.com/wallet/downloads',
    shareLink: 'https://www.coinbase.com/wallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Secure multi-chain wallet',
    installed: false,
    downloadLink: 'https://trustwallet.com/download',
    shareLink: 'https://trustwallet.com/',
  },
  // {
  //   id: 'rainbow',
  //   name: 'Rainbow',
  //   icon: '🌈',
  //   description: 'Colorful Ethereum wallet',
  //   installed: false
  // },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Solana wallet support',
    installed: false,
    downloadLink: 'https://phantom.app/download',
    shareLink: 'https://phantom.app/',
  }
];

// Previously TypeScript types now as plain JS constants or comments:

// Allowed dashboard sections
export const DashboardSection = [
  'overview',
  'hedge',
  'dex',
  'dao',
  'profile',
  'affiliation'
];

// Allowed notification types
export const NOTIFICATION_TYPES = [
  'success',
  'warning',
  'info',
  'error'
];

/*
 Example shape of Notification object:
 {
   id: string,
   type: one of NOTIFICATION_TYPES,
   title: string,
   message: string,
   time: string,
   read: boolean
 }

 Example shape of WalletInfo object:
 {
   id: string,
   name: string,
   icon: string,
   description: string,
   installed: boolean
 }
*/