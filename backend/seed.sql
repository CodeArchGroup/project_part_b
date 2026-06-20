-- ============================================
-- ITQAN Seed Data
-- ============================================

-- Shariah Rules (knowledge base for compliance checker)
INSERT INTO shariah_rules (rule_id, category, description, source_reference) VALUES
  ('rule-001', 'prohibited-sector', 'Alcohol production, distribution, and sales are strictly prohibited (haram) in Islam.', 'Quran 5:90-91'),
  ('rule-002', 'prohibited-sector', 'Gambling (maysir) and games of chance are prohibited.', 'Quran 5:90-91'),
  ('rule-003', 'prohibited-sector', 'Pork and pork-related products are prohibited.', 'Quran 2:173'),
  ('rule-004', 'prohibited-sector', 'Conventional banking and interest-based lending (riba) are prohibited.', 'Quran 2:275-279'),
  ('rule-005', 'prohibited-sector', 'Weapons manufacturing and arms trade are prohibited.', 'Islamic Jurisprudence - Harm Prevention'),
  ('rule-006', 'prohibited-sector', 'Tobacco production and distribution are prohibited or discouraged.', 'Islamic Jurisprudence - Harm to Body'),
  ('rule-007', 'prohibited-sector', 'Adult entertainment and pornography are strictly prohibited.', 'Islamic Jurisprudence - Morality'),
  ('rule-008', 'doubtful-sector', 'Entertainment and media industries may involve mixed revenues requiring detailed screening.', 'AAOIFI Shariah Standard No. 21'),
  ('rule-009', 'doubtful-sector', 'Hotels and hospitality may derive revenue from prohibited activities (alcohol service).', 'AAOIFI Shariah Standard No. 21'),
  ('rule-010', 'financial-ratio', 'Total debt to total assets ratio must not exceed 33%.', 'AAOIFI Shariah Standard No. 21'),
  ('rule-011', 'financial-ratio', 'Interest-bearing income must not exceed 5% of total revenue.', 'AAOIFI Shariah Standard No. 21'),
  ('rule-012', 'financial-ratio', 'Cash and receivables should not exceed 50% of total assets for asset-backed securities.', 'AAOIFI Shariah Standard No. 21'),
  ('rule-013', 'zakat', 'Zakat on wealth (Zakat al-Mal) is 2.5% of qualifying net wealth held for one lunar year above Nisab.', 'Quran 9:103, Hadith'),
  ('rule-014', 'zakat', 'Nisab threshold is equivalent to 85 grams of gold or 595 grams of silver.', 'Hadith - Sahih Bukhari'),
  ('rule-015', 'investment', 'Sukuk (Islamic bonds) represent ownership in underlying assets and are Shariah-compliant alternatives to conventional bonds.', 'AAOIFI Shariah Standard No. 17')
ON CONFLICT (rule_id) DO NOTHING;

-- Default admin account
INSERT INTO admins (admin_id, name, email, role) VALUES
  ('admin-001', 'System Administrator', 'admin@itqan.app', 'Super Admin')
ON CONFLICT (admin_id) DO NOTHING;
