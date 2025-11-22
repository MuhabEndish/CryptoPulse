import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData } from "../services/cryptoApi";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Favorites() {
  const user = useAuth();
  const [coins, setCoins] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    if (!user) return;
    const { data } = await supabase
      .from("favorite_cryptos")
      .select("coin_id")
      .eq("user_id", user.id);

    setFavorites(data?.map((row) => row.coin_id) ?? []);
  }

  async function loadCoins() {
    const market = await fetchMarketData();
    setCoins(market);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFavorites(), loadCoins()]).then(() => {
      setLoading(false);
    });
  }, [user]);

  if (!user) return <a href="/auth">Login to continue</a>;

  const filtered = coins.filter((c) => favorites.includes(c.id));

  return (
    <div className="container">
      <Navbar />
      <h1 style={{ marginBottom: "20px" }}>💜 Your Favorite Coins</h1>

      {loading ? (
        <LoadingSpinner size="medium" message="Loading favorites..." />
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.6 }}>No favorites yet. Go add some!</p>
      ) : (
        filtered.map((coin) => (
        <div
          key={coin.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: "var(--card)",
            borderRadius: "10px",
            marginBottom: "12px",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={coin.image} alt="" width={30} />
            <div>
              <div style={{ fontWeight: "600" }}>{coin.name}</div>
              <div style={{ opacity: 0.6 }}>{coin.symbol.toUpperCase()}</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div>${coin.current_price.toLocaleString()}</div>
            <div
              style={{
                color: coin.price_change_percentage_24h > 0 ? "lime" : "red",
                fontSize: "0.9rem",
              }}
            >
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  );
}
