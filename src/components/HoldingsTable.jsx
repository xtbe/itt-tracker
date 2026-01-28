import React from 'react';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { calculateHoldingMetrics, convertCurrency, calculateAdvice } from '../utils/calculations';

const HoldingsTable = ({ holdings, selectedAccount, setShowAddHolding, editHolding, deleteHolding, baseCurrency, fxRates }) => {
  const filteredHoldings = selectedAccount === 'all'
    ? holdings
    : holdings.filter(h => h.account_id == selectedAccount);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Holdings</h2>
        <button
          onClick={() => setShowAddHolding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Add Holding
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-slate-600 font-semibold">Symbol</th>
              <th className="text-left py-3 px-4 text-slate-600 font-semibold">Name</th>
              <th className="text-left py-3 px-4 text-slate-600 font-semibold">Type</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Quantity</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Avg Cost</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Current Price</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Total Cost</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Total Value</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Gain/Loss</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Dividend Yield</th>
              <th className="text-center py-3 px-4 text-slate-600 font-semibold">Advice</th>
              <th className="text-center py-3 px-4 text-slate-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHoldings.map(holding => {
              const metrics = calculateHoldingMetrics(holding);
              return (
                <tr key={holding.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-800">{holding.symbol}</td>
                  <td className="py-4 px-4 text-slate-600">{holding.name}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                      {holding.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    {holding.type && holding.type.toLowerCase() === 'bond'
                      ? `${holding.quantity.toLocaleString()} nominal`
                      : holding.quantity}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    {holding.type && holding.type.toLowerCase() === 'bond'
                      ? <div>
                          <div>{parseFloat(holding.purchase_price).toFixed(2)}</div>
                          <div className="text-xs text-slate-500">per 100</div>
                        </div>
                      : `${holding.currency} ${parseFloat(holding.purchase_price).toFixed(2)}`
                    }
                  </td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    {holding.type && holding.type.toLowerCase() === 'bond'
                      ? <div>
                          <div>{parseFloat(holding.current_price).toFixed(2)}</div>
                          <div className="text-xs text-slate-500">per 100</div>
                        </div>
                      : `${holding.currency} ${parseFloat(holding.current_price).toFixed(2)}`
                    }
                  </td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    <div>{holding.currency} {metrics.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    {holding.currency !== baseCurrency && (
                      <div className="text-xs text-slate-500">
                        ≈ {baseCurrency} {convertCurrency(metrics.totalCost, holding.currency, baseCurrency, fxRates).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-slate-800">
                    <div>{holding.currency} {metrics.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    {holding.currency !== baseCurrency && (
                      <div className="text-xs text-slate-500 font-normal">
                        ≈ {baseCurrency} {convertCurrency(metrics.currentValue, holding.currency, baseCurrency, fxRates).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-semibold ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.gainLoss >= 0 ? '+' : ''}{holding.currency} {metrics.gainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    {holding.currency !== baseCurrency && (
                      <div className={`text-xs ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ≈ {baseCurrency} {convertCurrency(metrics.gainLoss, holding.currency, baseCurrency, fxRates).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    )}
                    <div className={`text-sm ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.gainLoss >= 0 ? '+' : ''}{metrics.gainLossPercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-slate-800 font-medium">{parseFloat(holding.dividend_yield).toFixed(2)}%</div>
                    <div className="text-sm text-slate-600">
                      {holding.currency} {metrics.annualDividend.toFixed(2)}/yr
                    </div>
                    {holding.currency !== baseCurrency && (
                      <div className="text-xs text-slate-500">
                        ≈ {baseCurrency} {convertCurrency(metrics.annualDividend, holding.currency, baseCurrency, fxRates).toFixed(2)}/yr
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {(() => {
                      const advice = holding.advice || calculateAdvice(holding);
                      const adviceColors = {
                        'Buy': 'bg-green-100 text-green-700',
                        'Sell': 'bg-red-100 text-red-700',
                        'Keep': 'bg-blue-100 text-blue-700'
                      };
                      return (
                        <span className={`px-3 py-1 ${adviceColors[advice] || 'bg-gray-100 text-gray-700'} rounded-md text-sm font-medium`}>
                          {advice}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => editHolding(holding)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit holding"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHolding(holding.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete holding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;
