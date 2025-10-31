-- Insert admin user for testing
-- Note: In production, passwords should be properly hashed with bcrypt
INSERT INTO users (email, name, password, role, is_active)
VALUES (
  'gundluru.mahammadwahab@nxtwave.co.in',
  'Mahammad Wahab',
  'NxtWave@123',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;