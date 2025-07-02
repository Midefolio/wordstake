// components/WalletButton.jsx
import React, { useEffect, useState } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AlertCircle, CheckCircle, LogOut, Sparkles, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletApp } from '../context/wallet_context';

// Logout Confirmation Modal
function LogoutModal({ isOpen, onClose, onConfirm }:any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-8">
              Are you sure you want to logout? This will disconnect your wallet and clear your session.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type WalletButtonVariant = 'default' | 'outline' | 'minimal';

export function WalletButton({ variant = 'default' }: { variant?: WalletButtonVariant }) {
  const { connected, disconnectWallet, publicKey} = useWalletApp();
  const { setVisible } = useWalletModal();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = () => {
    if (connected) {
      setShowLogoutModal(true);
    } else {
      setVisible(true);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    disconnectWallet();
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
         await disconnectWallet();
      }
  
    }
  
    useEffect(() => {
      if (connected && publicKey) {
        if (!localStorage.getItem('ws_refresh_token')) {
          Initialize(publicKey.toBase58())
        }
      }
    }, [connected]);



  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105";
  const variantClasses = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    minimal: "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {connected ? (
          <>
            Disconnect
            <LogOut className="w-4 h-4" />
          </>
        ) : (
          <>
            Connect Wallet
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

// components/BalanceDisplay.jsx


export function BalanceDisplay({ showRefresh = true, className = "" }) {
  const { connected, balance, loading, fetchBalance, publicKey } = useWalletApp();

  if (!connected) return null;

  return (
    <div className={`flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 ${className}`}>
      <img src='/image.png' className="w-4 h-4 text-purple-400" />
      <span className="text-sm font-bold text-gray-300">
        {loading ? 'Loading...' : `${balance.toFixed(4)} GOR`}
      </span>
        <button
          className="text-xs text-gray-300 font-bold hover:text-purple-300 ml-2"
        >
          ...{publicKey.toBase58().slice(-8)}
        </button>
    </div>
  );
}

// components/WalletInfo.jsx
export function WalletInfo() {
  const { connected, publicKey, balance, networkName } = useWalletApp();

  if (!connected) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No wallet connected</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white space-y-2">
      <h3 className="font-bold text-lg">Wallet Information</h3>
      <div className="space-y-1 text-sm">
        <p><span className="text-gray-400">Network:</span> {networkName}</p>
        <p><span className="text-gray-400">Address:</span> {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
        <p><span className="text-gray-400">Balance:</span> {balance.toFixed(4)} GOR</p>
      </div>
    </div>
  );
}

// components/TransferGor.jsx

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Send } from 'lucide-react';
import { makeRequest } from '../hook/useApi';
import { isSending } from '../utils/useutils';
import { initializeApi } from '../api';
import { db } from '../dexieDB';


interface TransferGorProps {
  amount?: string;
  address?: string;
  onTransferSuccess?: (transactionData: {
    signature: string;
    recipient: string;
    amount: number;
    timestamp: string;
  }) => void;
}

interface TransferGorProps {
  amount?: string;
  address?: string;
  onTransferSuccess?: (transactionData: {
    signature: string;
    recipient: string;
    amount: number;
    timestamp: string;
  }) => void;
}

export function TransferGor({initialAmount, address, from, onTransferSuccess }: any) {
  const { connected, publicKey, sendTransaction, gorConnection, fetchBalance } = useWalletApp();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<any>();
  const [sending, setSending] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (address) setRecipient(address);
    if (initialAmount) setAmount(initialAmount);
  }, [address, initialAmount]);

  // Clear messages when inputs change
  useEffect(() => {
    if (error) setError('');
    if (success) setSuccess('');
  }, [recipient, amount]);

  const handleTransfer = async () => {
    if (!publicKey || !recipient || !amount || !gorConnection) return;

    setError('');
    setSuccess('');
    setSending(true);
    
    try {
      // Check wallet balance first
      const balance = await gorConnection.getBalance(publicKey);
      const lamportsToSend = parseFloat(amount) * LAMPORTS_PER_SOL;
      
      // Estimate transaction fee (typical Solana transaction fee is ~5000 lamports)
      const estimatedFee = 5000;
      const totalRequired = lamportsToSend + estimatedFee;
      
      if (balance < totalRequired) {
        const balanceInGOR = balance / LAMPORTS_PER_SOL;
        const requiredInGOR = totalRequired / LAMPORTS_PER_SOL;
        
        setError(`Insufficient balance! Available: ${balanceInGOR.toFixed(6)} GOR, Required: ${requiredInGOR.toFixed(6)} GOR (including fees)`);
        return;
      }

      // Validate recipient address
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch (error) {
        setError('Invalid recipient address format');
        return;
      }
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamportsToSend,
        })
      );

      // Get recent blockhash from Gorbagana network
      const { blockhash } = await gorConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const signature = await sendTransaction(transaction, gorConnection);

      // Refresh balance if function exists
      if (fetchBalance) {
        await fetchBalance();
      }
 
      if (onTransferSuccess) {
        await onTransferSuccess();
        setRecipient('');
        setAmount('');
        setSuccess('');
        return
      }
      
      // Wait for confirmation
      setTimeout(() => {
        setRecipient('');
        setAmount('');
        setSuccess('');
        setShowTransfer(false);
      }, 3000);


    
    } catch (error: any) {
      console.error('Transfer failed:', error);
      
      // Better error handling
      if (error.message?.includes('insufficient funds')) {
        setError('Insufficient funds for this transaction');
      } else if (error.message?.includes('Invalid public key')) {
        setError('Invalid recipient address');
      } else if (error.message?.includes('blockhash not found')) {
        setError('Network error. Please try again');
      } else if (error.message?.includes('User rejected')) {
        setError('Transaction was rejected');
      } else {
        setError(error.message || 'Transaction failed. Please try again');
      }
    } finally {
      setSending(false);
    }
  };

  if (!connected) return null;

  return (
    <>
      

      {from == 'join'? <>
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransfer(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Users className="w-5 h-5" />
            Join Game
          </motion.button>
        </div>
      </> : <><button
        onClick={() => setShowTransfer(true)}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
        Send from Wallet
      </button></>}

      <AnimatePresence>
        {showTransfer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowTransfer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Transfer GOR</h3>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient's wallet address"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    disabled={sending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (GOR)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    disabled={sending}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowTransfer(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={sending || !recipient || !amount || !!success}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? 'Sending...' : success ? 'Sent!' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}