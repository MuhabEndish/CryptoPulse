import axios from "axios";

const API_BASE = "https://api.coingecko.com/api/v3";

// Simple cache to reduce API calls
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

function getCachedData(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCacheData(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

// Delay between requests to avoid rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests

async function delayIfNeeded() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function fetchMarketData() {
  const cacheKey = "market_data";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();
    const { data } = await axios.get(`${API_BASE}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        price_change_percentage: "24h",
      },
    });

    setCacheData(cacheKey, data);
    return data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Using cached data if available.");
      // Return empty array if no cache available
      return [];
    }
    throw error;
  }
}

export async function searchCryptos(query: string) {
  const cacheKey = `search_${query}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();
    const { data } = await axios.get(`${API_BASE}/search`, {
      params: {
        query: query,
      },
    });

    // Get detailed info for top 10 results
    if (data.coins && data.coins.length > 0) {
      const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id).join(",");

      await delayIfNeeded();
      const { data: detailedData } = await axios.get(`${API_BASE}/coins/markets`, {
        params: {
          vs_currency: "usd",
          ids: coinIds,
          order: "market_cap_desc",
        },
      });

      setCacheData(cacheKey, detailedData);
      return detailedData;
    }

    return [];
  } catch (error: any) {
    console.error("Error searching cryptos:", error);
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded for search.");
    }
    return [];
  }
}

export async function fetchFearAndGreedIndex() {
  const cacheKey = "fear_greed";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();
    const { data } = await axios.get("https://api.alternative.me/fng/");
    const result = {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
    };
    setCacheData(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error("Error fetching Fear and Greed Index:", error);
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded for Fear & Greed Index.");
    }
    return null;
  }
}
