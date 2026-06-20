import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    goalId: '',
    goalType: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    status: 'active'
  });
  const [statusMsg, setStatusMsg] = useState(null);

  const API_URL = 'http://localhost:8080/api/goals';

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchGoals();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (goal) => {
    setFormData({
      goalId: goal.goal_id,
      goalType: goal.goal_type || '',
      targetAmount: goal.target_amount || '',
      currentAmount: goal.current_amount || '0',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      status: goal.status || 'active'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this financial goal?')) return;
    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(`${API_URL}/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Goal deleted successfully!' });
        fetchGoals();
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      console.error('Delete goal failed:', err);
      setStatusMsg({ type: 'error', text: 'Server connection error.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: 'loading', text: 'Saving...' });

    try {
      const token = localStorage.getItem('itqan_token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: formData.goalId ? 'Goal updated successfully!' : 'Goal created successfully!' });
        setFormData({
          goalId: '',
          goalType: '',
          targetAmount: '',
          currentAmount: '0',
          deadline: '',
          status: 'active'
        });
        fetchGoals();
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      console.error('Save goal failed:', err);
      setStatusMsg({ type: 'error', text: 'Server connection error.' });
    }
  };

  const calculateProgress = (current, target) => {
    const curr = Number(current || 0);
    const tar = Number(target || 1);
    const percentage = Math.min(Math.round((curr / tar) * 100), 100);
    return percentage;
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'completed') return 'var(--success)';
    if (status === 'paused') return '#F59E0B';
    return 'var(--primary-color)';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'authFadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '40px', background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.1) 0%, rgba(14, 116, 144, 0) 100%)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', background: 'linear-gradient(90deg, var(--primary-color), #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Shariah Financial Goals
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
          Set, track, and achieve your financial aspirations in complete alignment with Islamic principles. Whether it's saving for Hajj, buying a Halal home, or building your emergency fund.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Goal Form */}
        <div className="glass-panel" style={{ position: 'sticky', top: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '24px', background: 'var(--primary-color)', borderRadius: '4px' }}></span>
            {formData.goalId ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Goal Title</label>
              <input 
                type="text" 
                name="goalType" 
                value={formData.goalType} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="e.g. Hajj Fund 2026" 
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
                required 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Target ($)</label>
                <input 
                  type="number" 
                  name="targetAmount" 
                  value={formData.targetAmount} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="0.00" 
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Current ($)</label>
                <input 
                  type="number" 
                  name="currentAmount" 
                  value={formData.currentAmount} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="0.00" 
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Target Deadline</label>
              <input 
                type="date" 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange} 
                className="input-field" 
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
              />
            </div>

            {formData.goalId && (
              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Goal Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="input-field"
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <option value="active">🟢 Active</option>
                  <option value="completed">✨ Completed</option>
                  <option value="paused">⏸️ Paused</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '16px', fontSize: '16px', fontWeight: '600', borderRadius: '12px' }}>
                {formData.goalId ? 'Update Goal' : 'Save Goal'}
              </button>
              {formData.goalId && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '16px', borderRadius: '12px' }}
                  onClick={() => setFormData({ goalId: '', goalType: '', targetAmount: '', currentAmount: '0', deadline: '', status: 'active' })}
                >
                  Cancel
                </button>
              )}
            </div>

            {statusMsg && (
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                borderRadius: '12px', 
                background: statusMsg.type === 'error' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                color: statusMsg.type === 'error' ? 'var(--danger)' : 'var(--success)', 
                textAlign: 'center', 
                fontSize: '14px',
                fontWeight: '500',
                animation: 'authFadeIn 0.3s ease-out'
              }}>
                {statusMsg.text}
              </div>
            )}
          </form>
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div className="auth-spinner-large" style={{ borderTopColor: 'var(--primary-color)' }} />
            </div>
          ) : goals.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'rgba(14, 116, 144, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎯</div>
              <h3 style={{ fontSize: '20px' }}>No Goals Set Yet</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Start your journey to financial freedom by adding your first Shariah-compliant goal using the form.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const isCompleted = progress >= 100 || goal.status === 'completed';
              const badgeColor = getStatusBadgeColor(goal.status);
              
              return (
                <div key={goal.goal_id} className="glass-panel" style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}
                >
                  {/* Accent Line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: badgeColor }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {goal.goal_type}
                        {isCompleted && <span style={{ fontSize: '16px' }}>✨</span>}
                      </h3>
                      {goal.deadline && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          Target Date: <strong style={{ color: 'var(--text-main)' }}>{new Date(goal.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                        </div>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      textTransform: 'uppercase', 
                      fontWeight: '700', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      background: `${badgeColor}15`, 
                      color: badgeColor,
                      letterSpacing: '0.5px'
                    }}>
                      {goal.status}
                    </span>
                  </div>

                  <div style={{ margin: '32px 0 24px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Progress</span>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: badgeColor, lineHeight: '1' }}>
                          {progress}%
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Saved</span>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                          ${Number(goal.current_amount).toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>/ ${Number(goal.target_amount).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Premium Progress Bar */}
                    <div style={{ height: '12px', background: 'var(--background)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${progress}%`, 
                        background: `linear-gradient(90deg, ${badgeColor}, ${isCompleted ? '#34D399' : '#38BDF8'})`, 
                        borderRadius: '6px',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                      }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)', animation: 'shimmer 2s infinite' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingLeft: '12px', paddingTop: '16px', borderTop: '1px dashed var(--glass-border)' }}>
                    <button 
                      onClick={() => handleEdit(goal)} 
                      className="btn" 
                      style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.goal_id)} 
                      className="btn" 
                      style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.1)', color: 'var(--danger)', borderRadius: '8px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
