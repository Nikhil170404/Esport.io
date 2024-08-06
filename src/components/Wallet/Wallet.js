import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction';
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

      const currentBalance = parseFloat(wallet?.balance) || 0;
      const newBalance =
        action === 'deposit'
          ? currentBalance + transactionAmount
          : currentBalance - transactionAmount;

      if (action === 'withdrawal' && newBalance < 0) {
        throw new Error('Insufficient funds');
      }

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

      dispatch(updateWallet(newBalance));
      setAmount('');
    } catch (error) {
      console.error('Error handling transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <h1>My Wallet</h1>
      <p>Balance: ₹{(wallet?.balance ?? 0).toFixed(2)}</p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleTransaction}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ₹"
          min="0.01"
          step="0.01"
          required
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        <button type="submit" disabled={loading}>Submit</button>
      </form>
      {loading && <p>Processing transaction...</p>}
      <h2>Transaction History</h2>
      <ul>
        {wallet?.transactions?.length > 0 ? (
          wallet.transactions.map((transaction, index) => (
            <li key={index}>
              {new Date(transaction.date.seconds * 1000).toLocaleString()} - {transaction.type}: ₹
              {transaction.amount.toFixed(2)} - {transaction.details}
            </li>
          ))
        ) : (
          <p>No transactions available</p>
        )}
      </ul>
    </div>
  );
};

export default Wallet;
