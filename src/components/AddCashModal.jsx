import React from 'react';
import { CURRENCIES } from '../utils/constants';

const AddCashModal = ({ showAddCash, setShowAddCash, addCashBalance, accounts }) => {
  if (!showAddCash) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    const transactionType = formData.get('transactionType');
    const finalAmount = transactionType === 'withdraw' ? -amount : amount;

    addCashBalance({
      account_id: formData.get('accountId'),
      currency: formData.get('currency'),
      amount: finalAmount
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Deposit / Withdraw Cash</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
              <select name="transactionType" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
              <select name="accountId" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} - {acc.bank}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select name="currency" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The amount will be added to or subtracted from your existing balance in this currency.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowAddCash(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCashModal;
