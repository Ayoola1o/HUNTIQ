import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { ProfileNav, type ProfileNavSection } from './ProfileNav';
import { PersonalInformationCard } from './PersonalInformationCard';
import { PreferencesCard } from './PreferencesCard';
import { SecurityCard } from './SecurityCard';
import { RecentActivityCard } from './RecentActivityCard';
import { ProfilePreviewCard } from './ProfilePreviewCard';
import { AccountSummaryCard } from './AccountSummaryCard';
import { ConnectedAccountsCard } from './ConnectedAccountsCard';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Manage2faModal } from './Manage2faModal';
import { AvatarUploadModal } from './AvatarUploadModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { 
  UserProfileData, 
  UserPreferencesData, 
  UserSecurityData, 
  ActivityLogItem, 
  ConnectedAccountItem 
} from '../../types/profile';
import { 
  Search, 
  Sparkles, 
  Bell, 
  Check 
} from 'lucide-react';

import { NotificationsTab } from './tabs/NotificationsTab';
import { SessionsTab } from './tabs/SessionsTab';
import { ApiKeysTab } from './tabs/ApiKeysTab';
import { EmailSettingsTab } from './tabs/EmailSettingsTab';

interface ProfilePageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [activeSection, setActiveSection] = useState<ProfileNavSection>('profile');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Data State
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: 'usr-1',
    firstName: 'Ayoola',
    lastName: 'Ade',
    email: 'ayoola.ade@huntiq.com',
    phone: '+234 801 234 5678',
    jobTitle: 'Growth & Strategy Lead',
    department: 'Growth',
    bio: 'Growth strategist and revenue leader passionate about helping teams find and win the right opportunities.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Lagos, Nigeria',
    companyName: 'HUNTIQ',
    linkedinUrl: 'https://linkedin.com/in/ayoola-ade',
    twitterUrl: 'https://twitter.com/ayoola_growth',
    websiteUrl: 'https://huntiq.ai',
    role: 'Workspace Owner',
    memberSince: 'May 12, 2026',
    lastActive: 'Today, 10:42 AM',
    status: 'Active'
  });

  // User Preferences State
  const [preferencesData, setPreferencesData] = useState<UserPreferencesData>({
    language: 'English',
    timezone: '(GMT+01:00) Lagos, Nigeria',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '24 Hour',
    defaultLandingPage: 'Dashboard',
    defaultCurrency: 'USD - US Dollar'
  });

  // Security State
  const [securityData, setSecurityData] = useState<UserSecurityData>({
    twoFactorEnabled: true,
    twoFactorType: 'Authenticator App',
    lastPasswordChange: 'Aug 20, 2026'
  });

  // Recent Activity Items
  const [activities] = useState<ActivityLogItem[]>([
    {
      id: 'act-1',
      activity: 'Logged in successfully',
      locationIp: 'Lagos, Nigeria 197.210.45.12',
      device: 'Chrome on macOS',
      time: 'Today, 10:42 AM',
      type: 'login'
    },
    {
      id: 'act-2',
      activity: 'Password changed',
      locationIp: 'Lagos, Nigeria 197.210.45.12',
      device: 'Safari on macOS',
      time: 'Aug 20, 2026, 08:15 PM',
      type: 'password'
    },
    {
      id: 'act-3',
      activity: 'Two-factor authentication enabled',
      locationIp: 'Lagos, Nigeria 197.210.45.12',
      device: 'Chrome on macOS',
      time: 'Aug 18, 2026, 04:31 PM',
      type: '2fa'
    }
  ]);

  // Connected Accounts
  const [connectedAccounts] = useState<ConnectedAccountItem[]>([
    {
      id: 'conn-1',
      provider: 'Google',
      emailOrUsername: 'ayoola.ade@gmail.com',
      status: 'Connected',
      connectedAt: 'May 12, 2026'
    },
    {
      id: 'conn-2',
      provider: 'Microsoft',
      emailOrUsername: 'ayoola.ade@huntiq.com',
      status: 'Connected',
      connectedAt: 'May 14, 2026'
    },
    {
      id: 'conn-3',
      provider: 'Slack',
      emailOrUsername: 'ayoola.ade',
      status: 'Connected',
      connectedAt: 'June 01, 2026'
    }
  ]);

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleDiscard = () => {
    setProfileData({
      id: 'usr-1',
      firstName: 'Ayoola',
      lastName: 'Ade',
      email: 'ayoola.ade@huntiq.com',
      phone: '+234 801 234 5678',
      jobTitle: 'Growth & Strategy Lead',
      department: 'Growth',
      bio: 'Growth strategist and revenue leader passionate about helping teams find and win the right opportunities.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: 'Lagos, Nigeria',
      companyName: 'HUNTIQ',
      linkedinUrl: 'https://linkedin.com/in/ayoola-ade',
      twitterUrl: 'https://twitter.com/ayoola_growth',
      websiteUrl: 'https://huntiq.ai',
      role: 'Workspace Owner',
      memberSince: 'May 12, 2026',
      lastActive: 'Today, 10:42 AM',
      status: 'Active'
    });
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f8fafc',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Left Global Dark Navigation Sidebar */}
      <DashboardSidebar
        activeNav="settings"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0
        }}>
          {/* Left Title */}
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Profile
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Manage your personal information, preferences and account security.
            </p>
          </div>

          {/* Right Header Actions & Profile Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search input with ⌘K */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '240px'
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search companies, contacts, signals..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              <kbd style={{
                fontSize: '10px',
                color: '#94a3b8',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 4px'
              }}>
                ⌘K
              </kbd>
            </div>

            {/* Ask AI Copilot Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>

            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Bell size={15} />
              </button>
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '1px 5px',
                border: '2px solid #ffffff'
              }}>
                12
              </span>
            </div>

            {/* User Dropdown Preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderLeft: '1px solid #e2e8f0',
              paddingLeft: '12px'
            }}>
              <img
                src={profileData.avatarUrl}
                alt={profileData.firstName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', lineHeight: 1.1 }}>
                  {profileData.firstName} {profileData.lastName}
                </strong>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Growth Plan</span>
              </div>
            </div>

            {/* Discard & Save Changes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <button
                onClick={handleDiscard}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#344054',
                  cursor: 'pointer'
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{
                  backgroundColor: saveSuccess ? '#059669' : '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {saveSuccess && <Check size={13} strokeWidth={3} />}
                <span>{isSaving ? 'Saving...' : (saveSuccess ? 'Saved' : 'Save Changes')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Center Body: Subnav + Main Forms + Right Sidebar */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: '190px 1fr 280px',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Vertical Subnav */}
          <ProfileNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            onNavigateToSettings={() => onNavigate('settings')}
          />

          {/* Middle Column (Dynamic Views based on Active Tab) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeSection === 'profile' && (
              <>
                <PersonalInformationCard
                  data={profileData}
                  onChange={(updates) => setProfileData(prev => ({ ...prev, ...updates }))}
                  onChangePhotoClick={() => setIsAvatarModalOpen(true)}
                />

                <PreferencesCard
                  data={preferencesData}
                  onChange={(updates) => setPreferencesData(prev => ({ ...prev, ...updates }))}
                />

                <SecurityCard
                  security={securityData}
                  onChangePasswordClick={() => setIsPasswordModalOpen(true)}
                  onManage2faClick={() => setIs2faModalOpen(true)}
                />

                <RecentActivityCard
                  activities={activities}
                  onViewAllClick={() => onNavigate('settings')}
                />
              </>
            )}

            {activeSection === 'preferences' && (
              <PreferencesCard
                data={preferencesData}
                onChange={(updates) => setPreferencesData(prev => ({ ...prev, ...updates }))}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationsTab
                onSaveToast={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2500);
                }}
              />
            )}

            {activeSection === 'security' && (
              <>
                <SecurityCard
                  security={securityData}
                  onChangePasswordClick={() => setIsPasswordModalOpen(true)}
                  onManage2faClick={() => setIs2faModalOpen(true)}
                />
                <RecentActivityCard
                  activities={activities}
                  onViewAllClick={() => onNavigate('settings')}
                />
              </>
            )}

            {activeSection === 'sessions' && (
              <SessionsTab />
            )}

            {activeSection === 'api-keys' && (
              <ApiKeysTab />
            )}

            {activeSection === 'email-settings' && (
              <EmailSettingsTab />
            )}
          </div>

          {/* Right Column (Preview, Summary, Connected Accounts) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ProfilePreviewCard data={profileData} />
            <AccountSummaryCard data={profileData} />
            <ConnectedAccountsCard
              accounts={connectedAccounts}
              onManageConnectionsClick={() => onNavigate('integrations')}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }}
      />

      <Manage2faModal
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        isEnabled={securityData.twoFactorEnabled}
        onToggle={(enabled) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: enabled }))}
      />

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profileData.avatarUrl}
        onSaveAvatar={(url) => setProfileData(prev => ({ ...prev, avatarUrl: url }))}
      />

      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
