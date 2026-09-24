export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  bio: string;
  avatarUrl: string;
  location: string;
  companyName: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  role: string;
  memberSince: string;
  lastActive: string;
  status: 'Active' | 'Away' | 'Inactive';
}

export interface UserPreferencesData {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12 Hour' | '24 Hour';
  defaultLandingPage: string;
  defaultCurrency: string;
}

export interface UserSecurityData {
  twoFactorEnabled: boolean;
  twoFactorType: 'Authenticator App' | 'SMS';
  lastPasswordChange: string;
}

export interface ActivityLogItem {
  id: string;
  activity: string;
  locationIp: string;
  device: string;
  time: string;
  type: 'login' | 'password' | '2fa' | 'profile' | 'key';
}

export interface ConnectedAccountItem {
  id: string;
  provider: 'Google' | 'Microsoft' | 'Slack' | 'GitHub';
  emailOrUsername: string;
  status: 'Connected' | 'Disconnected';
  connectedAt: string;
}
