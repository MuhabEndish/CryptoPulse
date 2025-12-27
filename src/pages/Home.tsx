import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData, fetchFearAndGreedIndex } from "../services/cryptoApi";
import LoadingSpinner from "../components/LoadingSpinner";
import PriceAlertModal from "../components/PriceAlertModal";

export default function Home() {
  const user = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"1H" | "24H" | "7D">("24H");
  const [fearGreedIndex, setFearGreedIndex] = useState<{value: number, classification: string} | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

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
  }, [timeframe]); // Refetch when timeframe changes

  useEffect(() => {
    loadFavorites();
  }, [user]);

  useEffect(() => {
    fetchFearAndGreedIndex().then((data) => {
      setFearGreedIndex(data);
    });
  }, []);

  async function toggleFavorite(coinId: string) {
    if (!user) {
      navigate('/auth');
      return;
    }

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

  function openAlertModal(coin: any) {
    setSelectedCoin(coin);
    setAlertModalOpen(true);
  }

  // Show loading while checking auth
  if (user === undefined || loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Get top coins for KPIs
  const btc = coins.find(c => c.id === "bitcoin");
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const avgChange = coins.length > 0
    ? coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track crypto prices and market sentiment</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 bg-dark-card rounded-lg p-1 border border-dark-border">
          {(["1H", "24H", "7D"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                timeframe === tf
                  ? "bg-primary text-white shadow-glow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* BTC Price */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Bitcoin Price</span>
            <span className="text-2xl">₿</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${btc ? btc.current_price.toLocaleString() : "—"}
          </div>
          <div className={`text-sm font-medium ${btc && btc.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {btc ? `${btc.price_change_percentage_24h > 0 ? '↑' : '↓'} ${Math.abs(btc.price_change_percentage_24h).toFixed(2)}%` : '—'}
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Total Market Cap</span>
            <span className="text-2xl">💹</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${(totalMarketCap / 1e12).toFixed(2)}T
          </div>
          <div className="text-sm text-gray-400">
            {coins.length} coins tracked
          </div>
        </div>

        {/* 24h Change */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Avg 24h Change</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${avgChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgChange > 0 ? '↑' : '↓'} {Math.abs(avgChange).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">
            Market average
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all cursor-pointer"
             onClick={() => navigate('/favorites')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">My Watchlist</span>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {favorites.length}
          </div>
          <div className="text-sm text-primary font-medium">
            View all →
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Fear & Greed</span>
            <span className="text-2xl">😱</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${
            !fearGreedIndex ? 'text-gray-400' :
            fearGreedIndex.value <= 25 ? 'text-red-500' :
            fearGreedIndex.value <= 45 ? 'text-orange-400' :
            fearGreedIndex.value <= 55 ? 'text-yellow-400' :
            fearGreedIndex.value <= 75 ? 'text-green-400' :
            'text-green-500'
          }`}>
            {fearGreedIndex ? fearGreedIndex.value : '—'}
          </div>
          <div className="text-sm text-gray-400">
            {fearGreedIndex ? fearGreedIndex.classification : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Trending Coins Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🔥 Trending Coins</h2>
          <button className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
            View All
          </button>
        </div>

        {/* Coins Table */}
        <div className="space-y-3">
          {coins.slice(0, 10).map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/${coin.id}`)}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-dark transition-all cursor-pointer group"
            >
              {/* Left: Rank, Logo, Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-gray-500 font-medium w-6">{index + 1}</span>
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white group-hover:text-primary transition-colors">
                    {coin.name}
                  </div>
                  <div className="text-sm text-gray-400 uppercase">
                    {coin.symbol}
                  </div>
                </div>
              </div>

              {/* Middle: Price */}
              <div className="text-right px-4 hidden sm:block">
                <div className="font-semibold text-white">
                  ${coin.current_price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
                </div>
              </div>

              {/* Right: Change & Actions */}
              <div className="flex items-center gap-3">
                <div className={`font-semibold ${
                  coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.price_change_percentage_24h > 0 ? '↑' : '↓'}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(coin.id);
                  }}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    favorites.includes(coin.id) ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {favorites.includes(coin.id) ? '★' : '☆'}
                </button>

                {/* Alert Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAlertModal(coin);
                  }}
                  className="text-xl text-gray-600 hover:text-yellow-400 transition-all"
                  title="Set Alert"
                >
                  🔔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">💬 Trending Topics</h2>
        <div className="flex flex-wrap gap-2">
          {['#Bitcoin', '#Ethereum', '#DeFi', '#NFT', '#Altseason', '#BullRun'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
              className="px-4 py-2 bg-dark rounded-lg text-primary hover:bg-primary hover:text-white transition-all font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Price Alert Modal */}
      {selectedCoin && user && (
        <PriceAlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          coin={selectedCoin}
          userId={user.id}
        />
      )}
    </div>
  );
}
