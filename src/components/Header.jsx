import React from 'react';
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import { CURRENCIES } from '../utils/constants';

const Header = ({ baseCurrency, setBaseCurrency, loadFXRates, setShowFXRates }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Investment Portfolio Tracker
          </h1>
          <p className="text-slate-600 mt-1">Multi-currency portfolio management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFXRates(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="View Exchange Rates"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="hidden sm:inline">Rates</span>
          </button>
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
          <button
            onClick={loadFXRates}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh FX Rates"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
