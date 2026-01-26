import React, { useState, useEffect } from 'react';
import api from './services/api';
import { calculateHoldingMetrics, convertCurrency } from './utils/calculations';
import Header from './components/Header';
import PortfolioSummary from './components/PortfolioSummary';
import CashBalances from './components/CashBalances';
import AccountFilter from './components/AccountFilter';
import HoldingsTable from './components/HoldingsTable';
import AddAccountModal from './components/AddAccountModal';
import AddHoldingModal from './components/AddHoldingModal';
import AddCashModal from './components/AddCashModal';
import FXRatesModal from './components/FXRatesModal';

const App = () => {
  // Load base currency from localStorage or default to 'USD'
  const [baseCurrency, setBaseCurrency] = useState(() => {
    return localStorage.getItem('baseCurrency') || 'USD';
  });
  const [fxRates, setFxRates] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [cashBalances, setCashBalances] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('all');

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddCash, setShowAddCash] = useState(false);
  const [showFXRates, setShowFXRates] = useState(false);

  // Save base currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('baseCurrency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    loadFXRates();
  }, [baseCurrency]);

  useEffect(() => {
    loadAccounts();
    loadHoldings();
    loadCashBalances();
  }, []);

  const loadFXRates = async () => {
    try {
      const rates = await api.getFXRates(baseCurrency);
      setFxRates(rates);
    } catch (error) {
      console.error('Failed to load FX rates:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadHoldings = async () => {
    try {
      const data = await api.getHoldings();
      setHoldings(data);
    } catch (error) {
      console.error('Failed to load holdings:', error);
    }
  };

  const loadCashBalances = async () => {
    try {
      const data = await api.getCashBalances();
      setCashBalances(data);
    } catch (error) {
      console.error('Failed to load cash balances:', error);
    }
  };

  const addAccount = async (newAccount) => {
    try {
      const created = await api.createAccount(newAccount);
      setAccounts([...accounts, created]);
      setShowAddAccount(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const deleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account? All associated holdings and cash balances will also be deleted.')) {
      return;
    }

    try {
      await api.deleteAccount(accountId);
      setAccounts(accounts.filter(acc => acc.id !== accountId));

      // If the deleted account was selected, switch to "all"
      if (selectedAccount == accountId) {
        setSelectedAccount('all');
      }

      // Reload holdings and cash balances as they may have been deleted
      await loadHoldings();
      await loadCashBalances();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const addHolding = async (newHolding) => {
    try {
      const created = await api.createHolding(newHolding);
      setHoldings([...holdings, created]);
      setShowAddHolding(false);
    } catch (error) {
      console.error('Failed to create holding:', error);
    }
  };

  const addCashBalance = async (cashBalance) => {
    try {
      await api.addCashBalance(cashBalance);
      await loadCashBalances();
      setShowAddCash(false);
    } catch (error) {
      console.error('Failed to add cash balance:', error);
    }
  };

  const getPortfolioSummary = () => {
    const filteredHoldings = selectedAccount === 'all'
      ? holdings
      : holdings.filter(h => h.account_id == selectedAccount);

    let totalValue = 0;
    let totalCost = 0;
    let totalDividends = 0;

    filteredHoldings.forEach(holding => {
      const metrics = calculateHoldingMetrics(holding);
      totalValue += convertCurrency(metrics.currentValue, holding.currency, baseCurrency, fxRates);
      totalCost += convertCurrency(metrics.totalCost, holding.currency, baseCurrency, fxRates);
      totalDividends += convertCurrency(metrics.annualDividend, holding.currency, baseCurrency, fxRates);
    });

    const filteredCash = selectedAccount === 'all'
      ? cashBalances
      : cashBalances.filter(c => c.account_id == selectedAccount);

    const cashTotal = filteredCash.reduce((sum, cash) => {
      return sum + convertCurrency(parseFloat(cash.amount), cash.currency, baseCurrency, fxRates);
    }, 0);

    totalValue += cashTotal;
    totalCost += cashTotal;

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent, totalDividends };
  };

  const summary = getPortfolioSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          baseCurrency={baseCurrency}
          setBaseCurrency={setBaseCurrency}
          loadFXRates={loadFXRates}
          setShowFXRates={setShowFXRates}
        />

        <PortfolioSummary summary={summary} baseCurrency={baseCurrency} />

        <CashBalances
          cashBalances={cashBalances}
          selectedAccount={selectedAccount}
          baseCurrency={baseCurrency}
          fxRates={fxRates}
          setShowAddCash={setShowAddCash}
        />

        <AccountFilter
          accounts={accounts}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          setShowAddAccount={setShowAddAccount}
          deleteAccount={deleteAccount}
        />

        <HoldingsTable
          holdings={holdings}
          selectedAccount={selectedAccount}
          setShowAddHolding={setShowAddHolding}
        />

        <AddAccountModal
          showAddAccount={showAddAccount}
          setShowAddAccount={setShowAddAccount}
          addAccount={addAccount}
        />

        <AddHoldingModal
          showAddHolding={showAddHolding}
          setShowAddHolding={setShowAddHolding}
          addHolding={addHolding}
          accounts={accounts}
        />

        <AddCashModal
          showAddCash={showAddCash}
          setShowAddCash={setShowAddCash}
          addCashBalance={addCashBalance}
          accounts={accounts}
        />

        <FXRatesModal
          showFXRates={showFXRates}
          setShowFXRates={setShowFXRates}
          fxRates={fxRates}
        />
      </div>
    </div>
  );
};

export default App;
