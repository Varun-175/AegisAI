import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserProfile } from '../src/types.js';

interface StoredAccount {
  uid: string;
  email: string;
  displayName: string;
  salt: string;
  hash: string;
  createdAt: string;
  authProvider: 'password' | 'google';
}

const ACCOUNTS_FILE = path.join(process.cwd(), 'data', 'accounts.json');

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadAccounts(): Record<string, StoredAccount> {
  try {
    ensureDir(ACCOUNTS_FILE);
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[AccountStore] Error loading accounts:', err);
  }

  // Clean slate for authentic accounts
  const initialAccounts: Record<string, StoredAccount> = {};
  saveAccounts(initialAccounts);
  return initialAccounts;
}

function saveAccounts(accounts: Record<string, StoredAccount>) {
  try {
    ensureDir(ACCOUNTS_FILE);
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AccountStore] Error saving accounts:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function registerAccount(
  email: string,
  password: string,
  displayName?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const sanitizedEmail = email.toLowerCase().trim();
  if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const accounts = loadAccounts();
  if (accounts[sanitizedEmail]) {
    return { success: false, error: 'An account with this email already exists. Please sign in with your password.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const uid = `usr_${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const userProfile: UserProfile = {
    uid,
    email: sanitizedEmail,
    displayName: displayName?.trim() || sanitizedEmail.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
    createdAt: new Date().toISOString(),
    authProvider: 'password',
  };

  accounts[sanitizedEmail] = {
    uid,
    email: sanitizedEmail,
    displayName: userProfile.displayName,
    salt,
    hash,
    createdAt: userProfile.createdAt,
    authProvider: 'password',
  };

  saveAccounts(accounts);
  return { success: true, user: userProfile };
}

export function verifyAccountPassword(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const sanitizedEmail = email.toLowerCase().trim();
  if (!sanitizedEmail) {
    return { success: false, error: 'Email is required.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required to sign in.' };
  }

  const accounts = loadAccounts();
  const account = accounts[sanitizedEmail];

  if (!account) {
    return { success: false, error: 'No account found for this email. Please register to create your vault.' };
  }

  const hash = hashPassword(password, account.salt);
  if (hash !== account.hash) {
    return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
  }

  const userProfile: UserProfile = {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${account.uid}`,
    createdAt: account.createdAt,
    authProvider: 'password',
  };

  return { success: true, user: userProfile };
}
