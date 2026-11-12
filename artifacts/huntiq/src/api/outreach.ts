import { apiClient } from './client';
import type { OutreachItem, OutreachKpiSummary, OutreachStatus, OutreachChannel } from '../types/outreach';

export interface LeadOutreachContext {
  lead: { id: string; companyName: string; domain?: string | null; reason?: string; summary?: string; score?: number; status?: string };
  report: { id: string; text: string; sources: { title: string; url: string }[]; checkedAt?: string } | null;
  contacts: { id: string; name: string; role: string | null; email: string; emailStatus: 'verified' }[];
}

export function getLeadOutreachContext(leadId: string) {
  return apiClient.get<LeadOutreachContext>(`/api/leads/${leadId}/outreach-context`);
}

export function generateLeadOutreachDraft(leadId: string, contactId?: string) {
  return apiClient.post<{ subject: string; body: string; leadId: string; contact: LeadOutreachContext['contacts'][number] | null; researchReportId: string; evidenceSources: { title: string; url: string }[] }>(
    `/api/leads/${leadId}/outreach-draft`, { contactId }
  );
}

export interface UnmatchedInboundEmail { id: string; provider_thread_id: string; sender_email: string; sender_name?: string; subject: string; body_text: string; message_date: string; }
export function syncGmailInbox() { return apiClient.post<{ success: boolean; processedCount: number; repliesCount: number; error?: string }>('/api/v1/auth/google/sync', {}); }
export function fetchUnmatchedEmails() { return apiClient.get<UnmatchedInboundEmail[]>('/api/v1/auth/google/unmatched'); }
export function linkUnmatchedEmail(eventId: string, threadId: string) { return apiClient.post(`/api/v1/auth/google/unmatched/${eventId}/link`, { threadId }); }

export interface FetchOutreachResult {
  conversations: OutreachItem[];
  kpiSummary: OutreachKpiSummary;
}

export function fetchOutreachList(params?: { status?: string; channel?: string; query?: string }) {
  return apiClient.get<FetchOutreachResult>('/api/outreach', { params: { status: params?.status, channel: params?.channel, q: params?.query } });
}

export function getOutreachById(id: string) {
  return apiClient.get<OutreachItem>(`/api/outreach/${id}`);
}

export function sendOutreachMessage(id: string, content: string, channel: OutreachChannel = 'email', requestId?: string) {
  return apiClient.post<OutreachItem>(`/api/outreach/${id}/messages`, { content, channel, requestId }, { timeoutMs: 25000 });
}

export function createOutreach(payload: Partial<OutreachItem>) {
  return apiClient.post<OutreachItem>('/api/outreach', payload, { timeoutMs: 25000 });
}

export function updateOutreachStatus(id: string, status: OutreachStatus) {
  return apiClient.patch<OutreachItem>(`/api/outreach/${id}/status`, { status });
}
