const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class API {
  // Accounts
  async getAccounts() {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  }

  async createAccount(account) {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    if (!response.ok) throw new Error('Failed to create account');
    return response.json();
  }

  async updateAccount(id, account) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  }

  async deleteAccount(id) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  }

  // Holdings
  async getHoldings(accountId = null) {
    const url = accountId
      ? `${API_BASE_URL}/holdings?accountId=${accountId}`
      : `${API_BASE_URL}/holdings`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch holdings');
    return response.json();
  }

  async createHolding(holding) {
    const response = await fetch(`${API_BASE_URL}/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holding)
    });
    if (!response.ok) throw new Error('Failed to create holding');
    return response.json();
  }

  async updateHolding(id, holding) {
    const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holding)
    });
    if (!response.ok) throw new Error('Failed to update holding');
    return response.json();
  }

  async deleteHolding(id) {
    const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete holding');
    return response.json();
  }

  // Cash Balances
  async getCashBalances(accountId = null) {
    const url = accountId
      ? `${API_BASE_URL}/cash-balances?accountId=${accountId}`
      : `${API_BASE_URL}/cash-balances`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cash balances');
    return response.json();
  }

  async addCashBalance(cashBalance) {
    const response = await fetch(`${API_BASE_URL}/cash-balances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cashBalance)
    });
    if (!response.ok) throw new Error('Failed to add cash balance');
    return response.json();
  }

  async deleteCashBalance(id) {
    const response = await fetch(`${API_BASE_URL}/cash-balances/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete cash balance');
    return response.json();
  }

  // FX Rates
  async getFXRates(baseCurrency = 'USD') {
    const response = await fetch(`${API_BASE_URL}/fx-rates?base=${baseCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch FX rates');
    return response.json();
  }

  async getFXRatesHistory(baseCurrency = 'USD', days = 30) {
    const response = await fetch(`${API_BASE_URL}/fx-rates/history?base=${baseCurrency}&days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch FX rates history');
    return response.json();
  }
}

export default new API();
