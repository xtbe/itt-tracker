import React from 'react';
import { DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioSummary = ({ summary, baseCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Value</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {baseCurrency} {summary.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <DollarSign className="w-10 h-10 text-blue-600 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Cost</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {baseCurrency} {summary.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <Wallet className="w-10 h-10 text-slate-600 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Gain/Loss</p>
            <p className={`text-2xl font-bold mt-1 ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainLoss >= 0 ? '+' : ''}{baseCurrency} {summary.totalGainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className={`text-sm font-medium ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainLoss >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%
            </p>
          </div>
          {summary.totalGainLoss >= 0 ?
            <TrendingUp className="w-10 h-10 text-green-600 opacity-80" /> :
            <TrendingDown className="w-10 h-10 text-red-600 opacity-80" />
          }
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Annual Dividends</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {baseCurrency} {summary.totalDividends.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-600 opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
