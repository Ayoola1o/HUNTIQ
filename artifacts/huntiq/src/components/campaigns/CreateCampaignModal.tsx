import React, { useEffect, useState } from 'react';
import { fetchContacts } from '../../api/contacts';
import type { CreateCampaignDraft } from '../../types/campaign';
import type { ContactItem } from '../../types/contact';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: CreateCampaignDraft) => Promise<void>;
}

export function CreateCampaignModal({ isOpen, onClose, onCreateCampaign }: CreateCampaignModalProps) {
  return isOpen ? <CampaignDraftForm onClose={onClose} onCreateCampaign={onCreateCampaign} /> : null;
}

function CampaignDraftForm({ onClose, onCreateCampaign }: Omit<CreateCampaignModalProps, 'isOpen'>) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchContacts().then(result => {
      if (!mounted) return;
      const seen = new Set<string>();
      setContacts(result.contacts.filter(contact => {
        const email = contact.email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || seen.has(email)) return false;
        seen.add(email);
        return true;
      }));
    }).catch(() => {
      if (mounted) setError('Could not load workspace contacts. Close this form and try again.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !name.trim() || !subject.trim() || !body.trim() || !contactIds.length) return;
    setSaving(true);
    setError('');
    try {
      await onCreateCampaign({ name: name.trim(), subject: subject.trim(), body: body.trim(), contactIds });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save campaign draft.');
    } finally {
      setSaving(false);
    }
  };

  const search = query.trim().toLowerCase();
  const visibleContacts = contacts.filter(contact =>
    [contact.name, contact.email, contact.companyName].some(value => value.toLowerCase().includes(search))
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0f172aa6', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form role="dialog" aria-modal="true" aria-labelledby="campaign-draft-title" onSubmit={handleSubmit}
        style={{ width: 'min(540px, 100%)', maxHeight: '90vh', overflow: 'auto', display: 'grid', gap: 12, padding: 24, background: '#fff', borderRadius: 16 }}>
        <h2 id="campaign-draft-title">Create email campaign draft</h2>
        {error && <p role="alert">{error}</p>}
        <label>Campaign name <input required value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Email subject <input required value={subject} onChange={e => setSubject(e.target.value)} /></label>
        <label style={{ display: 'grid' }}>
          Email message
          <textarea required rows={5} value={body} onChange={e => setBody(e.target.value)} />
        </label>
        <fieldset disabled={saving || loading}>
          <legend>Recipients from Contacts ({contactIds.length} selected)</legend>
          <label>Find contacts <input value={query} onChange={e => setQuery(e.target.value)} /></label>
          {loading && <p>Loading contacts…</p>}
          {!loading && !error && !visibleContacts.length && <p>No contacts with an email address match.</p>}
          <div style={{ display: 'grid', maxHeight: 160, overflow: 'auto' }}>
            {visibleContacts.map(contact => (
              <label key={contact.id}>
                <input type="checkbox" checked={contactIds.includes(contact.id)} onChange={event => {
                  const checked = event.target.checked;
                  setContactIds(ids => checked ? [...ids, contact.id] : ids.filter(id => id !== contact.id));
                }} />
                {contact.name} ({contact.email})
              </label>
            ))}
          </div>
        </fieldset>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" disabled={saving || loading || !contactIds.length}>{saving ? 'Saving…' : 'Save draft'}</button>
        </div>
      </form>
    </div>
  );
}
