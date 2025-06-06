import { useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { LogOut, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isSending } from '../../utils/useutils';
import { db } from '../../dexieDB';
import { makeRequest } from '../../hook/useApi';
import { initializeApi } from '../../api';

// Logout Modal Component
function LogoutModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 w-[100vw] h-[100vh] top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h3 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-white"
              >
                Confirm Logout
              </motion.h3>
              <motion.button
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 mb-8 leading-relaxed"
            >
              Are you sure you want to logout? This will disconnect your wallet and clear your session.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/25 font-medium"
              >
                Logout
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WalletButton({from}:any) {
  const { connected, publicKey, disconnect } = useWallet();
  // console.log(connected, publicKey?.toBase58())
  const { setVisible } = useWalletModal();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = () => {
    if (connected) {
      setShowLogoutModal(true);
    } else {
      setVisible(true);
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      // Disconnect wallet
      localStorage.removeItem('ws_refresh_token');
      localStorage.removeItem('pubkey');
      if (publicKey) {
        await db.cached_data.delete(`gamer_${publicKey.toBase58()}`);
      }
      await disconnect();
      setShowLogoutModal(false);
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error);
      setShowLogoutModal(false);
      navigate('/');
    }
  };

  const Initialize = async (pubkey: any) => {
    isSending(true, "Initializing...");
    const { res, error } = await makeRequest("POST", initializeApi, { pubkey }, () => { isSending(false, "") }, null, null, "urlencoded");
    if (res) {
      localStorage.setItem('ws_refresh_token', res.data?.jwt);
      localStorage.setItem('pubkey', pubkey);
      await db.cached_data.put(res.data.gamer, `gamer_${pubkey}`);
      isSending(false, "");
      window.location.href = '/wordstake'
    }
   
    if(error){
       await disconnect();
    }

  }

  useEffect(() => {
    if (connected && publicKey) {
      if (!localStorage.getItem('ws_refresh_token')) {
        Initialize(publicKey.toBase58())
      }
    }
  }, [connected]);

  return (
    <>
      <button
        id='connect_wallecr'
        onClick={handleClick}
        className="hidden lg:flex gap-2  px-4 xl:px-6 py-2 xl:py-3 rounded-full transition-all transform hover:scale-105 text-sm xl:text-base items-center"
      >
        {connected ? (
         <>
           {
            from !=='setup' ? <>

            Logout
            <LogOut className="w-4 h-4" />
             <>
          </>
            </> : <>
            
            <X className="w-4 h-4" />
             
            </>
          }
         </>
        ) : (
          <>
            Play WordStake
            <Sparkles className="w-4 h-4" />
          </>
        )}
      </button>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

function ConnectWallet({from}:any) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({ network }),
      new PhantomWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>
          <WalletButton from={from} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default ConnectWallet;