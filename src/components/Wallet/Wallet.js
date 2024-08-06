import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction'; // Ensure updateWallet is imported
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../firebase';
import './Wallet.css';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }
  }, [user, dispatch]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!user || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount)) {
        throw new Error('Invalid amount');
      }

      const currentBalance = parseFloat(wallet.balance) || 0;
      const newBalance =
        action === 'deposit'
          ? currentBalance + transactionAmount
          : currentBalance - transactionAmount;

      if (action === 'withdrawal' && newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      // Use updateWallet to update balance
      dispatch(updateWallet(newBalance));

      const walletRef = doc(firestore, 'wallets', user.uid);
      await updateDoc(walletRef, {
        balance: newBalance,
        transactions: arrayUnion({
          amount: transactionAmount,
          type: action,
          date: new Date(),
          details: action === 'deposit' ? 'User Deposit' : 'User Withdrawal'
        })
      });

      setAmount('');
    } catch (error) {
      console.error('Error handling transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return !isNaN(amount) ? parseFloat(amount).toFixed(2) : '0.00';
  };

  return (
    <div className="wallet-container">
      <h1>My Wallet</h1>
      <p>Balance: ₹{formatAmount(wallet.balance)}</p>
      <form onSubmit={handleTransaction}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdraw</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Wallet;
