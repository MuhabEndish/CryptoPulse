import axios from "axios";

const API_BASE = "https://api.coingecko.com/api/v3";

export async function fetchMarketData() {
  const { data } = await axios.get(`${API_BASE}/coins/markets`, {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 100,
      page: 1,
      price_change_percentage: "24h",
    },
  });

  return data;
}

export async function searchCryptos(query: string) {
  try {
    const { data } = await axios.get(`${API_BASE}/search`, {
      params: {
        query: query,
      },
    });

    // Get detailed info for top 10 results
    if (data.coins && data.coins.length > 0) {
      const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id).join(",");

      const { data: detailedData } = await axios.get(`${API_BASE}/coins/markets`, {
        params: {
          vs_currency: "usd",
          ids: coinIds,
          order: "market_cap_desc",
        },
      });

      return detailedData;
    }

    return [];
  } catch (error) {
    console.error("Error searching cryptos:", error);
    return [];
  }
}
