import { apiClient } from './client';
import type { 
  MeetingItem, 
  MeetingsKpiSummary, 
  MeetingType, 
  MeetingStatus 
} from '../types/meetings';

export interface FetchMeetingsResult {
  meetings: MeetingItem[];
  kpiSummary: MeetingsKpiSummary;
}

// Resilient Offline Fallback Store
let localMeetings: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Workforce Enablement & Leadership Framework Pitch',
    meetingType: 'demo',
    companyName: 'Acme Technologies',
    domain: 'acmetech.com',
    contactName: 'Jane Smith',
    contactRole: 'Head of People & Culture',
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
      recentSignals: ['38 New job postings in Lagos', 'Series A funding raised ($4.2M)', 'Promoted 3 team leads to directors'],
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
    companyName: 'Flutterwave',
    domain: 'flutterwave.com',
    contactName: 'Oluwaseun Adewale',
    contactRole: 'VP People Operations',
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
      recentSignals: ['Ghana and Egypt regulatory approvals', 'Headcount surge +24% in Q1'],
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
    companyName: 'Nimbus Analytics',
    domain: 'nimbusanalytics.com',
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

function calculateLocalKpi(list: MeetingItem[]): MeetingsKpiSummary {
  const upcomingMeetings = list.filter(m => m.status === 'upcoming').length;
  const todayCount = list.filter(m => m.status === 'upcoming' && m.scheduledTime.toLowerCase().includes('today')).length;
  const completedThisMonth = list.filter(m => m.status === 'completed').length;
  const bookedFromOutreach = 75;

  return {
    upcomingMeetings,
    todayCount,
    completedThisMonth,
    bookedFromOutreach
  };
}

/**
 * Fetch all meetings with optional filters.
 */
export async function fetchMeetings(params?: {
  status?: string;
  meetingType?: string;
  query?: string;
}): Promise<FetchMeetingsResult> {
  try {
    const result = await apiClient.get<FetchMeetingsResult | MeetingItem[]>('/api/meetings', {
      params: {
        status: params?.status,
        meetingType: params?.meetingType,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { meetings: result, kpiSummary: calculateLocalKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localMeetings];

    if (params?.status && params.status !== 'all') {
      list = list.filter(m => m.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.meetingType && params.meetingType !== 'all') {
      list = list.filter(m => m.meetingType.toLowerCase() === params.meetingType?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q) ||
        m.contactName.toLowerCase().includes(q)
      );
    }

    return { meetings: list, kpiSummary: calculateLocalKpi(localMeetings) };
  }
}

/**
 * Get single meeting by ID.
 */
export async function getMeetingById(id: string): Promise<MeetingItem> {
  try {
    return await apiClient.get<MeetingItem>(`/api/meetings/${id}`);
  } catch (_err) {
    const found = localMeetings.find(m => m.id === id);
    if (!found) throw new Error(`Meeting ${id} not found`);
    return found;
  }
}

/**
 * Schedule a new meeting.
 */
export async function scheduleMeeting(payload: Partial<MeetingItem>): Promise<MeetingItem> {
  try {
    const created = await apiClient.post<MeetingItem>('/api/meetings', payload);
    localMeetings.unshift(created);
    return created;
  } catch (_err) {
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
      contactAvatarBg: '#eff6ff',
      contactAvatarColor: '#1d4ed8',
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

    localMeetings.unshift(newMeeting);
    return newMeeting;
  }
}

/**
 * Update meeting fields.
 */
export async function updateMeeting(id: string, updates: Partial<MeetingItem>): Promise<MeetingItem> {
  try {
    const updated = await apiClient.patch<MeetingItem>(`/api/meetings/${id}`, updates);
    const idx = localMeetings.findIndex(m => m.id === id);
    if (idx !== -1) localMeetings[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localMeetings.findIndex(m => m.id === id);
    if (idx !== -1) {
      localMeetings[idx] = { ...localMeetings[idx], ...updates };
      return localMeetings[idx];
    }
    throw new Error('Meeting not found');
  }
}

/**
 * Save meeting notes.
 */
export async function updateMeetingNotes(id: string, notes: string): Promise<MeetingItem> {
  try {
    const updated = await apiClient.patch<MeetingItem>(`/api/meetings/${id}/notes`, { notes });
    const idx = localMeetings.findIndex(m => m.id === id);
    if (idx !== -1) localMeetings[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localMeetings.findIndex(m => m.id === id);
    if (idx !== -1) {
      localMeetings[idx] = { ...localMeetings[idx], notes };
      return localMeetings[idx];
    }
    throw new Error('Meeting not found');
  }
}

/**
 * Delete a meeting.
 */
export async function deleteMeeting(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/meetings/${id}`);
  } catch (_err) {
    localMeetings = localMeetings.filter(m => m.id !== id);
    return { id, deleted: true };
  }
}
