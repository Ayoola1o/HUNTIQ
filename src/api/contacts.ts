import { apiClient } from './client';
import type { DbContact, DbCompany } from '../../server/db/types';

export interface EnrichmentResponse {
  company: DbCompany;
  emailPattern: string;
  contactsAdded: DbContact[];
  verifiedCount: number;
}

export interface ContactFilterParams {
  companyId?: string;
  seniority?: string;
  department?: string;
  search?: string;
}

export async function fetchContacts(filters: ContactFilterParams = {}): Promise<DbContact[]> {
  return await apiClient.get<DbContact[]>('/api/contacts', {
    params: {
      companyId: filters.companyId,
      seniority: filters.seniority,
      department: filters.department,
      search: filters.search
    }
  });
}

export async function enrichCompanyContacts(companyId: string): Promise<EnrichmentResponse> {
  return await apiClient.post<EnrichmentResponse>('/api/contacts/enrich', { companyId });
}

export async function createContact(contact: Partial<DbContact>): Promise<DbContact> {
  return await apiClient.post<DbContact>('/api/contacts', contact);
}
