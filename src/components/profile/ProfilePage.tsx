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
import { useHuntiq } from '../../context/HuntiqContext';
import { updateUserProfile, uploadUserAvatar } from '../../api/auth';
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
import { MobileBottomNav } from '../navigation/MobileBottomNav';

interface ProfilePageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { currentUser, updateCurrentUser, setCurrency, userActivityLogs } = useHuntiq();
  const [activeSection, setActiveSection] = useState<ProfileNavSection>('profile');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getProfileFromUser = (user: typeof currentUser): UserProfileData => {
    const names = (user?.fullName || 'Ayoola Ade').trim().split(/\s+/);
    const firstName = names[0] || 'Ayoola';
    const lastName = names.slice(1).join(' ') || 'Ade';

    return {
      id: user?.id || 'usr-1',
      firstName,
      lastName,
      email: user?.email || 'ayoola.ade@huntiq.com',
      phone: user?.phone || '+234 801 234 5678',
      jobTitle: user?.jobTitle || 'Growth & Strategy Lead',
      department: user?.department || 'Growth',
      bio: user?.bio || 'Growth strategist and revenue leader passionate about helping teams find and win the right opportunities.',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: user?.location || 'Lagos, Nigeria',
      companyName: user?.companyName || 'HUNTIQ',
      linkedinUrl: user?.linkedinUrl || 'https://linkedin.com/in/ayoola-ade',
      twitterUrl: user?.twitterUrl || 'https://twitter.com/ayoola_growth',
      websiteUrl: user?.websiteUrl || 'https://huntiq.ai',
      role: user?.role ? (user.role === 'admin' ? 'Workspace Owner' : user.role) : 'Workspace Owner',
      memberSince: 'May 12, 2026',
      lastActive: 'Today, 10:42 AM',
      status: 'Active'
    };
  };

  // Profile Data State
  const [profileData, setProfileData] = useState<UserProfileData>(() => getProfileFromUser(currentUser));

  // Sync profile when active user switches
  const [prevUserId, setPrevUserId] = useState<string | undefined>(currentUser?.id);
  if (currentUser?.id !== prevUserId) {
    setPrevUserId(currentUser?.id);
    setProfileData(getProfileFromUser(currentUser));
  }

  // User Preferences State
  const [preferencesData, setPreferencesData] = useState<UserPreferencesData>({
    language: 'English',
    timezone: '(GMT+01:00) Lagos, Nigeria',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '24 Hour',
    defaultLandingPage: 'Dashboard',
    defaultCurrency: currentUser?.defaultCurrency === 'NGN' ? 'NGN - Nigerian Naira' : currentUser?.defaultCurrency === 'GBP' ? 'GBP - British Pound' : currentUser?.defaultCurrency === 'EUR' ? 'EUR - Euro' : 'USD - US Dollar'
  });

  // Security State
  const [securityData, setSecurityData] = useState<UserSecurityData>({
    twoFactorEnabled: true,
    twoFactorType: 'Authenticator App',
    lastPasswordChange: 'Aug 20, 2026'
  });

  // Recent Activity Items (Live from server if available, with fallback)
  const defaultActivities: ActivityLogItem[] = [
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
  ];

  const liveActivities: ActivityLogItem[] = userActivityLogs && userActivityLogs.length > 0
    ? userActivityLogs.slice(0, 5).map(log => ({
        id: log.id,
        activity: log.activity,
        locationIp: log.locationIp || 'Lagos, Nigeria 197.210.45.12',
        device: log.device || 'Chrome Browser',
        time: log.time || 'Recently',
        type: (log.type || 'profile') as any
      }))
    : defaultActivities;

  // Connected Accounts
  const [connectedAccounts] = useState<ConnectedAccountItem[]>([
    {
      id: 'conn-1',
      provider: 'Google',
      emailOrUsername: currentUser?.email || 'ayoola.ade@gmail.com',
      status: 'Connected',
      connectedAt: 'May 12, 2026'
    },
    {
      id: 'conn-2',
      provider: 'Microsoft',
      emailOrUsername: currentUser?.email || 'ayoola.ade@huntiq.com',
      status: 'Connected',
      connectedAt: 'May 14, 2026'
    },
    {
      id: 'conn-3',
      provider: 'Slack',
      emailOrUsername: currentUser?.email?.split('@')[0] || 'ayoola.ade',
      status: 'Connected',
      connectedAt: 'June 01, 2026'
    }
  ]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      const updates = {
        fullName,
        companyName: profileData.companyName,
        phone: profileData.phone,
        jobTitle: profileData.jobTitle,
        department: profileData.department,
        bio: profileData.bio,
        location: profileData.location,
        websiteUrl: profileData.websiteUrl,
        linkedinUrl: profileData.linkedinUrl,
        twitterUrl: profileData.twitterUrl,
        defaultCurrency: preferencesData.defaultCurrency.split(' ')[0]
      };

      const updatedUser = await updateUserProfile(updates);
      updateCurrentUser(updatedUser);
      if (updatedUser.defaultCurrency) {
        setCurrency(updatedUser.defaultCurrency as any);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile changes to backend:', err);
      // Optimistic local update
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      updateCurrentUser({
        fullName,
        companyName: profileData.companyName,
        phone: profileData.phone,
        jobTitle: profileData.jobTitle,
        department: profileData.department,
        bio: profileData.bio,
        location: profileData.location,
        websiteUrl: profileData.websiteUrl,
        linkedinUrl: profileData.linkedinUrl,
        twitterUrl: profileData.twitterUrl
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async (url: string) => {
    try {
      await uploadUserAvatar(url);
    } catch (err) {
      console.warn('Backend avatar upload notice:', err);
    }
    updateCurrentUser({ avatarUrl: url });
    setProfileData(prev => ({ ...prev, avatarUrl: url }));
    setIsAvatarModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDiscard = () => {
    setProfileData(getProfileFromUser(currentUser));
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
        <header 
          className="mobile-header-pad"
          style={{
            minHeight: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px clamp(12px, 3vw, 28px)',
            flexShrink: 0
          }}
        >
          {/* Left Title */}
          <div>
            <h1 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Profile
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Manage your personal information, preferences and account security.
            </p>
          </div>

          {/* Right Header Actions & Profile Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search input with ⌘K */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              width: 'min(240px, 100%)',
              flex: '1 1 160px'
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
              <kbd className="desktop-only" style={{
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
            <div className="desktop-only" style={{
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        <main 
          className="profile-grid-layout mobile-bottom-pad"
          style={{
            flex: 1,
            overflowY: 'auto'
          }}
        >
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
                  activities={liveActivities}
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
                  activities={liveActivities}
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
          <div className="profile-right-column">
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
        onSaveAvatar={handleSaveAvatar}
      />

      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
