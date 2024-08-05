import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { firestore } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import './Wallet.css';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const walletData = userData.wallet || { balance: 0, transactions: [] };
          setBalance(walletData.balance);
          setTransactions(walletData.transactions);
        }
      }
    };

    fetchWalletData();
  }, [user]);

  const handleTransaction = async (e) => {
    e.preventDefault();

    if (!user) return;

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const walletData = userData.wallet || { balance: 0, transactions: [] };
      const newBalance =
        action === 'deposit'
          ? walletData.balance + parseFloat(amount)
          : walletData.balance - parseFloat(amount);

      await updateDoc(userRef, {
        wallet: {
          balance: newBalance,
          transactions: arrayUnion({
            amount: parseFloat(amount),
            type: action,
            date: new Date(),
            details: action === 'deposit' ? 'User Deposit' : 'User Withdrawal'
          })
        }
      });

      setBalance(newBalance);
      setAmount('');
    }
  };

  return (
    <div className="wallet-container">
      <h1>My Wallet</h1>
      <p>Balance: ₹{balance.toFixed(2)}</p>
      <form onSubmit={handleTransaction}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            {transaction.date.toDate().toLocaleString()} - {transaction.type}: ₹
            {transaction.amount.toFixed(2)} - {transaction.details}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wallet;
