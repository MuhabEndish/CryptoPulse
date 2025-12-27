import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useToast } from "./ToastProvider";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
  };
  userId: string;
}

export default function PriceAlertModal({ isOpen, onClose, coin, userId }: PriceAlertModalProps) {
  const { showToast } = useToast();
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetPrice(coin.current_price.toString());
    }
  }, [isOpen, coin.current_price]);

  async function handleSetAlert() {
    if (!targetPrice || isNaN(Number(targetPrice))) {
      showToast("Please enter a valid price", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("price_alerts").insert({
        user_id: userId,
        coin_id: coin.id,
        coin_name: coin.name,
        coin_symbol: coin.symbol,
        target_price: Number(targetPrice),
        condition: condition,
        is_active: true,
      });

      if (error) throw error;

      showToast(`Alert set for ${coin.name}`, "success");
      onClose();
    } catch (error: any) {
      console.error("Error setting alert:", error);
      showToast(error.message || "Failed to set alert", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Set Price Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Coin Info */}
        <div className="bg-dark rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-semibold">{coin.name}</span>
            <span className="text-gray-400 uppercase text-sm">{coin.symbol}</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            ${coin.current_price.toLocaleString()}
          </div>
        </div>

        {/* Alert Form */}
        <div className="space-y-4">
          {/* Condition Selector */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Alert when price goes</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCondition("above")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  condition === "above"
                    ? "bg-primary text-white"
                    : "bg-dark text-gray-400 hover:text-white"
                }`}
              >
                Above
              </button>
              <button
                onClick={() => setCondition("below")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  condition === "below"
                    ? "bg-primary text-white"
                    : "bg-dark text-gray-400 hover:text-white"
                }`}
              >
                Below
              </button>
            </div>
          </div>

          {/* Target Price Input */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Target Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              placeholder="Enter target price"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-dark text-gray-400 rounded-lg font-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSetAlert}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting..." : "Set Alert"}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-gray-500 text-xs mt-4 text-center">
          You'll be notified when {coin.symbol.toUpperCase()} reaches your target price
        </p>
      </div>
    </div>
  );
}
