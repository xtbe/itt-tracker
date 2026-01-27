import React from 'react';
import { ACCOUNT_TYPES, CURRENCIES } from '../utils/constants';

const AddAccountModal = ({ showAddAccount, setShowAddAccount, addAccount, editingAccount, updateAccount }) => {
  if (!showAddAccount) return null;

  const isEditing = !!editingAccount;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const accountData = {
      name: formData.get('name'),
      bank: formData.get('bank'),
      account_number: formData.get('accountNumber'),
      type: formData.get('type'),
      currency: formData.get('currency')
    };

    if (isEditing) {
      updateAccount(editingAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          {isEditing ? 'Edit Account' : 'Add New Account'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input
                name="name"
                required
                defaultValue={editingAccount?.name || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank/Institution</label>
              <input
                name="bank"
                required
                defaultValue={editingAccount?.bank || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input
                name="accountNumber"
                defaultValue={editingAccount?.account_number || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
              <select
                name="type"
                required
                defaultValue={editingAccount?.type || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ACCOUNT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                name="currency"
                required
                defaultValue={editingAccount?.currency || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {isEditing ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
