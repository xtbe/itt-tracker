import React from 'react';
import { PlusCircle, X } from 'lucide-react';

const AccountFilter = ({ accounts, selectedAccount, setSelectedAccount, setShowAddAccount, deleteAccount }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Accounts</h2>
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Add Account
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedAccount('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedAccount === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Accounts
        </button>
        {accounts.map(account => (
          <div key={account.id} className="relative group">
            <button
              onClick={() => setSelectedAccount(account.id)}
              className={`px-4 py-2 pr-8 rounded-lg font-medium transition-colors ${
                selectedAccount == account.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="flex flex-col items-start">
                <span>{account.name} ({account.currency})</span>
                {account.account_number && (
                  <span className="text-xs opacity-75">#{account.account_number}</span>
                )}
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAccount(account.id);
              }}
              className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                selectedAccount == account.id
                  ? 'hover:bg-red-700 text-white'
                  : 'hover:bg-red-100 text-red-600'
              }`}
              title="Delete account"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountFilter;
