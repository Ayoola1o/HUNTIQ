import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Globe,
  Sparkles
} from 'lucide-react';
import { emailDiscoveryApi } from '../../api/emailDiscovery';
import { useHuntiq } from '../../context/HuntiqContext';

export type DiscoveryModalStatus = 
  | 'idle' 
  | 'discovering' 
  | 'crawling' 
  | 'processing' 
  | 'contacts_found' 
  | 'completed' 
  | 'failed';

export interface DiscoveryTarget {
  name: string;
  website?: string;
  domain?: string;
  companyId?: string;
  address?: string;
  category?: string;
}

interface ContactDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: DiscoveryTarget | null;
}

export const ContactDiscoveryModal: React.FC<ContactDiscoveryModalProps> = ({
  isOpen,
  onClose,
  target
}) => {
  const { navigateTo } = useHuntiq();
  const [status, setStatus] = useState<DiscoveryModalStatus>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [contactsFound, setContactsFound] = useState<number>(0);
  const [emailsFound, setEmailsFound] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  // Reset state on target change or modal open
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setJobId(null);
      setContactsFound(0);
      setEmailsFound(0);
      setProgressMsg('');
      setErrorMessage(null);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [isOpen, target]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (!isOpen || !target) return null;

  const targetUrl = target.website || (target.domain ? `https://${target.domain}` : '');

  const startDiscovery = async () => {
    if (!targetUrl) {
      setErrorMessage('A valid website or domain is required to discover contacts.');
      setStatus('failed');
      return;
    }

    setErrorMessage(null);
    setStatus('discovering');
    setProgressMsg(`Initiating email discovery job for ${target.name}...`);

    try {
      const job = await emailDiscoveryApi.discoverContacts({
        website: target.website,
        domain: target.domain,
        companyName: target.name,
        companyId: target.companyId
      });

      setJobId(job.id);
      setStatus('crawling');
      setProgressMsg('Connecting to Email Scraper crawler. Scanning website pages...');

      // Begin polling job status
      let pollCount = 0;
      pollingRef.current = setInterval(async () => {
        pollCount++;
        try {
          const updatedJob = await emailDiscoveryApi.getJobStatus(job.id);

          if (pollCount > 2 && updatedJob.status === 'RUNNING') {
            setStatus('processing');
            setProgressMsg('Parsing HTML mailto links, employee rosters, and validating deliverability...');
          }

          if (updatedJob.status === 'COMPLETED') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setContactsFound(updatedJob.contactsFound || 0);
            setEmailsFound(updatedJob.emailsFound || 0);
            setStatus(updatedJob.contactsFound > 0 ? 'contacts_found' : 'completed');
            setProgressMsg(
              updatedJob.contactsFound > 0
                ? `Successfully discovered ${updatedJob.contactsFound} verified contacts!`
                : 'Crawl completed. No public verified email records were located on this domain.'
            );
          } else if (updatedJob.status === 'FAILED') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus('failed');
            setErrorMessage(updatedJob.errorMessage || 'Discovery job failed during crawl execution.');
          }
        } catch (pollErr: any) {
          // Keep polling unless persistent failure
          if (pollCount > 15) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus('failed');
            setErrorMessage('Timed out waiting for discovery job update. Please check background tasks.');
          }
        }
      }, 2500);

    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message || 'Failed to dispatch email discovery job');
    }
  };

  const handleGoToContacts = () => {
    onClose();
    navigateTo('contacts');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5'
            }}>
              <Search size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Discover Verified Contacts
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Integrated Email Scraper Service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px' }}>
          {/* Target Business Card */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '18px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              {target.name}
            </div>
            {target.category && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#4f46e5',
                backgroundColor: '#eef2ff',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {target.category}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
              <Globe size={13} color="#3b82f6" />
              <span style={{ fontWeight: 600 }}>{targetUrl || 'No website available'}</span>
            </div>
          </div>

          {/* Status Indicator Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: status === 'failed' ? '#fef2f2' : (status === 'contacts_found' || status === 'completed') ? '#ecfdf5' : '#eff6ff',
            border: `1px solid ${status === 'failed' ? '#fecaca' : (status === 'contacts_found' || status === 'completed') ? '#a7f3d0' : '#bfdbfe'}`,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(status === 'discovering' || status === 'crawling' || status === 'processing') && (
                <Loader2 size={16} color="#2563eb" className="animate-spin" />
              )}
              {status === 'idle' && <Sparkles size={16} color="#4f46e5" />}
              {(status === 'contacts_found' || status === 'completed') && (
                <CheckCircle2 size={16} color="#059669" />
              )}
              {status === 'failed' && <AlertCircle size={16} color="#dc2626" />}

              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: status === 'failed' ? '#991b1b' : (status === 'contacts_found' || status === 'completed') ? '#065f46' : '#1e40af',
                textTransform: 'capitalize'
              }}>
                State: {status.replace('_', ' ')}
              </span>
            </div>

            {jobId && (
              <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                Job: {jobId.slice(0, 8)}...
              </span>
            )}
          </div>

          {/* Progress / Status Message */}
          {progressMsg && (
            <div style={{
              fontSize: '12px',
              color: '#334155',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              lineHeight: 1.4
            }}>
              {progressMsg}
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div style={{
              fontSize: '12px',
              color: '#991b1b',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px'
            }}>
              {errorMessage}
            </div>
          )}

          {/* Results Summary if Found */}
          {(status === 'contacts_found' || status === 'completed') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Contacts Ingested</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                  {contactsFound}
                </div>
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>Verified Emails</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>
                  {emailsFound || contactsFound}
                </div>
              </div>
            </div>
          )}

          {/* Information Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11.5px',
            color: '#64748b',
            lineHeight: 1.4,
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Ingested leads are strictly isolated to your workspace, matched against existing CRM accounts without duplicate creation, and prepared for optional personalized outreach.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 22px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          {status === 'idle' && (
            <button
              onClick={startDiscovery}
              disabled={!targetUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: targetUrl ? '#4f46e5' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                cursor: targetUrl ? 'pointer' : 'not-allowed',
                boxShadow: targetUrl ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              <Search size={14} />
              <span>Start Discovery</span>
            </button>
          )}

          {status === 'failed' && (
            <button
              onClick={startDiscovery}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Search size={14} />
              <span>Retry Discovery</span>
            </button>
          )}

          {(status === 'contacts_found' || status === 'completed') && (
            <button
              onClick={handleGoToContacts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Users size={14} />
              <span>View in CRM Contacts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
