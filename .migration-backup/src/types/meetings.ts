export type MeetingType = 'discovery' | 'demo' | 'proposal_review' | 'negotiation' | 'checkin';
export type MeetingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface MeetingItem {
  id: string;
  title: string;
  meetingType: MeetingType;
  companyName: string;
  domain: string;
  contactName: string;
  contactRole: string;
  contactAvatarBg: string;
  contactAvatarColor: string;
  scheduledTime: string;
  durationMinutes: number;
  meetingUrl: string;
  status: MeetingStatus;
  dealValue: number;
  opportunityScore: number;
  aiPrepBrief: {
    keyTakeaway: string;
    recentSignals: string[];
    suggestedQuestions: string[];
  };
  agenda: string[];
  notes: string;
}

export interface MeetingsKpiSummary {
  upcomingMeetings: number;
  todayCount: number;
  completedThisMonth: number;
  bookedFromOutreach: number; // percentage e.g. 75%
}
