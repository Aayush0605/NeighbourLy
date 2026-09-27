import { UserProfile, LocationPoint } from '../types';
import { DEFAULT_LOCATION } from './location';

const AUTH_USER_KEY = 'neighborly_auth_user';
const USERS_DB_KEY = 'neighborly_users_db';

export interface StoredUserAccount {
  id: string;
  userId: string;
  email: string;
  name: string;
  passwordHash: string; // simulated hash
  avatar: string;
  location: LocationPoint;
  authProvider: 'google' | 'password';
  verified: boolean;
  tasksCompleted: number;
  rating: number;
  reviewCount: number;
  bio: string;
  skills: string[];
  joinedDate: string;
}

// Get initial auth user from localStorage or null
export function getSavedAuthUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading auth user from storage', e);
  }
  return null;
}

export function saveAuthUser(user: UserProfile | null) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
  } else {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

function getUsersDb(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users db', e);
  }
  return [];
}

function saveUsersDb(users: StoredUserAccount[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

/**
 * Sign In with Google
 */
export async function loginWithGoogle(
  email: string = 'aayushgupta0605@gmail.com',
  name: string = 'Aayush Gupta',
  avatar?: string,
  location?: LocationPoint
): Promise<UserProfile> {
  const users = getUsersDb();
  let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const userLocation = location || DEFAULT_LOCATION;
  const userAvatar =
    avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  if (!existing) {
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    existing = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: username,
      email,
      name,
      passwordHash: 'google_oauth_managed',
      avatar: userAvatar,
      location: userLocation,
      authProvider: 'google',
      verified: true,
      tasksCompleted: 0,
      rating: 5.0,
      reviewCount: 0,
      bio: 'NeighborLy community member · Active in local neighborhood',
      skills: ['Community Helper'],
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    users.push(existing);
    saveUsersDb(users);
  }

  const profile: UserProfile = {
    id: existing.id,
    userId: existing.userId,
    email: existing.email,
    name: existing.name,
    avatar: existing.avatar,
    location: existing.location,
    rating: existing.rating,
    reviewCount: existing.reviewCount,
    tasksCompleted: existing.tasksCompleted,
    onTimePercent: 100,
    followersCount: 0,
    skills: existing.skills,
    verified: existing.verified,
    verificationMethod: 'google_oauth',
    isOnline: true,
    bio: existing.bio,
    joinedDate: existing.joinedDate,
    authProvider: 'google',
  };

  saveAuthUser(profile);
  return profile;
}

/**
 * Sign In with Email OR User ID and Password
 */
export async function loginWithCredentials(
  identifier: string, // email or username
  password: string
): Promise<UserProfile> {
  const cleanId = identifier.trim().toLowerCase();
  const users = getUsersDb();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.userId.toLowerCase() === cleanId
  );

  if (!found) {
    throw new Error('No account found with this Email or User ID.');
  }

  if (found.passwordHash !== password && found.authProvider !== 'google') {
    throw new Error('Incorrect password. Please try again or reset your password.');
  }

  const profile: UserProfile = {
    id: found.id,
    userId: found.userId,
    email: found.email,
    name: found.name,
    avatar: found.avatar,
    location: found.location,
    rating: found.rating,
    reviewCount: found.reviewCount,
    tasksCompleted: found.tasksCompleted,
    onTimePercent: 100,
    followersCount: 0,
    skills: found.skills,
    verified: found.verified,
    verificationMethod: found.authProvider === 'google' ? 'google_oauth' : 'email',
    isOnline: true,
    bio: found.bio,
    joinedDate: found.joinedDate,
    authProvider: found.authProvider,
  };

  saveAuthUser(profile);
  return profile;
}

/**
 * Register a new user
 */
export async function registerWithCredentials(params: {
  name: string;
  userId: string;
  email: string;
  password: string;
  location?: LocationPoint;
}): Promise<UserProfile> {
  const users = getUsersDb();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUserId = params.userId.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');

  if (!cleanUserId || cleanUserId.length < 3) {
    throw new Error('User ID must be at least 3 characters (letters, numbers, underscores).');
  }

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  if (users.some((u) => u.userId.toLowerCase() === cleanUserId)) {
    throw new Error('This User ID is already taken. Please pick another one.');
  }

  const newUser: StoredUserAccount = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: cleanUserId,
    email: cleanEmail,
    name: params.name.trim(),
    passwordHash: params.password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(params.name)}`,
    location: params.location || DEFAULT_LOCATION,
    authProvider: 'password',
    verified: true,
    tasksCompleted: 0,
    rating: 5.0,
    reviewCount: 0,
    bio: 'Local neighbor offering skills and community help.',
    skills: ['Local Tasks'],
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  };

  users.push(newUser);
  saveUsersDb(users);

  const profile: UserProfile = {
    id: newUser.id,
    userId: newUser.userId,
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatar,
    location: newUser.location,
    rating: newUser.rating,
    reviewCount: newUser.reviewCount,
    tasksCompleted: newUser.tasksCompleted,
    onTimePercent: 100,
    followersCount: 0,
    skills: newUser.skills,
    verified: newUser.verified,
    verificationMethod: 'email',
    isOnline: true,
    bio: newUser.bio,
    joinedDate: newUser.joinedDate,
    authProvider: 'password',
  };

  saveAuthUser(profile);
  return profile;
}

/**
 * Reset password for email or User ID
 */
export async function resetUserPassword(
  identifier: string,
  newPassword: string
): Promise<void> {
  const users = getUsersDb();
  const cleanId = identifier.trim().toLowerCase();

  const foundIndex = users.findIndex(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.userId.toLowerCase() === cleanId
  );

  if (foundIndex === -1) {
    throw new Error('No account found for this Email or User ID.');
  }

  users[foundIndex].passwordHash = newPassword;
  saveUsersDb(users);
}
