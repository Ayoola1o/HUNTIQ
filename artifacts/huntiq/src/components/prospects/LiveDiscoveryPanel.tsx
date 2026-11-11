import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/client';
import { useHuntiq } from '../../context/HuntiqContext';

type Source = { title: string; url: string };
type Candidate = { name: string; domain: string; reason: string };
type Report = {
  id: string | null;
  leadId?: string;
  name: string;
  domain: string;
  text: string;
  sources: Source[];
  checkedAt: string;
  performance: { status: 'measured'; score: number; source: string } | { status: 'unavailable'; detail: string };
};
export type DiscoveryMode = 'map' | 'web' | 'both';

function Sources({ sources }: { sources: Source[] }) {
  return <ol>{sources.map(source => <li key={source.url}>
    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
  </li>)}</ol>;
}

export function LiveDiscoveryPanel({ mode, onModeChange, onMapSearch, mapSelection }: {
  mode: DiscoveryMode;
  onModeChange: (mode: DiscoveryMode) => void;
  onMapSearch: (query: string) => void;
  mapSelection: { id: string; name: string } | null;
}) {
  const { startPitchForProspect } = useHuntiq();
  const [query, setQuery] = useState('');
  const [mapTerms, setMapTerms] = useState('');
  const [results, setResults] = useState<{ candidates: Candidate[]; sources: Source[] }>();
  const [target, setTarget] = useState({ name: '', domain: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [report, setReport] = useState<Report>();
  const [saved, setSaved] = useState<Report[]>([]);
  const [busy, setBusy] = useState<'search' | 'report' | 'lead' | null>(null);
  const [error, setError] = useState('');
  const [observation, setObservation] = useState('');
  const [recipient, setRecipient] = useState('');
  const [draftSource, setDraftSource] = useState('');
  const [savedError, setSavedError] = useState('');
  const selectionVersion = useRef(0);

  useEffect(() => {
    let mounted = true;
    apiClient.get<Report[]>('/api/research/360').then(value => {
      if (mounted) setSaved(value);
    }).catch(() => {
      if (mounted) setSavedError('Could not load recent 360 reports.');
    });
    return () => { mounted = false; };
  }, []);

  const pick = (name: string, domain: string) => {
    selectionVersion.current++;
    setTarget({ name, domain });
    setConfirmed(false);
    setReport(undefined);
    setObservation('');
    setRecipient('');
    setDraftSource('');
  };

  useEffect(() => {
    if (mapSelection) pick('', '');
  }, [mapSelection?.id]);

  const search = async () => {
    if (busy || (!query.trim() && mode !== 'map')) return;
    setError('');
    if (mode !== 'web') onMapSearch(mode === 'both' ? mapTerms.trim() || query.trim() : query.trim());
    if (mode === 'map') return;
    setBusy('search');
    setResults(undefined);
    try {
      setResults(await apiClient.post('/api/research/discover', { query: query.trim() }, { timeoutMs: 22000 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setBusy(null);
    }
  };

  const research = async () => {
    if (busy || !confirmed || !target.name.trim() || !target.domain.trim()) return;
    setBusy('report');
    const version = selectionVersion.current;
    setError('');
    setReport(undefined);
    setObservation('');
    setRecipient('');
    setDraftSource('');
    try {
      const response = await apiClient.post<Report>('/api/research/360', { ...target, confirmed }, { timeoutMs: 25000 });
      if (version === selectionVersion.current) setReport(response);
      if (response.id) setSaved(items => [response, ...items].slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed.');
    } finally {
      setBusy(null);
    }
  };

  const saveLead = async () => {
    if (busy || !report?.id || !observation.trim() || report.leadId) return;
    setBusy('lead');
    const version = selectionVersion.current;
    setError('');
    try {
      const { leadId } = await apiClient.post<{ leadId: string }>(`/api/research/360/${report.id}/lead`, { observation });
      if (version === selectionVersion.current) setReport({ ...report, leadId });
      setSaved(items => items.map(item => item.id === report.id ? { ...item, leadId } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The lead could not be saved.');
    } finally {
      setBusy(null);
    }
  };

  return <section aria-label="Map, web, and research" style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid #cbd5e1', borderRadius: 12 }}>
    <form onSubmit={event => { event.preventDefault(); void search(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <label>Search mode <select value={mode} onChange={event => onModeChange(event.target.value as DiscoveryMode)}>
        <option value="map">Map</option><option value="web">Web</option><option value="both">Both</option>
      </select></label>
      <input aria-label="Business search" value={query} maxLength={350} onChange={event => setQuery(event.target.value)}
        placeholder="Try dental clinics, online skincare stores, or newsletters" style={{ flex: 1, minWidth: 220 }} />
      {mode === 'both' && <input aria-label="Map keywords" value={mapTerms} maxLength={120}
        onChange={event => setMapTerms(event.target.value)} placeholder="Optional map keywords, e.g. dental clinics" />}
      <button disabled={Boolean(busy)} type="submit">{busy === 'search' ? 'Searching…' : 'Search businesses'}</button>
      {query.trim() && <a href={`https://www.google.com/search?q=${encodeURIComponent(query.trim())}`} target="_blank" rel="noopener noreferrer">Open Google Search</a>}
    </form>
    {error && <p role="alert">{error}</p>}
    {savedError && <p role="status">{savedError}</p>}
    {mode !== 'map' && results && <div>
      <h3>Web matches</h3>
      {!results.candidates.length && <p>No matching domains were returned.</p>}
      {results.candidates.map(candidate => <div key={candidate.domain} style={{ marginBottom: 8 }}>
        <strong>{candidate.name}</strong> · <a href={`https://${candidate.domain}`} target="_blank" rel="noopener noreferrer">{candidate.domain}</a>
        <p>{candidate.reason}</p>
        <button type="button" disabled={Boolean(busy)} onClick={() => pick(candidate.name, candidate.domain)}>Research this business</button>
      </div>)}
      <details><summary>Web search sources</summary><Sources sources={results.sources} /></details>
    </div>}
    <div style={{ display: 'grid', gap: 8 }}>
      <h3>360 Research</h3>
      {mapSelection && <p>Selected on map: {mapSelection.name}. Enter the business name and domain after checking its official website.</p>}
      <label>Business name <input disabled={busy === 'report'} value={target.name} onChange={event => { setTarget({ ...target, name: event.target.value }); setConfirmed(false); }} /></label>
      <label>Official domain <input disabled={busy === 'report'} value={target.domain} onChange={event => { setTarget({ ...target, domain: event.target.value }); setConfirmed(false); }} placeholder="example.com" /></label>
      <label><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> I checked that this is the official domain for the intended business.</label>
      <button type="button" disabled={Boolean(busy) || !confirmed || !target.name.trim() || !target.domain.trim()} onClick={() => void research()}>
        {busy === 'report' ? 'Running research…' : 'Run 360 Research'}
      </button>
    </div>
    {saved.length > 0 && <details>
      <summary>Recent 360 reports</summary>
      <ul>{saved.map(item => <li key={item.id}><button type="button" disabled={Boolean(busy)} onClick={() => {
        pick(item.name, item.domain);
        setReport(item);
      }}>{item.name} · {item.domain}</button></li>)}</ul>
    </details>}
    {report && <article style={{ display: 'grid', gap: 8 }}>
      <h3>{report.name} · {report.domain}</h3>
      <p>Checked {new Date(report.checkedAt).toLocaleString()}{report.id ? '' : ' · Report storage is unavailable'}</p>
      <p>{report.performance.status === 'measured'
        ? <>Mobile Lighthouse score: {report.performance.score}/100 · <a href={report.performance.source} target="_blank" rel="noopener noreferrer">PageSpeed Insights</a></>
        : report.performance.detail}</p>
      <div style={{ whiteSpace: 'pre-wrap' }}>{report.text}</div>
      <h4>Sources</h4>
      <Sources sources={report.sources} />
      <label>Public business email for the draft (optional) <input type="email" value={recipient} onChange={event => setRecipient(event.target.value)} /></label>
      <label>Observation you verified <textarea value={observation} onChange={event => setObservation(event.target.value)} rows={3} /></label>
      <label>Source to include in the draft (optional) <select value={draftSource} onChange={event => setDraftSource(event.target.value)}>
        <option value="">No link in email</option>
        {report.sources.map(source => <option value={source.url} key={source.url}>{source.title}</option>)}
        {report.performance.status === 'measured' && <option value={report.performance.source}>PageSpeed Insights</option>}
      </select></label>
      {report.leadId ? <p role="status">Lead saved with its source links.</p> :
        <button type="button" disabled={Boolean(busy) || !report.id || !observation.trim()} onClick={() => void saveLead()}>
          {busy === 'lead' ? 'Saving…' : 'Save as lead'}
        </button>}
      <button type="button" disabled={!observation.trim() || !report.leadId || Boolean(recipient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim()))}
        onClick={() => startPitchForProspect({
          companyName: report.name,
          leadId: report.leadId || undefined,
          researchReportId: report.id || undefined,
          domain: report.domain,
          email: recipient.trim() || undefined,
          fromCopilot: true
        })}>{report.leadId ? 'Open editable Outreach draft' : 'Save this report as a lead to draft outreach'}</button>
    </article>}
  </section>;
}
