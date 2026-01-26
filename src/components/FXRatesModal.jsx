import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CURRENCIES } from '../utils/constants';
import api from '../services/api';

const FXRatesModal = ({ showFXRates, setShowFXRates, fxRates }) => {
  const [previousRates, setPreviousRates] = useState(null);

  useEffect(() => {
    if (showFXRates && fxRates) {
      fetchPreviousRates();
    }
  }, [showFXRates, fxRates]);

  const fetchPreviousRates = async () => {
    try {
      const history = await api.getFXRatesHistory(fxRates.base, 2);
      // Get the second most recent record (index 1) if it exists
      if (history && history.length > 1) {
        setPreviousRates(history[1].rates);
      } else {
        setPreviousRates(null);
      }
    } catch (error) {
      console.error('Failed to fetch historical rates:', error);
      setPreviousRates(null);
    }
  };

  const getChangeIndicator = (currentRate, currency) => {
    if (!previousRates || !previousRates[currency]) {
      return { icon: Minus, color: 'text-slate-400', label: 'No data' };
    }

    const previousRate = previousRates[currency];
    const change = currentRate - previousRate;

    if (Math.abs(change) < 0.0001) {
      return { icon: Minus, color: 'text-slate-400', label: 'No change' };
    } else if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'Increased' };
    } else {
      return { icon: TrendingDown, color: 'text-red-600', label: 'Decreased' };
    }
  };

  if (!showFXRates || !fxRates) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Exchange Rates</h3>
          <button
            onClick={() => setShowFXRates(false)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Base Currency:</strong> {fxRates.base}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            <strong>Source:</strong> {fxRates.source || 'Live Exchange Rates'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            <strong>Last updated:</strong> {fxRates.timestamp}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Currency</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold">Rate</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold">
                  1 {fxRates.base} =
                </th>
                <th className="text-center py-3 px-4 text-slate-600 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {CURRENCIES.map(currency => {
                const rate = fxRates.rates[currency];
                const isBaseCurrency = currency === fxRates.base;
                const changeIndicator = getChangeIndicator(rate, currency);
                const ChangeIcon = changeIndicator.icon;

                return (
                  <tr
                    key={currency}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      isBaseCurrency ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{currency}</span>
                        {isBaseCurrency && (
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                            Base
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {rate.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {rate.toFixed(4)} {currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center" title={changeIndicator.label}>
                        <ChangeIcon className={`w-5 h-5 ${changeIndicator.color}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            <strong>Live Data:</strong> Exchange rates are fetched from Frankfurter API (European Central Bank data).
            Rates are cached for 1 hour to optimize performance. Click the "Refresh" button in the header to fetch the latest rates.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowFXRates(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FXRatesModal;
