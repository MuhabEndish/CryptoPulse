import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { fetchMarketData } from "../services/cryptoApi";
import { supabase } from "../services/supabase";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function CoinDetail() {
  const { id } = useParams();
  const user = useAuth();

  const [coin, setCoin] = useState<any>(null);
  const [range, setRange] = useState("1"); // 1D default
  const [chartData, setChartData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadCoin() {
    const market = await fetchMarketData();
    setCoin(market.find((c: any) => c.id === id));
  }

  async function loadChart() {
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
    if (!user) return;

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
    setLoading(true);
    Promise.all([loadCoin(), loadFavorite(), loadChart()]).then(() => {
      setLoading(false);
    });
  }, [id, user]);

  useEffect(() => {
    loadChart();
  }, [range]);

  if (loading) {
    return (
      <div className="container">
        <Navbar />
        <LoadingSpinner size="large" message="Loading coin details..." />
      </div>
    );
  }

  if (!coin) return <p style={{ textAlign: "center" }}>Coin not found</p>;

  return (
    <div className="container">
      <Navbar />

      <div
        className="card"
        style={{
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <img
          src={coin.image}
          alt={coin.name}
          width={70}
          height={70}
          style={{
            width: "clamp(50px, 10vw, 80px)",
            height: "clamp(50px, 10vw, 80px)",
            objectFit: "contain",
          }}
        />
        <h1 style={{
          marginTop: "10px",
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
        }}>
          {coin.name}
        </h1>

        <h2 style={{
          marginTop: "5px",
          fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)",
          color: "var(--accent)",
        }}>
          ${coin.current_price.toLocaleString()}
        </h2>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginTop: "15px",
          fontSize: "clamp(13px, 2.5vw, 15px)",
          flexWrap: "wrap",
        }}>
          <div style={{ opacity: 0.8 }}>
            <div style={{ fontSize: "0.85em", opacity: 0.7 }}>24h Change</div>
            <div style={{
              color: coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444",
              fontWeight: "600",
            }}>
              {coin.price_change_percentage_24h > 0 ? "↑" : "↓"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>
          <div style={{ opacity: 0.8 }}>
            <div style={{ fontSize: "0.85em", opacity: 0.7 }}>Market Cap</div>
            <div style={{ fontWeight: "600" }}>
              ${(coin.market_cap / 1e9).toFixed(2)}B
            </div>
          </div>
        </div>

        <button
          className="btn-touch"
          onClick={toggleFavorite}
          style={{
            background: favorite ? "var(--accent)" : "var(--card)",
            borderRadius: "10px",
            padding: "clamp(10px, 2.5vw, 14px) clamp(18px, 4vw, 24px)",
            marginTop: "15px",
            cursor: "pointer",
            border: favorite ? "none" : "1px solid rgba(139, 92, 246, 0.4)",
            color: "white",
            fontWeight: 600,
            fontSize: "clamp(14px, 2.5vw, 16px)",
            boxShadow: favorite ? "0 4px 15px rgba(139, 92, 246, 0.4)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          {favorite ? "💜 Favorited" : "♡ Add to Favorites"}
        </button>
      </div>

      <div
        className="flex-responsive"
        style={{
          textAlign: "center",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        {[
          { label: "1D", value: "1" },
          { label: "7D", value: "7" },
          { label: "30D", value: "30" },
          { label: "90D", value: "90" },
          { label: "1Y", value: "365" },
        ].map((d) => (
          <button
            className="btn-touch"
            key={d.value}
            onClick={() => setRange(d.value)}
            style={{
              padding: "clamp(8px, 2vw, 12px) clamp(14px, 3vw, 18px)",
              borderRadius: "8px",
              background: range === d.value ? "var(--accent)" : "var(--card)",
              border: range === d.value ? "none" : "1px solid rgba(139, 92, 246, 0.3)",
              color: "white",
              fontSize: "clamp(13px, 2.5vw, 15px)",
              fontWeight: range === d.value ? "600" : "400",
              boxShadow: range === d.value ? "0 4px 12px rgba(139, 92, 246, 0.4)" : "none",
              transition: "all 0.3s ease",
              flex: "1 1 auto",
              minWidth: "60px",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div
        className="card"
        style={{
          marginTop: "20px",
          padding: "clamp(12px, 3vw, 20px)",
        }}
      >
        <Line
          data={{
            labels: timestamps,
            datasets: [
              {
                data: chartData,
                borderColor: "#a855f7",
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: window.innerWidth < 768 ? 1.5 : 2,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false,
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.6)",
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12,
                  },
                  maxRotation: 45,
                  minRotation: 0,
                },
              },
              y: {
                display: true,
                grid: {
                  color: "rgba(139, 92, 246, 0.1)",
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.6)",
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12,
                  },
                  callback: function(value: any) {
                    return '$' + value.toLocaleString();
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
