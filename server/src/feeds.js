const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
});

const INVESTING_FEEDS = [
  { name: 'CNBC Markets', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
  { name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' },
  { name: 'MarketWatch Top Stories', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
  { name: 'MarketWatch Market Pulse', url: 'https://feeds.content.dowjones.io/public/rss/mw_marketpulse' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
];

const AI_NEWS_FEEDS = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
];

const AI_KEYWORDS =
  /\b(ai|a\.i\.|artificial intelligence|machine learning|llm|gpt|chatgpt|openai|anthropic|claude|gemini|deepmind|neural network|generative ai)\b/i;

async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 12).map((item) => ({
      headline: (item.title || '').trim(),
      snippet: cleanSnippet(item.contentSnippet || item.content || item.summary || ''),
      sourceName: source.name,
      sourceUrl: item.link || source.url,
      publishedAt: item.isoDate || item.pubDate || null,
    }));
  } catch (err) {
    console.warn(`[feeds] Failed to fetch ${source.name}: ${err.message}`);
    return [];
  }
}

function cleanSnippet(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 500);
}

async function fetchHackerNewsAI() {
  try {
    const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || [])
      .filter((hit) => hit.title && AI_KEYWORDS.test(hit.title))
      .slice(0, 8)
      .map((hit) => ({
        headline: hit.title.trim(),
        snippet: '',
        sourceName: 'Hacker News',
        sourceUrl: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        publishedAt: hit.created_at || null,
      }));
  } catch (err) {
    console.warn(`[feeds] Failed to fetch Hacker News: ${err.message}`);
    return [];
  }
}

function dedupe(articles) {
  const seen = new Set();
  const result = [];
  for (const article of articles) {
    const key = article.headline.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(article);
  }
  return result;
}

async function collectInvestingArticles() {
  const results = await Promise.all(INVESTING_FEEDS.map(fetchFeed));
  return dedupe(results.flat());
}

async function collectAiNewsArticles() {
  const [feedResults, hnResults] = await Promise.all([
    Promise.all(AI_NEWS_FEEDS.map(fetchFeed)),
    fetchHackerNewsAI(),
  ]);
  return dedupe([...feedResults.flat(), ...hnResults]);
}

module.exports = { collectInvestingArticles, collectAiNewsArticles };
