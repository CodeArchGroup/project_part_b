export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

export const GOAL_STATUS_COLORS = {
  [GOAL_STATUS.ACTIVE]: 'var(--primary-color)',
  [GOAL_STATUS.COMPLETED]: 'var(--success)',
  [GOAL_STATUS.PAUSED]: '#F59E0B'
};

export const getGoalStatusColor = (status) => GOAL_STATUS_COLORS[status] || GOAL_STATUS_COLORS[GOAL_STATUS.ACTIVE];
