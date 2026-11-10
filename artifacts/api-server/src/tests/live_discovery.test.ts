import assert from 'node:assert/strict';
import { groundedSearch, mobilePerformance, publicDomain } from '../services/liveDiscovery';

async function run() {
  assert.equal(publicDomain('https://www.shop.co.uk/'), 'shop.co.uk');
  for (const value of ['localhost', 'https://127.0.0.1', 'https://shop.co.uk/private', 'https://user@shop.co.uk', 'https://example.test']) {
    assert.equal(publicDomain(value), null);
  }
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'fixture-only';
  process.env.TAVILY_API_KEY = 'fixture-only';
  process.env.PAGESPEED_API_KEY = 'fixture-only';
  try {
    globalThis.fetch = async (url, request) => {
      if (String(url).includes('runPagespeed')) {
        assert.equal(new URL(String(url)).searchParams.get('strategy'), 'mobile');
        return Response.json({ lighthouseResult: { categories: { performance: { score: 0.79 } } } });
      }
      const hostname = new URL(String(url)).hostname;
      if (hostname === 'api.tavily.com') {
        assert.equal(new URL(String(url)).pathname, '/search');
        assert.equal(request?.method, 'POST');
        assert.equal(new Headers(request?.headers).get('Authorization'), 'Bearer fixture-only');
        assert.deepEqual(JSON.parse(String(request?.body)), {
          query: 'shop.co.uk', search_depth: 'basic', auto_parameters: false, max_results: 12,
          include_answer: false, include_raw_content: false
        });
        return Response.json({ results: [
        { title: 'Official site', url: 'https://shop.co.uk/', content: 'Example search evidence' },
        { title: 'Repeated', url: 'https://shop.co.uk/' },
        { title: 'Invalid', url: 'javascript:alert(1)' }
        ] });
      }
      assert.equal(hostname, 'generativelanguage.googleapis.com');
      assert.match(String(request?.body), /shop\.co\.uk/);
      assert.match(String(request?.body), /Example search evidence/);
      assert.doesNotMatch(String(request?.body), /fixture-only/);
      return Response.json({ candidates: [{ content: { parts: [{ text: 'A business report.' }] } }] });
    };
    const report = await groundedSearch('Describe the business.', 'shop.co.uk');
    assert.equal(report.text, 'A business report.');
    assert.deepEqual(report.sources.map(source => source.url), ['https://shop.co.uk/']);
    const performance = await mobilePerformance('shop.co.uk');
    assert.equal(performance.status === 'measured' && performance.score, 79);
    globalThis.fetch = async () => Response.json({ results: [] });
    await assert.rejects(groundedSearch('Describe the business.', 'shop.co.uk'), { statusCode: 422 });
    globalThis.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(groundedSearch('Describe the business.', 'shop.co.uk'), { statusCode: 502 });
    assert.equal((await mobilePerformance('shop.co.uk')).status, 'unavailable');
    console.log('Domain validation, grounded evidence, mobile measurements, and provider errors passed.');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
