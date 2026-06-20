const db = require('../db');
const { DEFAULT_AUDIT_LOG_LIMIT } = require('../constants/shariah.constants');

const logAction = async (userId, actionType, details) => {
  if (!userId) return;

  await db.query(
    `INSERT INTO system_logs (user_id, action_type, details)
     VALUES ($1, $2, $3)`,
    [userId, actionType, details]
  );
};

const getAuditLogs = async (limit = DEFAULT_AUDIT_LOG_LIMIT) => {
  const result = await db.query(
    `SELECT sl.log_id, sl.user_id, sl.action_type, sl.timestamp, sl.details, u.email AS user_email
     FROM system_logs sl
     LEFT JOIN users u ON u.user_id = sl.user_id
     ORDER BY sl.timestamp DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

const logRoleChange = (adminUserId, targetUserId, role) =>
  logAction(adminUserId, 'updateUserRole', `Updated user ${targetUserId} role to ${role}`);

const logRuleCreate = (adminUserId, ruleId, category) =>
  logAction(adminUserId, 'createRule', `Created ${category} rule ${ruleId}`);

const logRuleUpdate = (adminUserId, ruleId, category) =>
  logAction(adminUserId, 'updateRule', `Updated ${category} rule ${ruleId}`);

const logRuleDelete = (adminUserId, ruleId) =>
  logAction(adminUserId, 'deleteRule', `Deleted rule ${ruleId}`);

module.exports = {
  logAction,
  getAuditLogs,
  logRoleChange,
  logRuleCreate,
  logRuleUpdate,
  logRuleDelete
};
