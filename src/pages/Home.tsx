import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData, fetchFearAndGreedIndex } from "../services/cryptoApi";
import LoadingSpinner from "../components/LoadingSpinner";
import PriceAlertModal from "../components/PriceAlertModal";
import FearGreedGauge from "../components/FearGreedGauge";
import {
  AiOutlineArrowUp as ArrowUpOutlined,
  AiOutlineArrowDown as ArrowDownOutlined,
  AiOutlineMinus as MinusOutlined,
  AiOutlineRise as RiseOutlined,
  AiOutlineStock as StockOutlined,
  AiOutlineLineChart as LineChartOutlined,
  AiOutlineStar as StarOutlined,
  AiOutlineFire as FireOutlined,
  AiOutlineFall as FallOutlined,
  AiOutlineMessage as MessageOutlined,
  AiOutlineBarChart as BarChartOutlined,
  AiOutlineArrowRight as ArrowRightOutlined,
  AiOutlineThunderbolt as ThunderboltOutlined
} from 'react-icons/ai';

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
      navigate('/login');
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
    navigate('/login');
    return null;
  }

  // Get top coins for KPIs and insights
  const btc = coins.find(c => c.id === "bitcoin");
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const avgChange = coins.length > 0
    ? coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length
    : 0;

  // Quick Insights
  const topGainer = coins.length > 0
    ? coins.reduce((max, coin) => coin.price_change_percentage_24h > max.price_change_percentage_24h ? coin : max, coins[0])
    : null;

  const topLoser = coins.length > 0
    ? coins.reduce((min, coin) => coin.price_change_percentage_24h < min.price_change_percentage_24h ? coin : min, coins[0])
    : null;

  // Market mood based on average change
  const marketMood = avgChange > 2 ? "Bullish" : avgChange < -2 ? "Bearish" : "Neutral";
  const marketMoodIcon = avgChange > 2 ? <ArrowUpOutlined /> : avgChange < -2 ? <ArrowDownOutlined /> : <MinusOutlined />;
  const marketMoodColor = avgChange > 2 ? "text-green-400" : avgChange < -2 ? "text-red-400" : "text-gray-400";

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
            <span className="text-2xl text-orange-500">₿</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${btc ? btc.current_price.toLocaleString() : "—"}
          </div>
          <div className={`text-sm font-medium flex items-center gap-1 ${
            btc && btc.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {btc && (
              <>
                {btc.price_change_percentage_24h > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(btc.price_change_percentage_24h).toFixed(2)}%
              </>
            )}
            {!btc && '—'}
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Total Market Cap</span>
            <RiseOutlined className="text-2xl" />
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
            <LineChartOutlined className="text-2xl" />
          </div>
          <div className={`text-2xl font-bold mb-1 flex items-center gap-1 ${
            avgChange > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {avgChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(avgChange).toFixed(2)}%
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
            <StarOutlined className="text-2xl text-primary" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {favorites.length}
          </div>
          <div className="text-sm text-primary font-medium flex items-center gap-1">
            View all <ArrowRightOutlined className="text-sm" />
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Fear & Greed</span>
          </div>
          {fearGreedIndex ? (
            <FearGreedGauge
              value={fearGreedIndex.value}
              classification={fearGreedIndex.classification}
            />
          ) : (
            <div className="flex items-center justify-center h-[140px]">
              <LoadingSpinner size="small" />
            </div>
          )}
        </div>
      </div>

      {/* Trending Coins Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChartOutlined className="text-xl" /> Market Snapshot
          </h2>
        </div>

        {/* Market Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Market Mood */}
          <div className="bg-dark rounded-lg p-4 border border-dark-border">
            <div className="text-sm text-gray-400 mb-2">Market Mood</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${marketMoodColor}`}>
              {marketMoodIcon}
              <span>{marketMood}</span>
            </div>
          </div>

          {/* BTC Context */}
          <div className="bg-dark rounded-lg p-4 border border-dark-border">
            <div className="text-sm text-gray-400 mb-2">Bitcoin Context</div>
            <div className="text-lg font-semibold text-white">
              {btc ? `$${btc.current_price.toLocaleString()}` : "—"}
            </div>
            <div className={`text-sm font-medium flex items-center gap-1 ${
              btc && btc.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {btc && (
                <>
                  {btc.price_change_percentage_24h > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(btc.price_change_percentage_24h).toFixed(2)}%
                </>
              )}
              {!btc && '—'}
            </div>
          </div>

          {/* Fear & Greed Summary */}
          <div className="bg-dark rounded-lg p-4 border border-dark-border">
            <div className="text-sm text-gray-400 mb-2">Fear & Greed</div>
            <div className="text-lg font-semibold text-white">
              {fearGreedIndex ? fearGreedIndex.classification : "Loading..."}
            </div>
            <div className="text-sm text-gray-400">
              {fearGreedIndex ? `${fearGreedIndex.value}/100` : "—"}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ThunderboltOutlined className="text-xl" /> Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Gainer */}
            {topGainer && (
              <div
                onClick={() => navigate(`/coin/${topGainer.id}`)}
                className="bg-dark rounded-lg p-4 border border-green-500/30 hover:border-green-500 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <FireOutlined /> Top Gainer
                  </div>
                  <div className="text-green-400 text-xl font-bold flex items-center gap-1">
                    <ArrowUpOutlined /> {topGainer.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img src={topGainer.image} alt={topGainer.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-semibold text-white group-hover:text-green-400 transition-colors">
                      {topGainer.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${topGainer.current_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Loser */}
            {topLoser && (
              <div
                onClick={() => navigate(`/coin/${topLoser.id}`)}
                className="bg-dark rounded-lg p-4 border border-red-500/30 hover:border-red-500 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <FallOutlined /> Top Loser
                  </div>
                  <div className="text-red-400 text-xl font-bold flex items-center gap-1">
                    <ArrowDownOutlined /> {Math.abs(topLoser.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img src={topLoser.image} alt={topLoser.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-semibold text-white group-hover:text-red-400 transition-colors">
                      {topLoser.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${topLoser.current_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Full Market Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/market')}
            className="text-primary hover:text-primary-light font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            View full market rankings <ArrowRightOutlined className="text-base" />
          </button>
        </div>
      </div>

      {/* Social Pulse - Trending Topics */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageOutlined /> Social Pulse
          </h2>
          <button
            onClick={() => navigate('/feed')}
            className="text-sm text-primary hover:text-primary-light font-medium transition-colors flex items-center gap-1"
          >
            View Social <ArrowRightOutlined className="text-sm" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['#Bitcoin', '#Ethereum', '#DeFi', '#Altseason', '#BullRun'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
              className="px-3 py-1.5 bg-dark rounded-lg text-sm text-primary hover:bg-primary hover:text-white transition-all font-medium"
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
