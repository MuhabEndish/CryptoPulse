import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { fetchMarketData } from "../services/cryptoApi";
import LoadingSpinner from "../components/LoadingSpinner";
import PriceAlertModal from "../components/PriceAlertModal";
import {
  AiFillFire as FireOutlined,
  AiFillStar as StarFilled,
  AiOutlineStar as StarOutlined,
  AiFillBell as BellFilled,
  AiOutlineArrowUp as ArrowUpOutlined,
  AiOutlineArrowDown as ArrowDownOutlined
} from 'react-icons/ai';

export default function Market() {
  const user = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [user]);

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
        <LoadingSpinner size="large" message="Loading market data..." />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Market</h1>
          <p className="text-gray-400 mt-1">Explore and compare cryptocurrency prices</p>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Coins</div>
          <div className="text-2xl font-bold text-white">{coins.length}</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Market Cap</div>
          <div className="text-2xl font-bold text-white">
            ${(coins.reduce((sum, c) => sum + (c.market_cap || 0), 0) / 1e12).toFixed(2)}T
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">
            ${(coins.reduce((sum, c) => sum + (c.total_volume || 0), 0) / 1e9).toFixed(2)}B
          </div>
        </div>
      </div>

      {/* Coins Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FireOutlined className="text-2xl text-orange-500" />
            All Cryptocurrencies
          </h2>
        </div>

        <div className="space-y-3">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/${coin.id}`)}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-dark transition-all cursor-pointer group"
            >
              {/* Left: Rank, Logo, Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-gray-500 font-medium w-8 text-right">{index + 1}</span>
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-10 h-10 rounded-full"
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

              {/* Middle: Price & Market Cap */}
              <div className="text-right px-4 hidden md:block">
                <div className="font-semibold text-white">
                  ${coin.current_price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
                </div>
              </div>

              {/* Middle: Volume (Desktop) */}
              <div className="text-right px-4 hidden lg:block">
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="font-medium text-white">
                  ${(coin.total_volume / 1e9).toFixed(2)}B
                </div>
              </div>

              {/* Right: Change & Actions */}
              <div className="flex items-center gap-3">
                <div className={`font-semibold min-w-[80px] text-right flex items-center gap-1 justify-end ${
                  coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.price_change_percentage_24h > 0 ?
                    <ArrowUpOutlined className="text-lg" /> :
                    <ArrowDownOutlined className="text-lg" />
                  }
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
                  title="Add to Watchlist"
                >
                  {favorites.includes(coin.id) ?
                    <StarFilled className="text-2xl" /> :
                    <StarOutlined className="text-2xl" />
                  }
                </button>

                {/* Alert Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAlertModal(coin);
                  }}
                  className="text-xl text-gray-600 hover:text-yellow-400 transition-all"
                  title="Set Price Alert"
                >
                  <BellFilled className="text-xl" />
                </button>
              </div>
            </div>
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
