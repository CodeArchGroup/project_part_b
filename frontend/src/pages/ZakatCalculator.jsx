import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ZakatCalculator() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    savings: '',
    gold: '',
    silver: '',
    investments: '',
    liabilities: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const calculateZakat = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch('http://localhost:8080/api/shariah/zakat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, userId: user.uid })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: 'Failed to connect to the Shariah engine.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Zakat Calculator</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Calculate your mandatory Zakat securely based on your qualifying wealth.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '32px' }}>
        <div className="glass-panel">
          <form onSubmit={calculateZakat}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Liquid Cash / Savings</label>
              <input type="number" name="savings" value={formData.savings} onChange={handleChange} className="input-field" placeholder="0.00" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Gold Value</label>
              <input type="number" name="gold" value={formData.gold} onChange={handleChange} className="input-field" placeholder="0.00" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Silver Value</label>
              <input type="number" name="silver" value={formData.silver} onChange={handleChange} className="input-field" placeholder="0.00" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Total Halal Investments</label>
              <input type="number" name="investments" value={formData.investments} onChange={handleChange} className="input-field" placeholder="0.00" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Liabilities / Debts</label>
              <input type="number" name="liabilities" value={formData.liabilities} onChange={handleChange} className="input-field" placeholder="0.00" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Calculate Zakat'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ background: 'var(--primary-color)', color: 'white', border: 'none' }}>
           <h2 style={{ color: 'white', marginBottom: '16px' }}>Results</h2>
           {!result && <p style={{ color: 'rgba(255,255,255,0.8)' }}>Enter your asset data to view your Zakat obligations based on the current Nisab threshold.</p>}
           
           {result && result.success && (
             <div>
               <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '24px 0' }}>
                 ${result.zakatDue.toFixed(2)}
               </div>
               <p style={{ fontSize: '18px', marginBottom: '8px' }}>{result.message}</p>
               <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '24px' }}>
                 <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Net Wealth Assessed:</p>
                 <p style={{ fontSize: '20px', fontWeight: '600' }}>${result.netWealth?.toFixed(2)}</p>
               </div>
             </div>
           )}

           {result && !result.success && (
             <div style={{ padding: '16px', background: 'rgba(255,0,0,0.2)', borderRadius: '8px' }}>
                <p>{result.message}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
