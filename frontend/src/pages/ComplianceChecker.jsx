import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl, authHeaders, API_CONFIG } from '../config/api';
import { handleApiError, parseApiResponse } from '../config/errors';
import {
  AAOIFI_CASH_THRESHOLD,
  AAOIFI_DEBT_THRESHOLD,
  AAOIFI_INTEREST_THRESHOLD,
  INTEREST_RATIO_VISUAL_MULTIPLIER,
  getComplianceStatusColor
} from '../constants/shariah.constants';

export default function ComplianceChecker() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    activityName: '',
    sector: '',
    amount: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const checkCompliance = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(apiUrl(API_CONFIG.ENDPOINTS.COMPLIANCE), {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ ...formData, userId: user.uid })
      });
      const data = await parseApiResponse(res);
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: handleApiError(err, 'Failed to access Shariah rules engine.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'authFadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', background: 'linear-gradient(90deg, var(--primary-color), #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AAOIFI Compliance Screener
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Instantly verify if a stock, company, or sector aligns with Islamic laws by screening its financials against rigorous AAOIFI Standard No. 21 thresholds.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <form onSubmit={checkCompliance}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Company / Ticker Symbol</label>
              <input type="text" name="activityName" value={formData.activityName} onChange={handleChange} className="input-field" placeholder="e.g. AAPL, TSLA" style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }} />
            </div>
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Industry Sector</label>
              <input type="text" name="sector" value={formData.sector} onChange={handleChange} className="input-field" placeholder="e.g. Technology, Banking" style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="auth-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                <span>Running Algorithmic Shariah Screen...</span>
              </>
            ) : (
              '🔍 Scan Financial Ratios'
            )}
          </button>
        </form>
      </div>

      {result && result.success && (
        <div style={{ 
          animation: 'authFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '32px', 
          borderTop: `4px solid ${getComplianceStatusColor(result.status)}`, 
          borderRadius: '16px', 
          background: 'var(--surface)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow based on status */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', background: getComplianceStatusColor(result.status), filter: 'blur(100px)', opacity: '0.1', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>Screening Result for</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{result.activityName || result.sector || 'Unknown'}</div>
              </div>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: '30px', 
                background: `${getComplianceStatusColor(result.status)}15`, 
                color: getComplianceStatusColor(result.status),
                fontWeight: 'bold',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${getComplianceStatusColor(result.status)}30`
              }}>
                {result.status === 'Compliant' ? '✅' : result.status === 'Non-Compliant' ? '❌' : '⚠️'}
                {result.status}
              </div>
            </div>

            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '15px', padding: '16px', background: 'var(--background)', borderRadius: '12px', marginBottom: '24px', borderLeft: `3px solid ${getComplianceStatusColor(result.status)}` }}>
              {result.explanation}
            </p>
            
            {result.ratios && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AAOIFI Rule 21 Financial Ratio Breakdown
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Debt Ratio */}
                  <RatioBar 
                    label="Interest-bearing Debt / Total Assets" 
                    value={result.ratios.debtRatio} 
                    threshold={AAOIFI_DEBT_THRESHOLD} 
                    isDanger={result.ratios.debtRatio > AAOIFI_DEBT_THRESHOLD} 
                  />

                  {/* Interest Income Ratio */}
                  <RatioBar 
                    label="Prohibited Interest Income / Total Revenue" 
                    value={result.ratios.interestIncomeRatio} 
                    threshold={AAOIFI_INTEREST_THRESHOLD} 
                    isDanger={result.ratios.interestIncomeRatio > AAOIFI_INTEREST_THRESHOLD} 
                    multiplier={INTEREST_RATIO_VISUAL_MULTIPLIER}
                  />

                  {/* Cash Ratio */}
                  <RatioBar 
                    label="Liquid Cash & Receivables / Total Assets" 
                    value={result.ratios.cashRatio} 
                    threshold={AAOIFI_CASH_THRESHOLD} 
                    isDanger={result.ratios.cashRatio > AAOIFI_CASH_THRESHOLD} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {result && !result.success && (
        <div style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', background: 'rgba(225, 29, 72, 0.1)', color: 'var(--danger)', textAlign: 'center', fontWeight: '500' }}>
          {result.message}
        </div>
      )}
    </div>
  );
}

function RatioBar({ label, value, threshold, isDanger, multiplier = 1 }) {
  // Visual width calculation (cap at 100%)
  const visualPercentage = Math.min(value * multiplier, 100);
  const color = isDanger ? 'var(--danger)' : 'var(--success)';

  return (
    <div style={{ padding: '16px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{label}</span>
        <span style={{ fontWeight: '700', color: color, fontSize: '14px' }}>
          {value}% <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500' }}>(Limit &le; {threshold}%)</span>
        </span>
      </div>
      
      {/* Container Track */}
      <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
        {/* Threshold Marker */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${threshold * multiplier}%`, width: '2px', background: 'var(--text-muted)', zIndex: 2 }}></div>
        
        {/* Fill Bar */}
        <div style={{ 
          height: '100%', 
          width: '0%', // Start at 0 for animation
          background: `linear-gradient(90deg, ${color}80, ${color})`, 
          borderRadius: '4px',
          animation: `fillBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          animationDelay: '0.1s'
        }} />
      </div>
      
      {/* Inline styles for Keyframes */}
      <style>{`
        @keyframes fillBar {
          to { width: ${visualPercentage}%; }
        }
      `}</style>
    </div>
  );
}
