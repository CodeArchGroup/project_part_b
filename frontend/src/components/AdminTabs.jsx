const ADMIN_TABS = ['users', 'rules', 'logs'];

const TAB_LABELS = {
  users: 'Access Control',
  rules: 'Compliance Engine',
  logs: 'Audit Logs'
};

const TAB_ICONS = {
  users: 'Users',
  rules: 'Rules',
  logs: 'Logs'
};

export default function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="admin-tabs">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          <span className="admin-tab-icon">{TAB_ICONS[tab]}</span>
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
