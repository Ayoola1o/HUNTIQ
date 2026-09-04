import type {
  MeetingItem,
  MeetingsKpiSummary,
  MeetingType,
  MeetingStatus
} from '../../src/types/meetings';
import { db } from '../db/memoryStore';

export class MeetingService {
  private meetings: MeetingItem[] = [];

  constructor() {
    this.seedMeetingsFromEngine();
  }

  /**
   * Seed meetings dynamically with AI Prep Briefs based on detected signals and verified contacts.
   */
  private seedMeetingsFromEngine() {
    const companies = db.companies;
    const contacts = db.contacts;
    const signals = db.signals;

    const acmeComp = companies.find(c => c?.name?.includes('Acme')) || companies[0];
    const flwComp = companies.find(c => c?.name?.includes('Flutterwave')) || companies[1];
    const nimbusComp = companies.find(c => c?.name?.includes('Nimbus')) || companies[2] || { name: 'Nimbus Analytics', domain: 'nimbusanalytics.com' };

    const janeContact = contacts.find(c => c?.name?.includes('Jane')) || contacts[0];
    const seunContact = contacts.find(c => c?.name?.includes('Oluwaseun')) || contacts[1];

    const hiringSignals = signals
      .filter(s => s.type?.includes('hiring') || s.title?.includes('hiring') || s.title?.includes('Expansion'))
      .map(s => s.title);

    this.meetings = [
      {
        id: 'meet-1',
        title: 'Workforce Enablement & Leadership Framework Pitch',
        meetingType: 'demo',
        companyName: acmeComp?.name || 'Acme Technologies',
        domain: acmeComp?.domain || 'acmetech.com',
        contactName: janeContact?.name || 'Jane Smith',
        contactRole: janeContact?.title || 'Head of People & Culture',
        contactAvatarBg: '#fbcfe8',
        contactAvatarColor: '#9d174d',
        scheduledTime: 'Today, 2:00 PM (WAT)',
        durationMinutes: 30,
        meetingUrl: 'https://meet.google.com/hnt-acme-pitch',
        status: 'upcoming',
        dealValue: 18000,
        opportunityScore: 94,
        aiPrepBrief: {
          keyTakeaway: 'Jane is facing 38 new openings and wants a 3-month coaching curriculum for 14 incoming team leads.',
          recentSignals: hiringSignals.length ? hiringSignals.slice(0, 3) : [
            '38 New job postings in Lagos',
            'Series A funding raised ($4.2M)',
            'Promoted 3 team leads to directors'
          ],
          suggestedQuestions: [
            'What is your target go-live date for the new team leads?',
            'How are you currently measuring management velocity during ramp?'
          ]
        },
        agenda: ['Introductions & Context (5m)', 'Curriculum Demo & Scope (15m)', 'Pricing SLA & Next Steps (10m)'],
        notes: ''
      },
      {
        id: 'meet-2',
        title: 'FinTech Compliance Team Onboarding Discovery',
        meetingType: 'discovery',
        companyName: flwComp?.name || 'Flutterwave',
        domain: flwComp?.domain || 'flutterwave.com',
        contactName: seunContact?.name || 'Oluwaseun Adewale',
        contactRole: seunContact?.title || 'VP People Operations',
        contactAvatarBg: '#ede9fe',
        contactAvatarColor: '#5b21b6',
        scheduledTime: 'Tomorrow, 11:30 AM (WAT)',
        durationMinutes: 30,
        meetingUrl: 'https://meet.google.com/hnt-flw-discovery',
        status: 'upcoming',
        dealValue: 32000,
        opportunityScore: 96,
        aiPrepBrief: {
          keyTakeaway: 'Flutterwave recently obtained cross-border licensing and is scaling compliance headcount by 45 hires.',
          recentSignals: [
            'Ghana and Egypt regulatory licenses secured',
            'Headcount surge +24% across compliance and risk'
          ],
          suggestedQuestions: [
            'What are the core jurisdictional frameworks your team leads need to be certified on?',
            'Would a blended asynchronous + coach model fit your distributed teams?'
          ]
        },
        agenda: ['Licensing Context (5m)', 'Needs Assessment (15m)', 'Capability Fit & Next Steps (10m)'],
        notes: ''
      },
      {
        id: 'meet-3',
        title: 'Commercial Team Training Workshop Scope Call',
        meetingType: 'negotiation',
        companyName: nimbusComp.name,
        domain: nimbusComp.domain || 'nimbusanalytics.com',
        contactName: 'Kemi Adebayo',
        contactRole: 'Chief Commercial Officer',
        contactAvatarBg: '#fee2e2',
        contactAvatarColor: '#991b1b',
        scheduledTime: 'Yesterday (Completed)',
        durationMinutes: 45,
        meetingUrl: 'https://meet.google.com/hnt-nimbus-close',
        status: 'completed',
        dealValue: 9500,
        opportunityScore: 86,
        aiPrepBrief: {
          keyTakeaway: 'Negotiating closing payment schedule for 12 sales reps entering commercial enablement onboarding.',
          recentSignals: ['Commercial team expanded across Nigeria and Kenya'],
          suggestedQuestions: ['Can we confirm kickoff dates for the initial cohort?']
        },
        agenda: ['Contract SLA review', 'Pricing milestone confirmation'],
        notes: 'Client agreed to 30-day payment term. Follow-up SLA document requested by Friday.'
      }
    ];
  }

  /**
   * Calculate live KPI metrics across meetings.
   */
  public calculateKpiSummary(list: MeetingItem[]): MeetingsKpiSummary {
    const upcomingMeetings = list.filter(m => m.status === 'upcoming').length;
    const todayCount = list.filter(m => m.status === 'upcoming' && m.scheduledTime.toLowerCase().includes('today')).length;
    const completedThisMonth = list.filter(m => m.status === 'completed').length;
    const bookedFromOutreach = 75; // percentage

    return {
      upcomingMeetings,
      todayCount,
      completedThisMonth,
      bookedFromOutreach
    };
  }

  /**
   * List meetings with optional filtering.
   */
  public list(params?: {
    status?: string;
    meetingType?: string;
    query?: string;
  }): { meetings: MeetingItem[]; kpiSummary: MeetingsKpiSummary } {
    let results = [...this.meetings];

    if (params?.status && params.status !== 'all') {
      results = results.filter(m => m.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.meetingType && params.meetingType !== 'all') {
      results = results.filter(m => m.meetingType.toLowerCase() === params.meetingType?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q) ||
        m.contactName.toLowerCase().includes(q)
      );
    }

    return {
      meetings: results,
      kpiSummary: this.calculateKpiSummary(this.meetings)
    };
  }

  /**
   * Get meeting by ID.
   */
  public getById(id: string): MeetingItem | undefined {
    return this.meetings.find(m => m.id === id);
  }

  /**
   * Schedule a new meeting.
   */
  public create(payload: Partial<MeetingItem>): MeetingItem {
    const companyName = payload.companyName || 'Enterprise Partner';
    const contactName = payload.contactName || 'Decision Maker';

    const newMeeting: MeetingItem = {
      id: `meet-${Date.now()}`,
      title: payload.title || `${companyName} Strategy & Alignment Call`,
      meetingType: (payload.meetingType as MeetingType) || 'discovery',
      companyName,
      domain: payload.domain || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      contactName,
      contactRole: payload.contactRole || 'Director',
      contactAvatarBg: payload.contactAvatarBg || '#eff6ff',
      contactAvatarColor: payload.contactAvatarColor || '#1d4ed8',
      scheduledTime: payload.scheduledTime || 'Tomorrow, 2:00 PM',
      durationMinutes: payload.durationMinutes || 30,
      meetingUrl: payload.meetingUrl || `https://meet.google.com/hnt-${Date.now().toString().slice(-6)}`,
      status: (payload.status as MeetingStatus) || 'upcoming',
      dealValue: payload.dealValue || 15000,
      opportunityScore: payload.opportunityScore || 90,
      aiPrepBrief: payload.aiPrepBrief || {
        keyTakeaway: `Meeting scheduled with ${contactName} at ${companyName}.`,
        recentSignals: ['Market momentum detected by Huntiq Signal Engine'],
        suggestedQuestions: [
          'What are your primary milestones for this quarter?',
          'How can we best support your team velocity?'
        ]
      },
      agenda: payload.agenda || ['Introductions (5m)', 'Needs Assessment (15m)', 'Next Steps (10m)'],
      notes: payload.notes || ''
    };

    this.meetings.unshift(newMeeting);
    return newMeeting;
  }

  /**
   * Update meeting fields.
   */
  public update(id: string, updates: Partial<MeetingItem>): MeetingItem | undefined {
    const idx = this.meetings.findIndex(m => m.id === id);
    if (idx === -1) return undefined;

    this.meetings[idx] = {
      ...this.meetings[idx],
      ...updates
    };

    return this.meetings[idx];
  }

  /**
   * Update debrief notes for meeting.
   */
  public updateNotes(id: string, notes: string): MeetingItem | undefined {
    return this.update(id, { notes });
  }

  /**
   * Delete meeting.
   */
  public delete(id: string): boolean {
    const initialLen = this.meetings.length;
    this.meetings = this.meetings.filter(m => m.id !== id);
    return this.meetings.length < initialLen;
  }
}

export const meetingService = new MeetingService();
