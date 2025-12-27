import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchMarketData } from "../services/cryptoApi";
import { supabase } from "../services/supabase";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function CoinDetail() {
  const { id } = useParams();
  const user = useAuth();
  const navigate = useNavigate();

  const [coin, setCoin] = useState<any>(null);
  const [range, setRange] = useState("1");
  const [chartData, setChartData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "sentiment" | "prediction" | "news">("overview");

  async function loadCoin() {
    const market = await fetchMarketData();
    const foundCoin = market.find((c: any) => c.id === id);
    setCoin(foundCoin);
    setLoading(false);
  }

  async function loadChart() {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${range}`
      );
      const data = await res.json();

      setChartData(data.prices.map((p: any) => p[1]));
      setTimestamps(
        data.prices.map((p: any) =>
          new Date(p[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        )
      );
    } catch (error) {
      console.error("Error loading chart:", error);
    }
  }

  async function loadFavorite() {
    if (!user) return;
    const { data } = await supabase
      .from("favorite_cryptos")
      .select("coin_id")
      .eq("user_id", user.id)
      .eq("coin_id", id)
      .maybeSingle();

    setFavorite(!!data);
  }

  async function toggleFavorite() {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (favorite) {
      await supabase
        .from("favorite_cryptos")
        .delete()
        .match({ user_id: user.id, coin_id: id });
    } else {
      await supabase.from("favorite_cryptos").insert({
        user_id: user.id,
        coin_id: id,
      });
    }

    loadFavorite();
  }

  useEffect(() => {
    loadCoin();
    loadFavorite();
  }, [id, user]);

  useEffect(() => {
    if (coin) {
      loadChart();
    }
  }, [range, coin]);

  if (loading || !coin) {
    return (
      <div style={{ padding: "60px 0" }}>
        <LoadingSpinner size="large" message="Loading coin details..." />
      </div>
    );
  }

  const chartConfig = {
    labels: timestamps,
    datasets: [
      {
        label: `${coin.name} Price (USD)`,
        data: chartData,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(139, 92, 246, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Coin Info and Actions */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-wrap gap-6 items-center justify-between shadow-glow">
        <div className="flex items-center gap-4">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-16 h-16 rounded-full border-2 border-primary"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {coin.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-lg uppercase">
                {coin.symbol}
              </span>
              <span className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-md text-sm font-medium">
                Rank #{coin.market_cap_rank}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              ${coin.current_price.toLocaleString()}
            </div>
            <div className={`text-lg font-semibold ${
              coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {coin.price_change_percentage_24h > 0 ? "▲" : "▼"}{" "}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className={`px-4 py-3 rounded-lg text-xl transition-all ${
                favorite
                  ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 hover:bg-opacity-30'
                  : 'bg-dark-card border border-dark-border hover:border-primary'
              }`}
              title={favorite ? "Remove from watchlist" : "Add to watchlist"}
            >
              {favorite ? "★" : "☆"}
            </button>
            <button
              onClick={() => alert("Alert feature coming soon!")}
              className="px-4 py-3 rounded-lg text-xl bg-dark-card border border-dark-border hover:border-primary transition-all"
              title="Set price alert"
            >
              🔔
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <nav className="flex border-b border-dark-border overflow-x-auto">
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-dark"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === "sentiment"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-dark"
            }`}
            onClick={() => setActiveTab("sentiment")}
          >
            💬 Social Sentiment
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === "prediction"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-dark"
            }`}
            onClick={() => setActiveTab("prediction")}
          >
            📈 Prediction
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === "news"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-dark"
            }`}
            onClick={() => setActiveTab("news")}
          >
            📰 News
          </button>
        </nav>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Chart Controls */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-white">Price Chart</h2>
                <div className="flex gap-2">
                  {[
                    { label: "1D", value: "1" },
                    { label: "7D", value: "7" },
                    { label: "30D", value: "30" },
                    { label: "1Y", value: "365" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRange(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        range === option.value
                          ? "bg-primary text-white shadow-glow"
                          : "bg-dark text-gray-400 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="bg-dark rounded-xl p-4">
                <Line data={chartConfig} options={chartOptions} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark rounded-xl p-4 border border-dark-border">
                  <div className="text-sm text-gray-400 mb-2">Market Cap</div>
                  <div className="text-xl font-bold text-white">
                    ${(coin.market_cap / 1e9).toFixed(2)}B
                  </div>
                </div>
                <div className="bg-dark rounded-xl p-4 border border-dark-border">
                  <div className="text-sm text-gray-400 mb-2">24h Volume</div>
                  <div className="text-xl font-bold text-white">
                    ${(coin.total_volume / 1e9).toFixed(2)}B
                  </div>
                </div>
                <div className="bg-dark rounded-xl p-4 border border-dark-border">
                  <div className="text-sm text-gray-400 mb-2">Circulating Supply</div>
                  <div className="text-xl font-bold text-white">
                    {coin.circulating_supply ? (coin.circulating_supply / 1e6).toFixed(2) + "M" : "N/A"}
                  </div>
                </div>
                <div className="bg-dark rounded-xl p-4 border border-dark-border">
                  <div className="text-sm text-gray-400 mb-2">All-Time High</div>
                  <div className="text-xl font-bold text-white">
                    ${coin.ath ? coin.ath.toLocaleString() : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sentiment" && (
            <div className="bg-dark border border-dark-border rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-3">Social Sentiment Analysis</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Track social media sentiment, trending discussions, and community engagement for {coin.name}.
              </p>
              <p className="mt-6 text-primary font-medium">Coming Soon!</p>
            </div>
          )}

          {activeTab === "prediction" && (
            <div className="bg-dark border border-dark-border rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-bold text-white mb-3">Price Prediction</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                AI-powered price predictions and forecasting models for {coin.name} based on historical data and market trends.
              </p>
              <p className="mt-6 text-primary font-medium">Coming Soon!</p>
            </div>
          )}

          {activeTab === "news" && (
            <div className="bg-dark border border-dark-border rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-bold text-white mb-3">Latest News</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stay updated with the latest news, announcements, and developments about {coin.name}.
              </p>
              <p className="mt-6 text-primary font-medium">Coming Soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
