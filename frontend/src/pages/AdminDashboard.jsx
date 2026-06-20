import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [ruleForm, setRuleForm] = useState({
    ruleId: '',
    category: 'prohibited-sector',
    description: '',
    sourceReference: ''
  });

  const [statusMsg, setStatusMsg] = useState(null);
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    if (user && user.userType !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('itqan_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, logsRes, rulesRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/logs`, { headers }),
        fetch(`${API_URL}/shariah/rules`, { headers })
      ]);

      const [usersData, logsData, rulesData] = await Promise.all([
        usersRes.json(), logsRes.json(), rulesRes.json()
      ]);

      if (usersData.success) setUsers(usersData.data);
      if (logsData.success) setLogs(logsData.data);
      if (rulesData.success) setRules(rulesData.data);

    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid && user.userType === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`WARNING: Are you sure you want to change this user's security clearance to ${newRole.toUpperCase()}?`)) return;

    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(`${API_URL}/admin/users/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Security clearance updated successfully!' });
        fetchAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error updating role.' });
    }
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: 'loading', text: 'Deploying rule to engine...' });

    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(`${API_URL}/admin/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(ruleForm)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: ruleForm.ruleId ? 'Compliance rule updated!' : 'New compliance rule deployed!' });
        setRuleForm({ ruleId: '', category: 'prohibited-sector', description: '', sourceReference: '' });
        fetchAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error saving rule.' });
    }
  };

  const handleRuleDelete = async (ruleId) => {
    if (!window.confirm('CRITICAL ACTION: Terminate this compliance rule permanently?')) return;
    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(`${API_URL}/admin/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Rule terminated.' });
        fetchAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error deleting rule.' });
    }
  };

  if (!user || user.userType !== 'Admin') {
    return <div className="auth-loading-screen"><div className="auth-spinner-large" /></div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'authFadeIn 0.5s ease-out' }}>
      
      {/* Header section */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px',
        padding: '32px', background: 'linear-gradient(135deg, #0F172A 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ padding: '4px 8px', background: 'rgba(225, 29, 72, 0.2)', color: '#FDA4AF', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '4px', letterSpacing: '1px' }}>System Admin</span>
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>ITQAN Control Center</span>
          </div>
          <h1 style={{ fontSize: '32px', color: '#F8FAFC' }}>Command Dashboard</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>System Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 'bold' }}>
            <div style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', boxShadow: '0 0 10px #34D399' }}></div>
            All Systems Operational
          </div>
        </div>
      </div>

      {statusMsg && (
        <div style={{ 
          marginBottom: '24px', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: '600',
          background: statusMsg.type === 'error' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
          color: statusMsg.type === 'error' ? 'var(--danger)' : 'var(--success)', 
          border: `1px solid ${statusMsg.type === 'error' ? 'var(--danger)' : 'var(--success)'}40`
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '2px solid var(--glass-border)', paddingBottom: '0' }}>
        {['users', 'rules', 'logs'].map(tab => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setStatusMsg(null); }}
            style={{ 
              padding: '16px 24px', 
              background: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-muted)',
              fontSize: '15px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            {tab === 'users' ? '👥 Access Control' : tab === 'rules' ? '⚖️ Compliance Engine' : '📡 Audit Logs'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="auth-spinner-large" style={{ borderTopColor: 'var(--primary-color)' }} />
        </div>
      ) : (
        <div style={{ animation: 'authFadeIn 0.3s ease-out' }}>
          
          {/* USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <tr>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Identity</th>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</th>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Clearance</th>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Registration</th>
                    <th style={{ padding: '20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id} style={{ borderTop: '1px solid var(--glass-border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '20px', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '20px', letterSpacing: '0.5px', textTransform: 'uppercase',
                          background: u.user_type === 'Admin' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(14, 116, 144, 0.1)', 
                          color: u.user_type === 'Admin' ? 'var(--danger)' : 'var(--primary-color)'
                        }}>
                          {u.user_type}
                        </span>
                      </td>
                      <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>{new Date(u.created_date).toLocaleDateString()}</td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRoleChange(u.user_id, u.user_type)} 
                          style={{ 
                            padding: '8px 16px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                            background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                            opacity: u.user_id === user.uid ? 0.5 : 1
                          }}
                          disabled={u.user_id === user.uid}
                        >
                          Toggle Clearance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RULES ENGINE */}
          {activeTab === 'rules' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }}>
              <div className="glass-panel" style={{ position: 'sticky', top: '40px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>{ruleForm.ruleId ? 'Override Rule' : 'Deploy New Rule'}</h2>
                <form onSubmit={handleRuleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Algorithmic Category</label>
                    <select name="category" value={ruleForm.category} onChange={(e) => setRuleForm({...ruleForm, category: e.target.value})} className="input-field" style={{ fontSize: '15px', padding: '14px', borderRadius: '12px' }}>
                      <option value="prohibited-sector">🚫 Prohibited Sector</option>
                      <option value="doubtful-sector">⚠️ Doubtful Sector</option>
                      <option value="financial-ratio">📊 Financial Ratio Limit</option>
                      <option value="zakat">🤲 Zakat Parameter</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Rule Directives / Clause</label>
                    <textarea name="description" value={ruleForm.description} onChange={(e) => setRuleForm({...ruleForm, description: e.target.value})} className="input-field" style={{ minHeight: '120px', padding: '14px', borderRadius: '12px', resize: 'vertical' }} placeholder="Define the strict parameters..." required />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Shariah Source Code (Citation)</label>
                    <input type="text" name="sourceReference" value={ruleForm.sourceReference} onChange={(e) => setRuleForm({...ruleForm, sourceReference: e.target.value})} className="input-field" style={{ fontSize: '15px', padding: '14px', borderRadius: '12px' }} placeholder="e.g. AAOIFI Std 21" />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600', borderRadius: '12px' }}>
                      {ruleForm.ruleId ? 'Execute Update' : 'Deploy Rule'}
                    </button>
                    {ruleForm.ruleId && (
                      <button type="button" className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '16px', borderRadius: '12px' }} onClick={() => setRuleForm({ ruleId: '', category: 'prohibited-sector', description: '', sourceReference: '' })}>
                        Abort
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rules.map(rule => (
                  <div key={rule.rule_id} className="glass-panel" style={{ padding: '24px', borderLeft: `4px solid ${rule.category.includes('prohibited') ? 'var(--danger)' : rule.category.includes('doubtful') ? '#F59E0B' : 'var(--primary-color)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                        {rule.category.replace('-', ' ')}
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setRuleForm({ ruleId: rule.rule_id, category: rule.category, description: rule.description, sourceReference: rule.source_reference || '' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => handleRuleDelete(rule.rule_id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Term</button>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '12px' }}>{rule.description}</p>
                    {rule.source_reference && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700' }}>CITED:</span> {rule.source_reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="glass-panel" style={{ padding: '0', background: '#0F172A', border: '1px solid #1E293B', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Terminal Output Feed</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
                </div>
              </div>
              <div style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto', fontFamily: '"Fira Code", monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logs.map(log => (
                  <div key={log.log_id} style={{ color: '#E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '16px', lineHeight: '1.5' }}>
                    <div style={{ color: '#64748B', whiteSpace: 'nowrap' }}>[{new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}]</div>
                    <div style={{ color: '#38BDF8', width: '140px', flexShrink: 0, fontWeight: 'bold' }}>{log.action_type}</div>
                    <div style={{ flex: 1 }}>{log.details}</div>
                    <div style={{ color: '#94A3B8', fontSize: '11px', whiteSpace: 'nowrap' }}>{log.user_email || 'System'}</div>
                  </div>
                ))}
                {logs.length === 0 && <div style={{ color: '#64748B' }}>&gt; Waiting for system events...</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
