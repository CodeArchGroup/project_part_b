export const AAOIFI_DEBT_THRESHOLD = 33;
export const AAOIFI_INTEREST_THRESHOLD = 5;
export const AAOIFI_CASH_THRESHOLD = 50;
export const INTEREST_RATIO_VISUAL_MULTIPLIER = 10;

export const COMPLIANCE_STATUS_COLORS = {
  Compliant: 'var(--success)',
  'Non-Compliant': 'var(--danger)',
  Doubtful: '#F59E0B'
};

export const getComplianceStatusColor = (status) =>
  COMPLIANCE_STATUS_COLORS[status] || 'var(--text-main)';
