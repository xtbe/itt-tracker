import React from 'react';
import { PlusCircle } from 'lucide-react';
import { calculateHoldingMetrics } from '../utils/calculations';

const HoldingsTable = ({ holdings, selectedAccount, setShowAddHolding }) => {
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
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Total Value</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Gain/Loss</th>
              <th className="text-right py-3 px-4 text-slate-600 font-semibold">Dividend Yield</th>
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
                  <td className="py-4 px-4 text-right text-slate-800">{holding.quantity}</td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    {holding.currency} {parseFloat(holding.purchase_price).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-800">
                    {holding.currency} {parseFloat(holding.current_price).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-slate-800">
                    {holding.currency} {metrics.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-semibold ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.gainLoss >= 0 ? '+' : ''}{holding.currency} {metrics.gainLoss.toFixed(2)}
                    </div>
                    <div className={`text-sm ${metrics.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.gainLoss >= 0 ? '+' : ''}{metrics.gainLossPercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-slate-800 font-medium">{parseFloat(holding.dividend_yield).toFixed(2)}%</div>
                    <div className="text-sm text-slate-600">
                      {holding.currency} {metrics.annualDividend.toFixed(2)}/yr
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
