import React from 'react';
import { ASSET_TYPES, CURRENCIES } from '../utils/constants';

const AddHoldingModal = ({ showAddHolding, setShowAddHolding, addHolding, accounts }) => {
  if (!showAddHolding) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addHolding({
      account_id: formData.get('accountId'),
      symbol: formData.get('symbol'),
      name: formData.get('name'),
      type: formData.get('type'),
      quantity: parseFloat(formData.get('quantity')),
      purchase_price: parseFloat(formData.get('purchasePrice')),
      current_price: parseFloat(formData.get('currentPrice')),
      currency: formData.get('currency'),
      dividend_yield: parseFloat(formData.get('dividendYield') || 0),
      purchase_date: formData.get('purchaseDate')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Holding</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
              <select name="accountId" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} - {acc.bank}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Symbol/Ticker</label>
              <input name="symbol" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="AAPL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input name="name" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Apple Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Type</label>
              <select name="type" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input name="quantity" type="number" step="0.001" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
              <input name="purchasePrice" type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Price</label>
              <input name="currentPrice" type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select name="currency" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dividend Yield (%)</label>
              <input name="dividendYield" type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
              <input name="purchaseDate" type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowAddHolding(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoldingModal;
