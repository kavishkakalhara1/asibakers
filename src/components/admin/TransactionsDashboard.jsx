import { useState, useEffect, useCallback, useMemo } from 'react';

const TransactionsDashboard = ({ token }) => {
  const [activeView, setActiveView] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filters
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Expense form
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Ingredients',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    note: ''
  });

  // Budget form
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    monthlyBudget: '',
    categories: {
      Ingredients: '',
      Utilities: '',
      Rent: '',
      Salaries: '',
      Marketing: '',
      Equipment: '',
      Packaging: '',
      Delivery: '',
      Miscellaneous: ''
    }
  });

  const expenseCategories = [
    'Ingredients', 'Utilities', 'Rent', 'Salaries', 'Marketing',
    'Equipment', 'Packaging', 'Delivery', 'Maintenance', 'Miscellaneous'
  ];

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [transRes, summaryRes] = await Promise.all([
        fetch('/api/admin?action=transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin?action=financial-summary', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const transData = await transRes.json();
      const summaryData = await summaryRes.json();

      if (transData.success) setTransactions(transData.transactions);
      if (summaryData.success) {
        setFinancialSummary(summaryData.summary);
        if (summaryData.summary.budget) {
          setBudgetForm({
            monthlyBudget: summaryData.summary.budget.monthlyBudget?.toString() || '',
            categories: { ...budgetForm.categories, ...(summaryData.summary.budget.categories || {}) }
          });
        }
      }
    } catch (error) {
      showMsg('error', 'Failed to fetch financial data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(expenseForm)
      });
      const data = await response.json();
      if (data.success) {
        showMsg('success', 'Expense added successfully!');
        setShowExpenseModal(false);
        setExpenseForm({
          description: '', amount: '', category: 'Ingredients',
          date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', note: ''
        });
        fetchData();
      } else {
        showMsg('error', data.message);
      }
    } catch (error) {
      showMsg('error', 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const response = await fetch('/api/admin?action=expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        showMsg('success', 'Expense deleted!');
        fetchData();
      }
    } catch (error) {
      showMsg('error', 'Failed to delete expense');
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(budgetForm)
      });
      const data = await response.json();
      if (data.success) {
        showMsg('success', 'Budget saved successfully!');
        setShowBudgetModal(false);
        fetchData();
      }
    } catch (error) {
      showMsg('error', 'Failed to save budget');
    }
  };

  const formatCurrency = (amount) => `Rs ${(amount || 0).toLocaleString()}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Date range filter
    if (dateRange !== 'all' && dateRange !== 'custom') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        switch (dateRange) {
          case 'today': return tDate >= today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return tDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return tDate >= monthAgo;
          }
          case 'quarter': {
            const qAgo = new Date(today);
            qAgo.setMonth(qAgo.getMonth() - 3);
            return tDate >= qAgo;
          }
          case 'year': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return tDate >= yearStart;
          }
          default: return true;
        }
      });
    }

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= start && tDate <= end;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.customer || '').toLowerCase().includes(q) ||
        (t.orderNumber || '').toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'amount-asc': return a.amount - b.amount;
        case 'amount-desc': return b.amount - a.amount;
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  }, [transactions, typeFilter, categoryFilter, dateRange, customStartDate, customEndDate, searchQuery, sortBy]);

  // Aggregated stats for filtered transactions
  const filteredStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income' && (t.status === 'completed' || t.status === 'delivered'))
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, profit: income - expenses, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Get unique categories from transactions
  const allCategories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))].sort();
  }, [transactions]);

  const getPercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Export Transactions as CSV
  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Status', 'Payment Method'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.date),
      t.type,
      t.category,
      t.description,
      t.amount,
      t.status,
      t.paymentMethod || 'N/A'
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMsg('success', 'Transactions exported!');
  };

  if (isLoading) {
    return (
      <div className="fin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading financial data...</p>
      </div>
    );
  }

  const s = financialSummary;

  return (
    <div className="transactions-dashboard">
      {/* Message Toast */}
      {message.text && (
        <div className={`admin-message ${message.type}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* Sub-navigation */}
      <div className="fin-sub-nav">
        <button className={`fin-sub-nav-btn ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
          <i className="fas fa-chart-line"></i> Overview
        </button>
        <button className={`fin-sub-nav-btn ${activeView === 'transactions' ? 'active' : ''}`} onClick={() => setActiveView('transactions')}>
          <i className="fas fa-exchange-alt"></i> Transactions
        </button>
        <button className={`fin-sub-nav-btn ${activeView === 'expenses' ? 'active' : ''}`} onClick={() => setActiveView('expenses')}>
          <i className="fas fa-receipt"></i> Expenses
        </button>
        <button className={`fin-sub-nav-btn ${activeView === 'budget' ? 'active' : ''}`} onClick={() => setActiveView('budget')}>
          <i className="fas fa-wallet"></i> Budget
        </button>
        <button className={`fin-sub-nav-btn ${activeView === 'analytics' ? 'active' : ''}`} onClick={() => setActiveView('analytics')}>
          <i className="fas fa-chart-bar"></i> Analytics
        </button>
      </div>

      {/* ===== OVERVIEW VIEW ===== */}
      {activeView === 'overview' && s && (
        <div className="fin-overview">
          {/* Summary Cards Row */}
          <div className="fin-summary-cards">
            <div className="fin-card revenue">
              <div className="fin-card-icon"><i className="fas fa-arrow-up"></i></div>
              <div className="fin-card-content">
                <span className="fin-card-label">Total Revenue</span>
                <span className="fin-card-value">{formatCurrency(s.totalRevenue)}</span>
                <span className="fin-card-sub">{s.completedOrders} completed orders</span>
              </div>
            </div>
            <div className="fin-card expenses">
              <div className="fin-card-icon"><i className="fas fa-arrow-down"></i></div>
              <div className="fin-card-content">
                <span className="fin-card-label">Total Expenses</span>
                <span className="fin-card-value">{formatCurrency(s.totalExpenses)}</span>
                <span className="fin-card-sub">All time spending</span>
              </div>
            </div>
            <div className="fin-card profit">
              <div className="fin-card-icon"><i className="fas fa-coins"></i></div>
              <div className="fin-card-content">
                <span className="fin-card-label">Net Profit</span>
                <span className="fin-card-value" style={{ color: s.totalProfit >= 0 ? '#28a745' : '#dc3545' }}>
                  {formatCurrency(s.totalProfit)}
                </span>
                <span className="fin-card-sub">
                  Margin: {getPercentage(s.totalProfit, s.totalRevenue)}%
                </span>
              </div>
            </div>
            <div className="fin-card avg-order">
              <div className="fin-card-icon"><i className="fas fa-shopping-cart"></i></div>
              <div className="fin-card-content">
                <span className="fin-card-label">Avg Order Value</span>
                <span className="fin-card-value">{formatCurrency(s.avgOrderValue)}</span>
                <span className="fin-card-sub">{s.totalOrders} total orders</span>
              </div>
            </div>
          </div>

          {/* Monthly Comparison Cards */}
          <div className="fin-comparison-row">
            <div className="fin-comparison-card">
              <h4><i className="fas fa-calendar-alt"></i> This Month</h4>
              <div className="fin-comparison-grid">
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Revenue</span>
                  <span className="fin-comp-value income">{formatCurrency(s.monthlyRevenue)}</span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Expenses</span>
                  <span className="fin-comp-value expense">{formatCurrency(s.monthlyExpenses)}</span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Profit</span>
                  <span className="fin-comp-value" style={{ color: s.monthlyProfit >= 0 ? '#28a745' : '#dc3545' }}>
                    {formatCurrency(s.monthlyProfit)}
                  </span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Growth</span>
                  <span className={`fin-comp-value ${parseFloat(s.revenueGrowth) >= 0 ? 'income' : 'expense'}`}>
                    {parseFloat(s.revenueGrowth) >= 0 ? '+' : ''}{s.revenueGrowth}%
                  </span>
                </div>
              </div>
            </div>
            <div className="fin-comparison-card">
              <h4><i className="fas fa-calendar"></i> This Year</h4>
              <div className="fin-comparison-grid">
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Revenue</span>
                  <span className="fin-comp-value income">{formatCurrency(s.yearlyRevenue)}</span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Expenses</span>
                  <span className="fin-comp-value expense">{formatCurrency(s.yearlyExpenses)}</span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Profit</span>
                  <span className="fin-comp-value" style={{ color: s.yearlyProfit >= 0 ? '#28a745' : '#dc3545' }}>
                    {formatCurrency(s.yearlyProfit)}
                  </span>
                </div>
                <div className="fin-comp-item">
                  <span className="fin-comp-label">Pending</span>
                  <span className="fin-comp-value" style={{ color: '#ffc107' }}>{s.pendingOrders}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Table */}
          <div className="fin-section">
            <div className="fin-section-header">
              <h3><i className="fas fa-chart-bar"></i> Monthly Revenue Breakdown (Last 12 Months)</h3>
            </div>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {s.monthlyBreakdown && s.monthlyBreakdown.map((m, idx) => (
                    <tr key={idx}>
                      <td><strong>{m.month}</strong></td>
                      <td>{m.orders}</td>
                      <td className="text-income">{formatCurrency(m.revenue)}</td>
                      <td className="text-expense">{formatCurrency(m.expenses)}</td>
                      <td style={{ color: m.profit >= 0 ? '#28a745' : '#dc3545', fontWeight: 600 }}>
                        {formatCurrency(m.profit)}
                      </td>
                      <td>{m.revenue > 0 ? getPercentage(m.profit, m.revenue) + '%' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products & Payment Methods */}
          <div className="fin-two-col">
            <div className="fin-section">
              <div className="fin-section-header">
                <h3><i className="fas fa-trophy"></i> Top Selling Products</h3>
              </div>
              <div className="fin-top-products">
                {s.topProducts && s.topProducts.length > 0 ? (
                  s.topProducts.map((p, idx) => (
                    <div className="fin-product-row" key={idx}>
                      <div className="fin-product-rank">#{idx + 1}</div>
                      <div className="fin-product-info">
                        <span className="fin-product-name">{p.name}</span>
                        <span className="fin-product-qty">{p.quantity} sold</span>
                      </div>
                      <div className="fin-product-revenue">{formatCurrency(p.revenue)}</div>
                    </div>
                  ))
                ) : (
                  <p className="fin-empty-text">No product sales data yet</p>
                )}
              </div>
            </div>
            <div className="fin-section">
              <div className="fin-section-header">
                <h3><i className="fas fa-credit-card"></i> Payment Methods</h3>
              </div>
              <div className="fin-payment-methods">
                {s.paymentMethods && Object.entries(s.paymentMethods).length > 0 ? (
                  Object.entries(s.paymentMethods).map(([method, amount]) => {
                    const pct = getPercentage(amount, s.totalRevenue);
                    return (
                      <div className="fin-payment-row" key={method}>
                        <div className="fin-payment-info">
                          <span className="fin-payment-method">{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                          <div className="fin-progress-bar">
                            <div className="fin-progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="fin-payment-amount">
                          <span>{formatCurrency(amount)}</span>
                          <small>{pct}%</small>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="fin-empty-text">No payment data yet</p>
                )}
              </div>

              {/* Expense Categories */}
              <div className="fin-section-header" style={{ marginTop: '1.5rem' }}>
                <h3><i className="fas fa-tags"></i> Expense Categories</h3>
              </div>
              <div className="fin-payment-methods">
                {s.expenseCategories && Object.entries(s.expenseCategories).length > 0 ? (
                  Object.entries(s.expenseCategories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => {
                      const pct = getPercentage(amount, s.totalExpenses);
                      return (
                        <div className="fin-payment-row" key={cat}>
                          <div className="fin-payment-info">
                            <span className="fin-payment-method">{cat}</span>
                            <div className="fin-progress-bar expense-bar">
                              <div className="fin-progress-fill expense-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                          <div className="fin-payment-amount">
                            <span>{formatCurrency(amount)}</span>
                            <small>{pct}%</small>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="fin-empty-text">No expenses recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TRANSACTIONS VIEW ===== */}
      {activeView === 'transactions' && (
        <div className="fin-transactions">
          {/* Filter Bar */}
          <div className="fin-filter-bar">
            <div className="fin-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <select className="fin-filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="fin-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select className="fin-filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <select className="fin-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Custom date range inputs */}
          {dateRange === 'custom' && (
            <div className="fin-custom-dates">
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
            </div>
          )}

          {/* Filtered Summary */}
          <div className="fin-filtered-summary">
            <div className="fin-filtered-stat">
              <span className="fin-fs-label">Showing</span>
              <span className="fin-fs-value">{filteredStats.count} transactions</span>
            </div>
            <div className="fin-filtered-stat">
              <span className="fin-fs-label">Income</span>
              <span className="fin-fs-value income">{formatCurrency(filteredStats.income)}</span>
            </div>
            <div className="fin-filtered-stat">
              <span className="fin-fs-label">Expenses</span>
              <span className="fin-fs-value expense">{formatCurrency(filteredStats.expenses)}</span>
            </div>
            <div className="fin-filtered-stat">
              <span className="fin-fs-label">Net</span>
              <span className="fin-fs-value" style={{ color: filteredStats.profit >= 0 ? '#28a745' : '#dc3545' }}>
                {formatCurrency(filteredStats.profit)}
              </span>
            </div>
            <button className="admin-btn small primary" onClick={exportCSV}>
              <i className="fas fa-download"></i> Export CSV
            </button>
          </div>

          {/* Transactions Table */}
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                  <tr key={t._id} className={`trans-row ${t.type}`}>
                    <td>
                      <div className="date-cell">
                        <span>{formatDate(t.date)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`trans-type-badge ${t.type}`}>
                        <i className={`fas ${t.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        {t.type}
                      </span>
                    </td>
                    <td><span className="trans-category">{t.category}</span></td>
                    <td>
                      <div className="trans-desc">
                        <span>{t.description}</span>
                        {t.customer && <small>Customer: {t.customer}</small>}
                        {t.note && <small>Note: {t.note}</small>}
                      </div>
                    </td>
                    <td><span className={`status-badge ${t.status}`}>{t.status}</span></td>
                    <td>
                      <span className={`trans-amount ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td>
                      {t.type === 'expense' && (
                        <button
                          className="admin-btn-icon delete"
                          onClick={() => handleDeleteExpense(t._id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="fin-empty-row">
                      <i className="fas fa-inbox"></i>
                      <p>No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== EXPENSES VIEW ===== */}
      {activeView === 'expenses' && (
        <div className="fin-expenses">
          <div className="fin-toolbar">
            <button className="admin-btn primary" onClick={() => setShowExpenseModal(true)}>
              <i className="fas fa-plus"></i> Add Expense
            </button>
          </div>

          {/* Expense Summary Cards */}
          {s && (
            <div className="fin-expense-summary">
              <div className="fin-exp-card">
                <i className="fas fa-calendar-day"></i>
                <div>
                  <span className="fin-exp-label">This Month</span>
                  <span className="fin-exp-value">{formatCurrency(s.monthlyExpenses)}</span>
                </div>
              </div>
              <div className="fin-exp-card">
                <i className="fas fa-calendar"></i>
                <div>
                  <span className="fin-exp-label">Last Month</span>
                  <span className="fin-exp-value">{formatCurrency(s.lastMonthExpenses)}</span>
                </div>
              </div>
              <div className="fin-exp-card">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <span className="fin-exp-label">This Year</span>
                  <span className="fin-exp-value">{formatCurrency(s.yearlyExpenses)}</span>
                </div>
              </div>
              <div className="fin-exp-card">
                <i className="fas fa-infinity"></i>
                <div>
                  <span className="fin-exp-label">All Time</span>
                  <span className="fin-exp-value">{formatCurrency(s.totalExpenses)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Expense Categories Breakdown */}
          {s && s.expenseCategories && Object.keys(s.expenseCategories).length > 0 && (
            <div className="fin-section">
              <div className="fin-section-header">
                <h3><i className="fas fa-pie-chart"></i> Expense Breakdown by Category</h3>
              </div>
              <div className="fin-category-grid">
                {Object.entries(s.expenseCategories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div className="fin-cat-card" key={cat}>
                      <div className="fin-cat-header">
                        <span className="fin-cat-name">{cat}</span>
                        <span className="fin-cat-pct">{getPercentage(amount, s.totalExpenses)}%</span>
                      </div>
                      <span className="fin-cat-amount">{formatCurrency(amount)}</span>
                      <div className="fin-progress-bar expense-bar">
                        <div className="fin-progress-fill expense-fill" style={{ width: `${getPercentage(amount, s.totalExpenses)}%` }}></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div className="fin-section">
            <div className="fin-section-header">
              <h3><i className="fas fa-list"></i> All Expenses</h3>
            </div>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.type === 'expense').length > 0 ? (
                    transactions.filter(t => t.type === 'expense').map(t => (
                      <tr key={t._id}>
                        <td>{formatDate(t.date)}</td>
                        <td><span className="trans-category">{t.category}</span></td>
                        <td>
                          <div className="trans-desc">
                            <span>{t.description}</span>
                            {t.note && <small>{t.note}</small>}
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{t.paymentMethod}</td>
                        <td><span className="trans-amount expense">{formatCurrency(t.amount)}</span></td>
                        <td>
                          <button className="admin-btn-icon delete" onClick={() => handleDeleteExpense(t._id)} title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="fin-empty-row">
                        <i className="fas fa-receipt"></i>
                        <p>No expenses recorded yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== BUDGET VIEW ===== */}
      {activeView === 'budget' && (
        <div className="fin-budget">
          <div className="fin-toolbar">
            <button className="admin-btn primary" onClick={() => setShowBudgetModal(true)}>
              <i className="fas fa-edit"></i> Set Budget
            </button>
          </div>

          {s && s.budget ? (
            <>
              {/* Budget Overview */}
              <div className="fin-budget-overview">
                <div className="fin-budget-main-card">
                  <h3>Monthly Budget</h3>
                  <div className="fin-budget-amount">{formatCurrency(s.budget.monthlyBudget)}</div>
                  <div className="fin-budget-spent">
                    <span>Spent: {formatCurrency(s.monthlyExpenses)}</span>
                    <span>Remaining: {formatCurrency(s.budget.monthlyBudget - s.monthlyExpenses)}</span>
                  </div>
                  <div className="fin-budget-bar">
                    <div
                      className={`fin-budget-fill ${(s.monthlyExpenses / s.budget.monthlyBudget) > 0.9 ? 'danger' : (s.monthlyExpenses / s.budget.monthlyBudget) > 0.7 ? 'warning' : 'safe'}`}
                      style={{ width: `${Math.min((s.monthlyExpenses / s.budget.monthlyBudget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="fin-budget-pct">
                    {getPercentage(s.monthlyExpenses, s.budget.monthlyBudget)}% used
                  </div>
                </div>

                {/* Profit vs Budget Insight */}
                <div className="fin-budget-insight-card">
                  <h3><i className="fas fa-lightbulb"></i> Budget Insights</h3>
                  <div className="fin-insight-list">
                    <div className="fin-insight-item">
                      <i className={`fas ${s.monthlyProfit >= 0 ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                        style={{ color: s.monthlyProfit >= 0 ? '#28a745' : '#dc3545' }}></i>
                      <span>Monthly profit: <strong>{formatCurrency(s.monthlyProfit)}</strong></span>
                    </div>
                    <div className="fin-insight-item">
                      <i className={`fas ${s.monthlyExpenses <= s.budget.monthlyBudget ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}
                        style={{ color: s.monthlyExpenses <= s.budget.monthlyBudget ? '#28a745' : '#ffc107' }}></i>
                      <span>
                        {s.monthlyExpenses <= s.budget.monthlyBudget
                          ? `Under budget by ${formatCurrency(s.budget.monthlyBudget - s.monthlyExpenses)}`
                          : `Over budget by ${formatCurrency(s.monthlyExpenses - s.budget.monthlyBudget)}`}
                      </span>
                    </div>
                    <div className="fin-insight-item">
                      <i className="fas fa-info-circle" style={{ color: '#17a2b8' }}></i>
                      <span>Revenue covers {s.totalRevenue > 0 ? getPercentage(s.totalExpenses, s.totalRevenue) : 0}% of expenses</span>
                    </div>
                    <div className="fin-insight-item">
                      <i className="fas fa-chart-line" style={{ color: '#6f42c1' }}></i>
                      <span>Avg daily expense: {formatCurrency(s.monthlyExpenses / new Date().getDate())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Budgets */}
              {s.budget.categories && Object.keys(s.budget.categories).some(k => s.budget.categories[k]) && (
                <div className="fin-section">
                  <div className="fin-section-header">
                    <h3><i className="fas fa-th-large"></i> Category Budget Tracking</h3>
                  </div>
                  <div className="fin-category-budgets">
                    {Object.entries(s.budget.categories)
                      .filter(([, budget]) => budget && parseFloat(budget) > 0)
                      .map(([cat, budget]) => {
                        const spent = s.expenseCategories?.[cat] || 0;
                        const budgetAmt = parseFloat(budget);
                        const pct = getPercentage(spent, budgetAmt);
                        return (
                          <div className="fin-cat-budget-card" key={cat}>
                            <div className="fin-cat-budget-header">
                              <span>{cat}</span>
                              <span className={`fin-cat-budget-status ${parseFloat(pct) > 100 ? 'over' : parseFloat(pct) > 80 ? 'warning' : 'ok'}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="fin-cat-budget-bar">
                              <div
                                className={`fin-cat-budget-fill ${parseFloat(pct) > 100 ? 'over' : parseFloat(pct) > 80 ? 'warning' : 'ok'}`}
                                style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                              ></div>
                            </div>
                            <div className="fin-cat-budget-info">
                              <span>{formatCurrency(spent)} / {formatCurrency(budgetAmt)}</span>
                              <span>{formatCurrency(Math.max(budgetAmt - spent, 0))} left</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="fin-empty-state">
              <i className="fas fa-wallet"></i>
              <h3>No Budget Set</h3>
              <p>Set up a monthly budget to track your spending and stay on top of finances.</p>
              <button className="admin-btn primary" onClick={() => setShowBudgetModal(true)}>
                <i className="fas fa-plus"></i> Set Budget
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== ANALYTICS VIEW ===== */}
      {activeView === 'analytics' && s && (
        <div className="fin-analytics">
          {/* Key Metrics */}
          <div className="fin-metrics-grid">
            <div className="fin-metric-card">
              <div className="fin-metric-icon" style={{ background: 'linear-gradient(135deg, #28a745, #7dcea0)' }}>
                <i className="fas fa-percentage"></i>
              </div>
              <div className="fin-metric-info">
                <span className="fin-metric-value">{getPercentage(s.totalProfit, s.totalRevenue)}%</span>
                <span className="fin-metric-label">Profit Margin</span>
              </div>
            </div>
            <div className="fin-metric-card">
              <div className="fin-metric-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #5bc0de)' }}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="fin-metric-info">
                <span className="fin-metric-value">{s.revenueGrowth}%</span>
                <span className="fin-metric-label">Revenue Growth</span>
              </div>
            </div>
            <div className="fin-metric-card">
              <div className="fin-metric-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #ffdb58)' }}>
                <i className="fas fa-shopping-basket"></i>
              </div>
              <div className="fin-metric-info">
                <span className="fin-metric-value">{formatCurrency(s.avgOrderValue)}</span>
                <span className="fin-metric-label">Avg Order Value</span>
              </div>
            </div>
            <div className="fin-metric-card">
              <div className="fin-metric-icon" style={{ background: 'linear-gradient(135deg, #6f42c1, #a78bfa)' }}>
                <i className="fas fa-calculator"></i>
              </div>
              <div className="fin-metric-info">
                <span className="fin-metric-value">
                  {s.completedOrders > 0 ? (s.totalRevenue / s.completedOrders / 1000).toFixed(1) + 'K' : '0'}
                </span>
                <span className="fin-metric-label">Revenue/Order</span>
              </div>
            </div>
          </div>

          {/* Daily Revenue Current Month */}
          <div className="fin-section">
            <div className="fin-section-header">
              <h3><i className="fas fa-chart-area"></i> Daily Revenue - Current Month</h3>
            </div>
            <div className="fin-daily-chart">
              {s.dailyRevenue && s.dailyRevenue.map((d) => {
                const maxRev = Math.max(...s.dailyRevenue.map(x => x.revenue), 1);
                const height = (d.revenue / maxRev) * 100;
                return (
                  <div
                    className="fin-daily-bar-container"
                    key={d.day}
                    title={`Day ${d.day}: ${formatCurrency(d.revenue)}`}
                  >
                    <div className="fin-daily-bar" style={{ height: `${Math.max(height, 2)}%` }}>
                      {d.revenue > 0 && <span className="fin-bar-tooltip">{(d.revenue / 1000).toFixed(1)}K</span>}
                    </div>
                    <span className="fin-bar-label">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue vs Expense Comparison (12 months) */}
          <div className="fin-section">
            <div className="fin-section-header">
              <h3><i className="fas fa-balance-scale"></i> Revenue vs Expenses (12 Months)</h3>
            </div>
            <div className="fin-comparison-chart">
              {s.monthlyBreakdown && s.monthlyBreakdown.map((m, idx) => {
                const maxVal = Math.max(...s.monthlyBreakdown.map(x => Math.max(x.revenue, x.expenses)), 1);
                const revHeight = (m.revenue / maxVal) * 100;
                const expHeight = (m.expenses / maxVal) * 100;
                return (
                  <div className="fin-comp-bar-group" key={idx}>
                    <div className="fin-comp-bars">
                      <div className="fin-comp-bar revenue" style={{ height: `${Math.max(revHeight, 2)}%` }}
                        title={`Revenue: ${formatCurrency(m.revenue)}`}></div>
                      <div className="fin-comp-bar expense" style={{ height: `${Math.max(expHeight, 2)}%` }}
                        title={`Expenses: ${formatCurrency(m.expenses)}`}></div>
                    </div>
                    <span className="fin-comp-label">{m.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <div className="fin-chart-legend">
              <span className="fin-legend-item"><span className="fin-legend-dot revenue"></span> Revenue</span>
              <span className="fin-legend-item"><span className="fin-legend-dot expense"></span> Expenses</span>
            </div>
          </div>

          {/* Financial Health Score */}
          <div className="fin-section">
            <div className="fin-section-header">
              <h3><i className="fas fa-heartbeat"></i> Financial Health Score</h3>
            </div>
            <div className="fin-health">
              {(() => {
                const profitMargin = s.totalRevenue > 0 ? (s.totalProfit / s.totalRevenue) * 100 : 0;
                const growth = parseFloat(s.revenueGrowth) || 0;
                const budgetAdherence = s.budget?.monthlyBudget
                  ? Math.max(0, 100 - ((s.monthlyExpenses / s.budget.monthlyBudget) * 100 - 100))
                  : 50;
                const score = Math.round(
                  (Math.min(profitMargin, 50) * 2 +
                    Math.min(Math.max(growth + 50, 0), 100) +
                    Math.min(budgetAdherence, 100)) / 3
                );
                const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
                const color = score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : score >= 40 ? '#fd7e14' : '#dc3545';

                return (
                  <div className="fin-health-content">
                    <div className="fin-health-score" style={{ borderColor: color }}>
                      <span className="fin-health-grade" style={{ color }}>{grade}</span>
                      <span className="fin-health-number">{score}/100</span>
                    </div>
                    <div className="fin-health-breakdown">
                      <div className="fin-health-item">
                        <span>Profit Margin</span>
                        <div className="fin-health-bar">
                          <div style={{ width: `${Math.min(profitMargin * 2, 100)}%`, background: '#28a745' }}></div>
                        </div>
                        <span>{profitMargin.toFixed(1)}%</span>
                      </div>
                      <div className="fin-health-item">
                        <span>Revenue Growth</span>
                        <div className="fin-health-bar">
                          <div style={{ width: `${Math.min(Math.max(growth + 50, 0), 100)}%`, background: '#17a2b8' }}></div>
                        </div>
                        <span>{growth > 0 ? '+' : ''}{growth}%</span>
                      </div>
                      <div className="fin-health-item">
                        <span>Budget Control</span>
                        <div className="fin-health-bar">
                          <div style={{ width: `${Math.min(budgetAdherence, 100)}%`, background: '#6f42c1' }}></div>
                        </div>
                        <span>{budgetAdherence.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD EXPENSE MODAL ===== */}
      {showExpenseModal && (
        <div className="admin-modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2><i className="fas fa-receipt" style={{ color: 'var(--admin-primary)', marginRight: '8px' }}></i> Add Expense</h2>
              <button className="close-btn" onClick={() => setShowExpenseModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="admin-form-group">
                <label><i className="fas fa-file-alt"></i> Description</label>
                <input
                  type="text"
                  placeholder="e.g., Flour and sugar purchase"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-money-bill"></i> Amount (Rs)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-tag"></i> Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-calendar"></i> Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-credit-card"></i> Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label><i className="fas fa-sticky-note"></i> Note (optional)</label>
                <textarea
                  placeholder="Additional details..."
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  rows="2"
                ></textarea>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary"><i className="fas fa-plus"></i> Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== BUDGET MODAL ===== */}
      {showBudgetModal && (
        <div className="admin-modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="admin-modal-header">
              <h2><i className="fas fa-wallet" style={{ color: 'var(--admin-primary)', marginRight: '8px' }}></i> Set Monthly Budget</h2>
              <button className="close-btn" onClick={() => setShowBudgetModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveBudget}>
              <div className="admin-form-group">
                <label><i className="fas fa-money-bill-wave"></i> Total Monthly Budget (Rs)</label>
                <input
                  type="number"
                  placeholder="e.g., 100000"
                  value={budgetForm.monthlyBudget}
                  onChange={(e) => setBudgetForm({ ...budgetForm, monthlyBudget: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--admin-text)' }}>
                  <i className="fas fa-th-large" style={{ color: 'var(--admin-primary)', marginRight: '6px' }}></i>
                  Category Budgets (optional)
                </label>
                <div className="fin-budget-categories-form">
                  {expenseCategories.map(cat => (
                    <div className="fin-budget-cat-input" key={cat}>
                      <label>{cat}</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={budgetForm.categories[cat] || ''}
                        onChange={(e) => setBudgetForm({
                          ...budgetForm,
                          categories: { ...budgetForm.categories, [cat]: e.target.value }
                        })}
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary"><i className="fas fa-save"></i> Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsDashboard;
