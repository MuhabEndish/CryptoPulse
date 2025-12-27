import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData } from "../services/cryptoApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const filtered = coins.filter((c) => favorites.includes(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">⭐ Watchlist</h1>
        <p className="text-gray-400">Your favorite cryptocurrencies</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" message="Loading favorites..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No favorites yet. Go add some!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
          >
            Browse Coins
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((coin) => (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/${coin.id}`)}
              className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-lg hover:shadow-glow transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-semibold text-white group-hover:text-primary transition-colors">
                    {coin.name}
                  </div>
                  <div className="text-sm text-gray-400 uppercase">{coin.symbol}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-white">
                  ${coin.current_price.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${
                  coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.price_change_percentage_24h > 0 ? '↑' : '↓'}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
