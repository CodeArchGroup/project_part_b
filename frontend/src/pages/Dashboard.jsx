import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [goals, setGoals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('itqan_token');
        
        // Fetch profile
        const profileRes = await fetch(`http://localhost:8080/api/profile/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.data);
        }

        // Fetch goals
        const goalsRes = await fetch(`http://localhost:8080/api/goals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const goalsData = await goalsRes.json();
        if (goalsData.success) {
          setGoals(goalsData.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) fetchData();
  }, [user]);

  const getGoalsProgressText = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length === 0) return { percent: '0%', text: 'No active goals' };
    
    let totalProgress = 0;
    activeGoals.forEach(g => {
      const current = Number(g.current_amount || 0);
      const target = Number(g.target_amount || 1);
      totalProgress += Math.min((current / target) * 100, 100);
    });
    
    const avg = Math.round(totalProgress / activeGoals.length);
    return {
      percent: `${avg}%`,
      text: `${activeGoals[0].goal_type}${activeGoals.length > 1 ? ` + ${activeGoals.length - 1} more` : ''}`
    };
  };

  const goalsInfo = getGoalsProgressText();

  const accountData = {
    labels: ['Savings', 'Assets', 'Liabilities'],
    datasets: [
      {
        data: profile 
          ? [Number(profile.savings), Number(profile.assets), Number(profile.liabilities)]
          : [0, 0, 0],
        backgroundColor: ['#10B981', '#0E7490', '#E11D48'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#64748B' } } }
  };

  const incomeVsExpense = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 5200, 5100, 5800, 6000, 6200],
        backgroundColor: '#0E7490',
      },
      {
        label: 'Expenses',
        data: [2000, 2100, 1900, 2400, 2100, 2300],
        backgroundColor: '#E11D48',
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Financial Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here is a summary of your Shariah-compliant profile.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Top KPI Cards */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Wealth</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>
            ${profile ? (Number(profile.assets) + Number(profile.savings) - Number(profile.liabilities)).toLocaleString() : '0'}
          </div>
          <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '4px' }}>Real-time balance</div>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Income</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>
            ${profile ? Number(profile.income).toLocaleString() : '0'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Monthly average</div>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid #F59E0B' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>AI Goal Progress</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>{goalsInfo.percent}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{goalsInfo.text}</div>
        </div>
      </div>

      {/* Charts System */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Asset Distribution</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Doughnut data={accountData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Monthly Overview</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={incomeVsExpense} options={{...chartOptions, plugins: { legend: { position: 'top', labels: { color: '#64748B' } } }}} />
          </div>
        </div>
      </div>

    </div>
  );
}
