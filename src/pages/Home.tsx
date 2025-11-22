import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData } from "../services/cryptoApi";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const user = useAuth();
  const [coins, setCoins] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "price" | "change">("rank");
  const [filterBy, setFilterBy] = useState<"all" | "favorites">("all");
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    if (!user) return;
    const { data } = await supabase
      .from("favorite_cryptos")
      .select("coin_id")
      .eq("user_id", user.id);

    setFavorites(data?.map((row) => row.coin_id) ?? []);
  }

  useEffect(() => {
    setLoading(true);
    fetchMarketData().then((data) => {
      setCoins(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  async function toggleFavorite(coinId: string) {
    if (!user) return;

    if (favorites.includes(coinId)) {
      await supabase.from("favorite_cryptos").delete().match({
        user_id: user.id,
        coin_id: coinId,
      });
    } else {
      await supabase.from("favorite_cryptos").insert({
        user_id: user.id,
        coin_id: coinId,
      });
    }

    loadFavorites();
  }

  if (!user) return <a href="/auth">Login to continue</a>;

  // Filter by search
  let filtered = coins.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter by favorites
  if (filterBy === "favorites") {
    filtered = filtered.filter((c) => favorites.includes(c.id));
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rank") return a.market_cap_rank - b.market_cap_rank;
    if (sortBy === "price") return b.current_price - a.current_price;
    if (sortBy === "change")
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
    return 0;
  });

  return (
    <div className="container">
      <Navbar />
      <h1 style={{ marginBottom: "20px" }}>🔥 Crypto Social Tracker</h1>

      <input
        placeholder="Search cryptocurrency..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "15px",
          background: "var(--card)",
          color: "white",
        }}
      />

      {/* Filter and Sort Controls */}
      <div
        className="flex-responsive"
        style={{
          marginBottom: "20px",
        }}
      >
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as any)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--card)",
            color: "white",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            cursor: "pointer",
            flex: "1 1 140px",
            minWidth: "140px",
            fontSize: "clamp(13px, 2vw, 15px)",
            transition: "all 0.3s ease",
          }}
        >
          <option value="all">All Coins</option>
          <option value="favorites">⭐ Favorites Only</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--card)",
            color: "white",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            cursor: "pointer",
            flex: "1 1 140px",
            minWidth: "140px",
            fontSize: "clamp(13px, 2vw, 15px)",
            transition: "all 0.3s ease",
          }}
        >
          <option value="rank">Sort by Rank</option>
          <option value="price">Sort by Price</option>
          <option value="change">Sort by 24h Change</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="medium" message="Loading cryptocurrencies..." />
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
          <p>No cryptocurrencies found.</p>
        </div>
      ) : (
        sorted.map((coin) => (
        <div
          key={coin.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "clamp(12px, 3vw, 18px)",
            background: "var(--card)",
            borderRadius: "10px",
            marginBottom: "12px",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.2)",
            transition: "all 0.3s ease",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Left side */}
          <div
            onClick={() => (window.location.href = `/coin/${coin.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 2vw, 12px)",
              cursor: "pointer",
              flex: "1 1 auto",
              minWidth: "150px",
            }}
          >
            <img
              src={coin.image}
              alt={coin.name}
              width={30}
              height={30}
              style={{
                width: "clamp(24px, 5vw, 30px)",
                height: "clamp(24px, 5vw, 30px)",
                objectFit: "contain",
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: "600",
                fontSize: "clamp(14px, 2.5vw, 16px)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {coin.name}
              </div>
              <div style={{
                opacity: 0.6,
                fontSize: "clamp(12px, 2vw, 14px)",
              }}>
                {coin.symbol.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Price */}
          <div style={{
            textAlign: "right",
            flex: "0 1 auto",
            minWidth: "100px",
          }}>
            <div style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: "600",
            }}>
              ${coin.current_price.toLocaleString()}
            </div>
            <div
              style={{
                color: coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444",
                fontSize: "clamp(12px, 2vw, 14px)",
                fontWeight: "500",
              }}
            >
              {coin.price_change_percentage_24h > 0 ? "↑" : "↓"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>

          {/* Favorite Button */}
          <div
            onClick={() => toggleFavorite(coin.id)}
            style={{
              cursor: "pointer",
              fontSize: "clamp(20px, 4vw, 24px)",
              color: favorites.includes(coin.id) ? "#a855f7" : "#555",
              transition: "all 0.3s ease",
              padding: "4px 8px",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ♥
          </div>
        </div>
        ))
      )}

      <button
        onClick={async () => await supabase.auth.signOut()}
        style={{
          background: "var(--accent)",
          padding: "10px",
          borderRadius: "8px",
          marginTop: "30px",
          width: "100%",
        }}
      >
        Logout
      </button>
    </div>
  );
}
