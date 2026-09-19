import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Globe,
  Mail,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Phone,
  Download,
  Loader2,
  StopCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { scraperApi, type ScrapedRecordDto, type CrawlProgressDto } from '../../api/scraper';
import confetti from 'canvas-confetti';

const LinkedInIcon = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const GithubIcon = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface WebEmailScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialCompanyName?: string;
  initialCompanyId?: string;
  onContactsSaved?: (savedCount: number) => void;
}

export const WebEmailScraperModal: React.FC<WebEmailScraperModalProps> = ({
  isOpen,
  onClose,
  initialUrl = '',
  initialCompanyName = '',
  initialCompanyId,
  onContactsSaved
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [mode, setMode] = useState<'single' | 'crawl'>('crawl');
  const [maxDepth] = useState<number>(2);
  const [maxPages, setMaxPages] = useState<number>(15);
  const [verifyMx, setVerifyMx] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<CrawlProgressDto | null>(null);
  const [records, setRecords] = useState<ScrapedRecordDto[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (initialUrl) {
      let formatted = initialUrl.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = `https://${formatted}`;
      }
      setUrl(formatted);
    }
  }, [initialUrl]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleStartScrape = async () => {
    setErrorMessage(null);
    setSaveSuccessMsg(null);
    setRecords([]);
    setSelectedEmails(new Set());
    setProgress(null);

    let target = url.trim();
    if (!target) {
      setErrorMessage('Please enter a website URL');
      return;
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
      setUrl(target);
    }

    setIsLoading(true);

    if (mode === 'single') {
      try {
        const res = await scraperApi.scrapePage(target, 12000, verifyMx);
        if (res.success && res.data) {
          setRecords(res.data.records);
          setSelectedEmails(new Set(res.data.records.map(r => r.email)));
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to scrape webpage');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Crawl mode
      try {
        const res = await scraperApi.startCrawl({
          url: target,
          maxDepth,
          maxPages,
          sameDomainOnly: true,
          verifyMx
        });

        if (res.success && res.data?.jobId) {
          const jobId = res.data.jobId;
          setActiveJobId(jobId);

          // Connect to SSE stream
          const sse = new EventSource(`/api/v1/scraper/crawl/stream/${jobId}`);
          eventSourceRef.current = sse;

          sse.addEventListener('progress', (e) => {
            try {
              const data = JSON.parse(e.data);
              setProgress(data);
            } catch {}
          });

          sse.addEventListener('record', (e) => {
            try {
              const rec: ScrapedRecordDto = JSON.parse(e.data);
              setRecords(prev => {
                if (prev.some(r => r.email === rec.email)) return prev;
                return [...prev, rec];
              });
              setSelectedEmails(prev => new Set([...prev, rec.email]));
            } catch {}
          });

          sse.addEventListener('done', (e) => {
            try {
              const data = JSON.parse(e.data);
              if (data.records) {
                setRecords(data.records);
                setSelectedEmails(new Set(data.records.map((r: any) => r.email)));
              }
            } catch {}
            setIsLoading(false);
            setActiveJobId(null);
            sse.close();
          });

          sse.addEventListener('error', () => {
            setIsLoading(false);
            setActiveJobId(null);
            sse.close();
          });
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to start crawler');
        setIsLoading(false);
      }
    }
  };

  const handleCancelCrawl = async () => {
    if (!activeJobId) return;
    try {
      await scraperApi.cancelCrawl(activeJobId);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch {}
    setIsLoading(false);
    setActiveJobId(null);
  };

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === records.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(records.map(r => r.email)));
    }
  };

  const handleSaveToContacts = async () => {
    const selectedRecords = records.filter(r => selectedEmails.has(r.email));
    if (selectedRecords.length === 0) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await scraperApi.saveContacts(
        selectedRecords,
        initialCompanyId,
        initialCompanyName
      );

      if (res.success && res.data) {
        setSaveSuccessMsg(`Saved ${res.data.savedCount} verified contacts to HUNTIQ CRM!`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        if (onContactsSaved) {
          onContactsSaved(res.data.savedCount);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save contacts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) return;
    const headers = ['Email', 'Name', 'Job Title', 'Type', 'Phone', 'LinkedIn', 'MX Status', 'Source URL'];
    const rows = records.map(r => [
      `"${r.email}"`,
      `"${r.name || ''}"`,
      `"${r.jobTitle || ''}"`,
      `"${r.type}"`,
      `"${r.phone || ''}"`,
      `"${r.socials?.linkedin || ''}"`,
      `"${r.mxStatus || 'unverified'}"`,
      `"${r.sourceUrl}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `huntiq_scraped_contacts_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1040px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #ffffff, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Globe size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Website Email & Decision-Maker Scraper
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8'
                }}>
                  Native Engine
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                {initialCompanyName
                  ? `Extracting verified contacts & leadership from ${initialCompanyName}`
                  : 'Crawl websites, extract verified decision makers, direct phones, and deliverability.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Configuration Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Globe size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://company.com or company.ng"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setMode('crawl')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: mode === 'crawl' ? '#ffffff' : 'transparent',
                  color: mode === 'crawl' ? '#0f172a' : '#64748b',
                  boxShadow: mode === 'crawl' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Domain Crawl
              </button>
              <button
                onClick={() => setMode('single')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: mode === 'single' ? '#ffffff' : 'transparent',
                  color: mode === 'single' ? '#0f172a' : '#64748b',
                  boxShadow: mode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Single Page
              </button>
            </div>

            {/* Crawl Options */}
            {mode === 'crawl' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={maxPages}
                  onChange={e => setMaxPages(Number(e.target.value))}
                  disabled={isLoading}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value={8}>8 Pages</option>
                  <option value={15}>15 Pages</option>
                  <option value={30}>30 Pages</option>
                </select>
              </div>
            )}

            {/* MX Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={verifyMx}
                onChange={e => setVerifyMx(e.target.checked)}
                disabled={isLoading}
              />
              Live MX Check
            </label>

            {/* Action button */}
            {isLoading ? (
              <button
                onClick={handleCancelCrawl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <StopCircle size={16} />
                Stop Crawl
              </button>
            ) : (
              <button
                onClick={handleStartScrape}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Search size={16} />
                Start Extraction
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
          {saveSuccessMsg && (
            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Live Progress Banner */}
        {isLoading && (
          <div style={{ padding: '12px 24px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Loader2 size={18} className="animate-spin" style={{ color: '#16a34a' }} />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                  {progress ? `Visiting page ${progress.pagesVisited} of ${progress.maxPages}: ` : 'Starting web crawler engine... '}
                </span>
                {progress?.url && (
                  <span style={{ fontSize: '12px', color: '#4b5563', marginLeft: '4px' }}>
                    {progress.url}
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d' }}>
              {records.length} emails discovered
            </div>
          </div>
        )}

        {/* Results Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {records.length === 0 && !isLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Mail size={44} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', margin: '0 0 6px 0' }}>
                No Contacts Extracted Yet
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Enter a target company domain or website above and click Start Extraction.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.size === records.length && records.length > 0}
                    onChange={toggleSelectAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all" style={{ fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                    Select All ({selectedEmails.size}/{records.length})
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleExportCsv}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  <button
                    onClick={handleSaveToContacts}
                    disabled={selectedEmails.size === 0 || isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedEmails.size === 0 ? '#94a3b8' : '#16a34a',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: selectedEmails.size === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                    Save {selectedEmails.size} to HUNTIQ CRM
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px 14px', width: '32px' }}></th>
                      <th style={{ padding: '10px 14px' }}>Contact / Name</th>
                      <th style={{ padding: '10px 14px' }}>Email & Deliverability</th>
                      <th style={{ padding: '10px 14px' }}>Direct Phone</th>
                      <th style={{ padding: '10px 14px' }}>Socials</th>
                      <th style={{ padding: '10px 14px' }}>Source Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const isSelected = selectedEmails.has(r.email);
                      return (
                        <tr
                          key={r.email}
                          onClick={() => toggleSelectEmail(r.email)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectEmail(r.email)}
                            />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {r.name || 'Company Contact'}
                            </div>
                            {r.jobTitle ? (
                              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 500 }}>
                                {r.jobTitle}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {r.type === 'role' ? 'Role / Inquiries Mailbox' : 'Individual'}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 500, color: '#1e293b' }}>{r.email}</span>
                            </div>
                            <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {r.mxStatus === 'deliverable' && (
                                <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <ShieldCheck size={11} /> MX Verified
                                </span>
                              )}
                              {r.mxStatus === 'disposable' && (
                                <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <ShieldAlert size={11} /> Disposable
                                </span>
                              )}
                              {r.mxStatus === 'undeliverable' && (
                                <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <AlertCircle size={11} /> Undeliverable
                                </span>
                              )}
                              {(!r.mxStatus || r.mxStatus === 'unverified') && (
                                <span style={{ fontSize: '10px', fontWeight: 500, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {r.phone ? (
                              <a
                                href={`tel:${r.phone}`}
                                onClick={e => e.stopPropagation()}
                                style={{ color: '#0f172a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                              >
                                <Phone size={12} style={{ color: '#64748b' }} />
                                {r.phone}
                              </a>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {r.socials?.linkedin && (
                                <a
                                  href={r.socials.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: '#0077b5' }}
                                  title="LinkedIn"
                                >
                                  <LinkedInIcon size={15} />
                                </a>
                              )}
                              {r.socials?.twitter && (
                                <a
                                  href={r.socials.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: '#0f172a' }}
                                  title="Twitter / X"
                                >
                                  <TwitterIcon size={15} />
                                </a>
                              )}
                              {r.socials?.github && (
                                <a
                                  href={r.socials.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: '#24292e' }}
                                  title="GitHub"
                                >
                                  <GithubIcon size={15} />
                                </a>
                              )}
                              {!r.socials?.linkedin && !r.socials?.twitter && !r.socials?.github && (
                                <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <a
                              href={r.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.pageTitle || r.sourceUrl}
                              </span>
                              <ExternalLink size={11} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
