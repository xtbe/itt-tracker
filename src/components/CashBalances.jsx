import React from 'react';
import { PlusCircle, DollarSign } from 'lucide-react';
import { convertCurrency } from '../utils/calculations';

const CashBalances = ({ cashBalances, selectedAccount, baseCurrency, fxRates, setShowAddCash }) => {
  const getCashSummary = () => {
    const filteredCash = selectedAccount === 'all'
      ? cashBalances
      : cashBalances.filter(c => c.account_id == selectedAccount);

    const byCurrency = filteredCash.reduce((acc, cash) => {
      acc[cash.currency] = (acc[cash.currency] || 0) + parseFloat(cash.amount);
      return acc;
    }, {});

    let totalInBase = 0;
    Object.entries(byCurrency).forEach(([currency, amount]) => {
      totalInBase += convertCurrency(amount, currency, baseCurrency, fxRates);
    });

    return { byCurrency, totalInBase };
  };

  const cashSummary = getCashSummary();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cash Balances</h2>
          <p className="text-sm text-slate-600 mt-1">
            Total in {baseCurrency}: <span className={cashSummary.totalInBase < 0 ? 'text-red-600 font-semibold' : ''}>
              {cashSummary.totalInBase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
            {' • '}
            {Object.keys(cashSummary.byCurrency).length} {Object.keys(cashSummary.byCurrency).length === 1 ? 'currency' : 'currencies'}
          </p>
        </div>
        <button
          onClick={() => setShowAddCash(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Deposit/Withdraw
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(cashSummary.byCurrency).map(([currency, amount]) => {
          const valueInBase = convertCurrency(amount, currency, baseCurrency, fxRates);
          const isNegative = amount < 0;
          return (
            <div key={currency} className={`rounded-lg p-4 border ${
              isNegative
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-5 h-5 ${isNegative ? 'text-red-600' : 'text-slate-600'}`} />
                <span className={`text-sm font-semibold ${isNegative ? 'text-red-600' : 'text-slate-600'}`}>{currency}</span>
              </div>
              <p className={`text-2xl font-bold ${isNegative ? 'text-red-800' : 'text-slate-800'}`}>
                {isNegative ? '-' : ''}{Math.abs(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </p>
              <p className={`text-xs mt-1 ${isNegative ? 'text-red-600' : 'text-slate-500'}`}>
                ≈ {baseCurrency} {isNegative ? '-' : ''}{Math.abs(valueInBase).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </p>
            </div>
          );
        })}
        {Object.keys(cashSummary.byCurrency).length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500">
            No cash balances yet. Click "Deposit/Withdraw" to add funds.
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBalances;
