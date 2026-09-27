export interface AdminSession {
  adminId: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'Escrow Officer' | 'Community Moderator';
  token: string;
  loginTime: string;
}

interface StoredAdminCredentials {
  username: string;
  email: string;
  passwordHash: string;
}

const ADMIN_SESSION_KEY = 'neighborly_admin_session';
const ADMIN_CREDENTIALS_KEY = 'neighborly_admin_credentials';

const DEFAULT_ADMIN_CREDENTIALS: StoredAdminCredentials = {
  username: 'admin',
  email: 'admin@neighborly.in',
  passwordHash: 'admin', // separate admin credential
};

export function getAdminCredentials(): StoredAdminCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading admin credentials', e);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(creds: StoredAdminCredentials) {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      return session;
    }
  } catch (e) {
    console.error('Error reading admin session', e);
  }
  return null;
}

export function loginAdmin(identifier: string, password: string): AdminSession {
  const cleanId = identifier.trim().toLowerCase();
  const creds = getAdminCredentials();

  const isUserMatch = creds.username.toLowerCase() === cleanId || creds.email.toLowerCase() === cleanId;
  const isPassMatch = creds.passwordHash === password;

  if (!isUserMatch || !isPassMatch) {
    throw new Error('Invalid Admin credentials. Access denied to restricted Command Center.');
  }

  const session: AdminSession = {
    adminId: 'admin_master_01',
    username: creds.username,
    email: creds.email,
    role: 'Super Admin',
    token: `adm_token_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function updateAdminPassword(oldPassword: string, newPassword: string): void {
  const creds = getAdminCredentials();
  if (creds.passwordHash !== oldPassword) {
    throw new Error('Current master password does not match.');
  }
  if (!newPassword || newPassword.length < 5) {
    throw new Error('New password must be at least 5 characters long.');
  }

  creds.passwordHash = newPassword;
  saveAdminCredentials(creds);
}
