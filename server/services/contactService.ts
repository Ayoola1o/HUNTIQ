import { db } from '../db/memoryStore';
import type { DbContact } from '../db/types';

export class ContactService {
  public async getContactsByCompany(companyId: string, workspaceId: string): Promise<DbContact[]> {
    return db.getContactsByCompany(companyId, workspaceId);
  }

  public async addContact(workspaceId: string, data: Omit<DbContact, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>): Promise<DbContact> {
    const newContact: DbContact = {
      ...data,
      id: `contact-${Date.now()}`,
      workspaceId,
      firstSeenAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.contacts.push(newContact);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: newContact.companyId,
      contactId: newContact.id,
      type: 'CONTACT_ADDED',
      title: `Contact Verified: ${newContact.firstName} ${newContact.lastName}`,
      description: `${newContact.jobTitle} email verified with ${newContact.emailConfidence}% confidence.`
    });

    return newContact;
  }
}

export const contactService = new ContactService();
