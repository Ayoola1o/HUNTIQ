import assert from 'node:assert/strict';
import { generateOutreachDraft } from '../services/liveDiscovery';

async function run() {
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  const originalFetch = globalThis.fetch;
  const report = 'The company lists same-day delivery on its website. This sentence is also available in the saved evidence report.';
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ evidenceQuote: 'The company lists same-day delivery on its website.' }) }] } }] }), { status: 200 });
    const draft = await generateOutreachDraft({ companyName: 'Example Ltd', contactName: 'Sam Verified', reportText: report, sources: [{ title: 'Company site', url: 'https://example.com' }] });
    assert.equal(draft.subject, 'Introduction | Example Ltd');
    assert.match(draft.body, /^Hi Sam Verified,/);
    assert.match(draft.body, /“The company lists same-day delivery on its website\.”/);
    assert.doesNotMatch(draft.body, /Unsupported|fabricated/i);

    globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ evidenceQuote: 'Example Ltd has doubled revenue and beats its competitors.' }) }] } }] }), { status: 200 });
    const unsafe = await generateOutreachDraft({ companyName: 'Example Ltd', reportText: report, sources: [] });
    assert.doesNotMatch(unsafe.body, /doubled revenue|competitors/i, 'model-generated claims not present verbatim in the saved report are discarded');
    assert.match(unsafe.body, /^Hello,/);
    console.log('Evidence-backed draft quote and invented-claim rejection checks passed.');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGeminiKey;
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
