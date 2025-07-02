// contexts/WalletContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// Gorbagana Custom RPC Configuration
const GORBAGANA_RPC_URL = 'https://rpc.gorbagana.wtf';
const GORBAGANA_NETWORK_NAME = 'Gorbagana Testnet';

// Create the context
const WalletAppContext = createContext<any | undefined>(undefined);

// Custom hook to use wallet context
export const useWalletApp = () => {
  const context = useContext(WalletAppContext);
  if (!context) {
    throw new Error('useWalletApp must be used within a WalletAppProvider');
  }
  return context;
};

// Inner component that has access to wallet hooks
function WalletAppContextProvider({ children }:any) {
  const { connected, publicKey, disconnect, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<any>(0);
  const [loading, setLoading] = useState(false);
  const [gorConnection, setGorConnection] = useState<any>(null);

  // Initialize Gorbagana connection
  useEffect(() => {
    const gorConn:any = new Connection(GORBAGANA_RPC_URL, 'confirmed');
    setGorConnection(gorConn);
  }, []);

  // Fetch balance function
  const fetchBalance = async () => {
    if (!publicKey || !gorConnection) return;
    
    setLoading(true);
    try {
      const balanceInLamports = await gorConnection.getBalance(publicKey);
      const balanceInGor = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInGor);
    } catch (error) {
      console.error('Error fetching GOR balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey && gorConnection) {
      fetchBalance();
      // Set up interval to refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 60000);
      return () => clearInterval(interval);
    } else {
      setBalance(0);
    }
  }, [connected, publicKey, gorConnection]);

  // Disconnect function with cleanup
  const disconnectWallet = async () => {
    try {
      localStorage.removeItem('ws_refresh_token');
      localStorage.removeItem('pubkey');
      setBalance(0);
      await disconnect();
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Fallback: force reload anyway
      window.location.href = '/';
    }
  };

  const contextValue = {
    // Wallet state
    connected,
    publicKey,
    balance,
    loading,
    
    // Connections
    connection,
    gorConnection,
    
    // Functions
    fetchBalance,
    disconnectWallet,
    sendTransaction,
    
    // Network info
    networkName: GORBAGANA_NETWORK_NAME,
    rpcUrl: GORBAGANA_RPC_URL,
  };

  return (
    <WalletAppContext.Provider value={contextValue}>
      {children}
    </WalletAppContext.Provider>
  );
}

// Main provider component
export function WalletAppProvider({ children }:any) {
  const endpoint = GORBAGANA_RPC_URL;
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>
          <WalletAppContextProvider>
            {children}
          </WalletAppContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}