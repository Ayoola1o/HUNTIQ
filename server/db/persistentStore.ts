import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ContactItem } from '../../src/types/contact';
import type { PipelineDealItem } from '../../src/types/pipeline';
import type { CompanyResearchReport } from '../../src/types/research';

export interface DbUserRecord {
  id: string;
  workspaceId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName?: string;
  role: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbWorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface DbApiKeyRecord {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  secretKey: string;
  createdAt: string;
  lastUsed: string;
}

export interface DbUserActivityLog {
  id: string;
  userId: string;
  workspaceId: string;
  action: string;
  entityType: 'deal' | 'contact' | 'research' | 'api_key' | 'auth' | 'settings' | 'general';
  entityId?: string;
  entityTitle?: string;
  details?: string;
  timestamp: string;
}

export interface ScopedContact extends ContactItem {
  userId: string;
  workspaceId: string;
}

export interface ScopedPipelineDeal extends PipelineDealItem {
  userId: string;
  workspaceId: string;
}

export interface ScopedResearchReport extends CompanyResearchReport {
  userId: string;
  workspaceId: string;
}

export interface HuntiqStoreData {
  version: number;
  users: DbUserRecord[];
  workspaces: DbWorkspaceRecord[];
  apiKeys: DbApiKeyRecord[];
  activityLogs: DbUserActivityLog[];
  contacts: ScopedContact[];
  pipelineDeals: ScopedPipelineDeal[];
  researchReports: ScopedResearchReport[];
}

// Fixed IDs for pre-seeded demo user
export const DEFAULT_USER_ID = 'user-default-001';
export const DEFAULT_WORKSPACE_ID = 'ws-default-001';

/**
 * PBKDF2 Password Hashing helper for persistent store
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verify));
  } catch {
    return false;
  }
}

export class PersistentStore {
  private filePath: string;
  private data: HuntiqStoreData;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'server', 'data', 'huntiq_store.json');
    this.data = this.loadOrCreate();
  }

  private getDefaultData(): HuntiqStoreData {
    const defaultPasswordHash = hashPassword('password123');

    return {
      version: 1,
      users: [
        {
          id: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          email: 'demo@huntiq.io',
          passwordHash: defaultPasswordHash,
          fullName: 'Ayoola Ade',
          companyName: 'HUNTIQ Ventures',
          role: 'owner',
          defaultCurrency: 'USD',
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-01T00:00:00.000Z'
        },
        {
          id: 'user-ayoola-002',
          workspaceId: 'ws-ayoola-002',
          email: 'ayoola@huntiq.io',
          passwordHash: defaultPasswordHash,
          fullName: 'Ayoola Enterprise',
          companyName: 'Apex Growth Labs',
          role: 'owner',
          defaultCurrency: 'USD',
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-01T00:00:00.000Z'
        }
      ],
      workspaces: [
        {
          id: DEFAULT_WORKSPACE_ID,
          name: 'HUNTIQ Ventures Workspace',
          slug: 'huntiq-ventures',
          ownerId: DEFAULT_USER_ID,
          createdAt: '2026-08-01T00:00:00.000Z'
        },
        {
          id: 'ws-ayoola-002',
          name: 'Apex Growth Labs',
          slug: 'apex-growth',
          ownerId: 'user-ayoola-002',
          createdAt: '2026-08-01T00:00:00.000Z'
        }
      ],
      apiKeys: [
        {
          id: 'key-demo-1',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          name: 'Production CRM Webhook Key',
          keyPrefix: 'hnt_live_89f4a1',
          secretKey: 'hnt_live_89f4a19b8c2d4e1f7a0b3c5d6e8f9a2b',
          createdAt: '2026-08-10T14:30:00.000Z',
          lastUsed: '10 mins ago'
        },
        {
          id: 'key-demo-2',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          name: 'Zapier Automation Integration',
          keyPrefix: 'hnt_live_32a98e',
          secretKey: 'hnt_live_32a98e4d1f7c8b0a9e2d3f4a5b6c7d8e',
          createdAt: '2026-08-14T09:15:00.000Z',
          lastUsed: '1 hour ago'
        }
      ],
      activityLogs: [
        {
          id: 'log-seed-1',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          action: 'Workspace Initialized',
          entityType: 'general',
          details: 'Initialized HUNTIQ intelligence environment with active signals monitoring.',
          timestamp: '2026-08-01T00:00:00.000Z'
        },
        {
          id: 'log-seed-2',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          action: 'Dossier Generated',
          entityType: 'research',
          entityTitle: 'Acme Technologies',
          details: 'Deep research dossier compiled with 38 open jobs and digital gap score of 94.',
          timestamp: '2026-08-20T11:00:00.000Z'
        },
        {
          id: 'log-seed-3',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          action: 'Deal Advanced',
          entityType: 'deal',
          entityTitle: 'Acme Technologies ($25,000)',
          details: 'Moved deal to Proposal stage with 75% win probability.',
          timestamp: '2026-08-25T16:20:00.000Z'
        }
      ],
      contacts: [
        {
          id: 'cont-1',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          name: 'Jane Smith',
          email: 'jane.smith@acmetech.com',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
          verificationStatus: 'verified',
          companyName: 'Acme Technologies',
          companyLocation: 'Lagos, Nigeria',
          companyIndustry: 'Technology',
          companyEmployees: '250-500 employees',
          role: 'Head of People',
          decisionRole: 'Decision Maker',
          influenceScore: 94,
          influenceLevel: 'Very High',
          opportunityFitScore: 94,
          opportunityFitLevel: 'Excellent',
          lastActivity: 'Email opened',
          lastActivityTime: '2h ago',
          source: 'linkedin',
          isBookmarked: true,
          phone: '+234 801 234 5678',
          location: 'Lagos, Nigeria',
          localTime: '10:30 AM (WAT)',
          about: 'Head of People leading HR strategy, talent management and organizational development.',
          aiInsights: [
            'Strong decision maker for HR & People initiatives',
            'High engagement with HR content',
            'Recently expanded team by 34% in 90 days',
            'Opened new office in Victoria Island, Lagos'
          ],
          tags: ['Decision Maker', 'HR', 'High Influence', 'Hiring'],
          opportunities: [
            {
              id: 'opp-1',
              title: 'HR Consulting & Training',
              value: '$25,000',
              score: 94,
              scoreLevel: 'High'
            }
          ]
        },
        {
          id: 'cont-2',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          name: 'Michael Okoro',
          email: 'michael.okoro@finserve.com',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          verificationStatus: 'verified',
          companyName: 'FinServe Ltd',
          companyLocation: 'Nairobi, Kenya',
          companyIndustry: 'FinTech',
          companyEmployees: '100-250 employees',
          role: 'HR Director',
          decisionRole: 'Decision Maker',
          influenceScore: 91,
          influenceLevel: 'Very High',
          opportunityFitScore: 91,
          opportunityFitLevel: 'Excellent',
          lastActivity: 'Discovery call held',
          lastActivityTime: 'Yesterday',
          source: 'linkedin',
          isBookmarked: false,
          phone: '+254 712 345 678',
          location: 'Nairobi, Kenya',
          localTime: '12:30 PM (EAT)',
          about: 'Overseeing HR operations, regional expansion and culture across East Africa.',
          aiInsights: [
            'Prioritizes leadership development and cross-border payroll systems',
            'Actively hiring senior engineering leads',
            'Approved recent $35k consulting pilot budget'
          ],
          tags: ['Decision Maker', 'FinTech', 'Expanding', 'East Africa'],
          opportunities: [
            {
              id: 'opp-2',
              title: 'Regional Expansion Advisory',
              value: '$35,000',
              score: 91,
              scoreLevel: 'High'
            }
          ]
        }
      ],
      pipelineDeals: [
        {
          id: 'deal-1',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          companyName: 'Acme Technologies',
          domain: 'acme.io',
          dealTitle: 'Enterprise Talent Scaling & Mgmt',
          serviceName: 'HR Advisory Suite',
          dealValue: 25000,
          probability: 75,
          opportunityScore: 94,
          stage: 'proposal',
          stageEnteredAt: '2 days ago',
          expectedCloseDate: 'Aug 30, 2026',
          ownerName: 'Ayoola Ade',
          contactName: 'Jane Smith',
          contactRole: 'Head of People',
          contactAvatarBg: '#eff6ff',
          contactAvatarColor: '#1d4ed8',
          lastActivity: 'Proposal sent yesterday',
          nextAction: 'Executive follow-up call',
          nextActionDueDate: 'Tomorrow, 2 PM',
          priority: 'High',
          activities: []
        },
        {
          id: 'deal-2',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          companyName: 'FinServe Ltd',
          domain: 'finserve.africa',
          dealTitle: 'Regional Expansion Advisory',
          serviceName: 'Expansion Strategy',
          dealValue: 35000,
          probability: 60,
          opportunityScore: 91,
          stage: 'meeting',
          stageEnteredAt: '4 days ago',
          expectedCloseDate: 'Sep 15, 2026',
          ownerName: 'Ayoola Ade',
          contactName: 'Michael Okoro',
          contactRole: 'HR Director',
          contactAvatarBg: '#fef3c7',
          contactAvatarColor: '#b45309',
          lastActivity: 'Discovery call held',
          nextAction: 'Draft custom scoping deck',
          nextActionDueDate: 'Thursday',
          priority: 'High',
          activities: []
        },
        {
          id: 'deal-3',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          companyName: 'Paystack',
          domain: 'paystack.com',
          dealTitle: 'Cross-Border Compliance Platform',
          serviceName: 'Regulatory Cloud',
          dealValue: 48000,
          probability: 85,
          opportunityScore: 94,
          stage: 'negotiation',
          stageEnteredAt: '1 week ago',
          expectedCloseDate: 'Aug 28, 2026',
          ownerName: 'Ayoola Ade',
          contactName: 'Babafemi Lawson',
          contactRole: 'Head of Operations',
          contactAvatarBg: '#ecfdf5',
          contactAvatarColor: '#047857',
          lastActivity: 'MSA & SLA under legal review',
          nextAction: 'Final terms confirmation',
          nextActionDueDate: 'Friday, 11 AM',
          priority: 'High',
          activities: []
        }
      ],
      researchReports: [
        {
          id: 'res-1',
          userId: DEFAULT_USER_ID,
          workspaceId: DEFAULT_WORKSPACE_ID,
          companyId: 'comp-1',
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          industry: 'Technology & SaaS',
          location: 'Lagos, Nigeria',
          logoBg: '#ef4444',
          logoColor: '#ffffff',
          logoInitial: 'A',
          employees: '250 – 500',
          revenue: '$25M – $50M',
          founded: '2016',
          status: 'complete',
          lastUpdated: '10m ago',
          opportunityScore: 94,
          opportunityLevel: 'Very High',
          buyingIntent: 'Very High',
          relationship: 'New Prospect',
          executiveSummary: 'Acme Technologies is a rapidly growing enterprise software provider expanding its presence across West Africa. Recent hiring surges (38 new roles) indicate urgent requirements for leadership onboarding.',
          companyOverview: 'Acme Technologies builds cloud enterprise workflow automation software tailored for mid-market financial and commercial logistics enterprises.',
          businessModel: {
            whatTheySell: 'Enterprise SaaS automation platforms, CRM modules, and data pipelines.',
            howTheyMakeMoney: 'Annual recurring subscription licenses (ARR) with tiered user seat pricing.',
            targetCustomers: 'Commercial banks, FinTechs, FMCG distributors, and logistics scaleups.',
            revenueModel: 'B2B Enterprise SaaS (80%) + Professional Custom Implementations (20%).'
          },
          currentSituation: [
            'Appointed new Chief Operating Officer to spearhead regional expansion.',
            'Posted 38 new job listings in engineering and sales operations.'
          ],
          growth: {
            employeeGrowth: '+18.4% YoY',
            hiringCount: '38 open roles',
            expansionLocations: 'Ghana, Kenya & Côte d’Ivoire',
            fundingStage: 'Series B ($28M)',
            revenueTrend: '+42% ARR growth'
          },
          technologies: [
            { name: 'AWS Cloud', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: '2d ago' },
            { name: 'Salesforce CRM', category: 'Sales Stack', confidence: 'Verified', lastDetected: '1w ago' }
          ],
          competitors: [
            { id: 'c1', name: 'Terragon Group', marketPosition: 'Data Analytics Leader', productOverlap: 'Marketing cloud', relationship: 'Direct Competitor' }
          ],
          hiringSignals: {
            totalOpenRoles: 38,
            keyHires: ['Senior Talent Partner', 'VP of Sales', 'Lead Backend Engineer'],
            hiringVelocity: 'High (38 new roles in 30 days)'
          },
          leadershipTeam: [
            {
              id: 'l1',
              name: 'Jane Smith',
              title: 'Head of People',
              bio: 'People executive specializing in scaling tech companies.',
              linkedinUrl: 'https://linkedin.com/in/jane-smith-demo',
              verifiedEmail: 'jane.smith@acmetech.com',
              decisionPower: 'High'
            }
          ],
          customAngles: [
            {
              id: 'ca1',
              painPoint: 'Aggressive hiring velocity creating onboarding bottlenecks',
              proposedSolution: 'Automated executive talent onboarding and leadership coaching suite',
              suggestedSubject: 'Scaling Acme’s senior engineering and sales teams seamlessly',
              confidence: 'High',
              estimatedDealSize: '$25,000 – $40,000'
            }
          ]
        }
      ]
    };
  }

  private loadOrCreate(): HuntiqStoreData {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw) as HuntiqStoreData;
        if (parsed && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[PersistentStore] Error loading disk file, initializing fresh store:', err);
    }

    const defaultData = this.getDefaultData();
    this.saveImmediate(defaultData);
    return defaultData;
  }

  private saveImmediate(dataToSave: HuntiqStoreData): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tempFile = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, this.filePath);
    } catch (err) {
      console.error('[PersistentStore] Error saving store to disk:', err);
    }
  }

  private queueSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
      this.saveTimeout = null;
    }, 150);
  }

  public flush(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveImmediate(this.data);
  }

  // ==================== USER & AUTH ====================

  public getUserByEmail(email: string): DbUserRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === normalized);
  }

  public getUserById(id: string): DbUserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(params: {
    email: string;
    passwordHash: string;
    fullName: string;
    companyName?: string;
    defaultCurrency?: string;
  }): { user: DbUserRecord; workspace: DbWorkspaceRecord } {
    const userId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const workspaceId = `ws-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const companyName = params.companyName?.trim() || `${params.fullName}'s Workspace`;
    const slug = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const workspace: DbWorkspaceRecord = {
      id: workspaceId,
      name: companyName,
      slug,
      ownerId: userId,
      createdAt: new Date().toISOString()
    };

    const user: DbUserRecord = {
      id: userId,
      workspaceId,
      email: params.email.trim().toLowerCase(),
      passwordHash: params.passwordHash,
      fullName: params.fullName.trim(),
      companyName: params.companyName?.trim(),
      role: 'owner',
      defaultCurrency: params.defaultCurrency || 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.workspaces.push(workspace);
    this.data.users.push(user);

    this.logActivity({
      userId,
      workspaceId,
      action: 'Account Created',
      entityType: 'auth',
      details: `New account and private workspace registered for ${user.email}.`
    });

    this.queueSave();
    return { user, workspace };
  }

  public updateUserProfile(userId: string, updates: Partial<Pick<DbUserRecord, 'fullName' | 'companyName' | 'defaultCurrency'>>): DbUserRecord | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;

    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.companyName !== undefined) user.companyName = updates.companyName;
    if (updates.defaultCurrency !== undefined) user.defaultCurrency = updates.defaultCurrency;
    user.updatedAt = new Date().toISOString();

    this.queueSave();
    return user;
  }

  // ==================== API KEYS ====================

  public getApiKeysByUser(userId: string): DbApiKeyRecord[] {
    return this.data.apiKeys.filter(k => k.userId === userId);
  }

  public findApiKey(rawKey: string): { keyRecord: DbApiKeyRecord; user: DbUserRecord } | undefined {
    const keyRecord = this.data.apiKeys.find(k => k.secretKey === rawKey);
    if (!keyRecord) return undefined;
    const user = this.getUserById(keyRecord.userId);
    if (!user) return undefined;

    keyRecord.lastUsed = 'Just now';
    this.queueSave();
    return { keyRecord, user };
  }

  public createApiKey(userId: string, name: string): DbApiKeyRecord {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    const randomSuffix = crypto.randomBytes(16).toString('hex');
    const prefix = `hnt_live_${randomSuffix.substring(0, 6)}`;
    const secretKey = `hnt_live_${randomSuffix}`;

    const keyRecord: DbApiKeyRecord = {
      id: `key-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      userId,
      workspaceId: user.workspaceId,
      name: name.trim() || 'Custom API Key',
      keyPrefix: `${prefix}...${randomSuffix.slice(-4)}`,
      secretKey,
      createdAt: new Date().toISOString(),
      lastUsed: 'Never'
    };

    this.data.apiKeys.push(keyRecord);

    this.logActivity({
      userId,
      workspaceId: user.workspaceId,
      action: 'API Key Created',
      entityType: 'api_key',
      entityId: keyRecord.id,
      entityTitle: keyRecord.name,
      details: `Generated new programmatic API key '${keyRecord.name}'.`
    });

    this.queueSave();
    return keyRecord;
  }

  public deleteApiKey(userId: string, keyId: string): boolean {
    const index = this.data.apiKeys.findIndex(k => k.id === keyId && k.userId === userId);
    if (index === -1) return false;

    const removed = this.data.apiKeys.splice(index, 1)[0];
    this.logActivity({
      userId,
      workspaceId: removed.workspaceId,
      action: 'API Key Revoked',
      entityType: 'api_key',
      entityId: keyId,
      entityTitle: removed.name,
      details: `Revoked API key '${removed.name}'.`
    });

    this.queueSave();
    return true;
  }

  // ==================== ACTIVITY & DATA LOGS ====================

  public getActivityLogsByUser(userId: string, limit = 50): DbUserActivityLog[] {
    return this.data.activityLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logActivity(params: {
    userId: string;
    workspaceId: string;
    action: string;
    entityType: DbUserActivityLog['entityType'];
    entityId?: string;
    entityTitle?: string;
    details?: string;
  }): DbUserActivityLog {
    const record: DbUserActivityLog = {
      id: `log-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      userId: params.userId,
      workspaceId: params.workspaceId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      details: params.details,
      timestamp: new Date().toISOString()
    };

    this.data.activityLogs.unshift(record);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.length = 500;
    }

    this.queueSave();
    return record;
  }

  // ==================== CONTACTS ====================

  public getContactsByUser(userId: string, workspaceId?: string): ScopedContact[] {
    return this.data.contacts.filter(c => c.userId === userId || (workspaceId && c.workspaceId === workspaceId));
  }

  public getContactById(id: string, userId: string): ScopedContact | undefined {
    return this.data.contacts.find(c => c.id === id && c.userId === userId);
  }

  public saveContact(userId: string, workspaceId: string, contact: ContactItem): ScopedContact {
    const existingIndex = this.data.contacts.findIndex(c => c.id === contact.id && c.userId === userId);
    const record: ScopedContact = {
      ...contact,
      userId,
      workspaceId
    };

    if (existingIndex >= 0) {
      this.data.contacts[existingIndex] = record;
      this.logActivity({
        userId,
        workspaceId,
        action: 'Contact Updated',
        entityType: 'contact',
        entityId: record.id,
        entityTitle: record.name,
        details: `Updated contact information for ${record.name} (${record.role} at ${record.companyName}).`
      });
    } else {
      this.data.contacts.unshift(record);
      this.logActivity({
        userId,
        workspaceId,
        action: 'Contact Added',
        entityType: 'contact',
        entityId: record.id,
        entityTitle: record.name,
        details: `Added new verified contact ${record.name} (${record.role} at ${record.companyName}).`
      });
    }

    this.queueSave();
    return record;
  }

  public deleteContact(userId: string, contactId: string): boolean {
    const index = this.data.contacts.findIndex(c => c.id === contactId && c.userId === userId);
    if (index === -1) return false;

    const removed = this.data.contacts.splice(index, 1)[0];
    this.logActivity({
      userId,
      workspaceId: removed.workspaceId,
      action: 'Contact Removed',
      entityType: 'contact',
      entityId: contactId,
      entityTitle: removed.name,
      details: `Removed contact ${removed.name} from address book.`
    });

    this.queueSave();
    return true;
  }

  // ==================== PIPELINE DEALS & JOBS ====================

  public getPipelineDealsByUser(userId: string, workspaceId?: string): ScopedPipelineDeal[] {
    return this.data.pipelineDeals.filter(d => d.userId === userId || (workspaceId && d.workspaceId === workspaceId));
  }

  public getPipelineDealById(id: string, userId: string): ScopedPipelineDeal | undefined {
    return this.data.pipelineDeals.find(d => d.id === id && d.userId === userId);
  }

  public savePipelineDeal(userId: string, workspaceId: string, deal: PipelineDealItem): ScopedPipelineDeal {
    const existingIndex = this.data.pipelineDeals.findIndex(d => d.id === deal.id && d.userId === userId);
    const record: ScopedPipelineDeal = {
      ...deal,
      userId,
      workspaceId
    };

    if (existingIndex >= 0) {
      const prevStage = this.data.pipelineDeals[existingIndex].stage;
      this.data.pipelineDeals[existingIndex] = record;

      if (prevStage !== record.stage) {
        this.logActivity({
          userId,
          workspaceId,
          action: 'Deal Stage Changed',
          entityType: 'deal',
          entityId: record.id,
          entityTitle: record.dealTitle,
          details: `Moved ${record.companyName} deal from ${prevStage.toUpperCase()} to ${record.stage.toUpperCase()} ($${record.dealValue.toLocaleString()}).`
        });
      } else {
        this.logActivity({
          userId,
          workspaceId,
          action: 'Deal Updated',
          entityType: 'deal',
          entityId: record.id,
          entityTitle: record.dealTitle,
          details: `Updated deal parameters for ${record.companyName}.`
        });
      }
    } else {
      this.data.pipelineDeals.unshift(record);
      this.logActivity({
        userId,
        workspaceId,
        action: 'Deal Created',
        entityType: 'deal',
        entityId: record.id,
        entityTitle: record.dealTitle,
        details: `Created new pipeline deal for ${record.companyName} ($${record.dealValue.toLocaleString()} in ${record.stage.toUpperCase()}).`
      });
    }

    this.queueSave();
    return record;
  }

  public deletePipelineDeal(userId: string, dealId: string): boolean {
    const index = this.data.pipelineDeals.findIndex(d => d.id === dealId && d.userId === userId);
    if (index === -1) return false;

    const removed = this.data.pipelineDeals.splice(index, 1)[0];
    this.logActivity({
      userId,
      workspaceId: removed.workspaceId,
      action: 'Deal Removed',
      entityType: 'deal',
      entityId: dealId,
      entityTitle: removed.dealTitle,
      details: `Removed pipeline deal for ${removed.companyName}.`
    });

    this.queueSave();
    return true;
  }

  // ==================== RESEARCH REPORTS & LOGS ====================

  public getResearchReportsByUser(userId: string, workspaceId?: string): ScopedResearchReport[] {
    return this.data.researchReports.filter(r => r.userId === userId || (workspaceId && r.workspaceId === workspaceId));
  }

  public getResearchReportById(id: string, userId: string): ScopedResearchReport | undefined {
    return this.data.researchReports.find(r => r.id === id && r.userId === userId);
  }

  public saveResearchReport(userId: string, workspaceId: string, report: CompanyResearchReport): ScopedResearchReport {
    const existingIndex = this.data.researchReports.findIndex(r => r.id === report.id && r.userId === userId);
    const record: ScopedResearchReport = {
      ...report,
      userId,
      workspaceId
    };

    if (existingIndex >= 0) {
      this.data.researchReports[existingIndex] = record;
    } else {
      this.data.researchReports.unshift(record);
    }

    this.logActivity({
      userId,
      workspaceId,
      action: 'Research Dossier Compiled',
      entityType: 'research',
      entityId: record.id,
      entityTitle: record.companyName,
      details: `Generated in-depth research dossier for ${record.companyName} (${record.opportunityLevel} opportunity fit).`
    });

    this.queueSave();
    return record;
  }
}

export const persistentStore = new PersistentStore();
