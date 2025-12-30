import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";
import {
  AiOutlineRise,
  AiOutlineFall,
  AiOutlineBell,
  AiOutlineCheck,
  AiOutlineBulb,
  AiOutlineMuted
} from "react-icons/ai";

interface PriceAlert {
  id: string;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  target_price: number;
  condition: "above" | "below";
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export default function Alerts() {
  const user = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
      return;
    }
    loadAlerts();
  }, [user, navigate]);

  async function loadAlerts() {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error loading alerts:", error);
      showToast("Failed to load alerts", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAlert(alertId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !currentStatus })
        .eq("id", alertId);

      if (error) throw error;
      showToast(`Alert ${!currentStatus ? "activated" : "deactivated"}`, "success");
      loadAlerts();
    } catch (error) {
      console.error("Error updating alert:", error);
      showToast("Failed to update alert", "error");
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      showToast("Alert deleted", "success");
      setDeleteConfirm(null);
      loadAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
      showToast("Failed to delete alert", "error");
    }
  }

  if (user === undefined || loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" message="Loading alerts..." />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
          <p className="text-gray-400 mt-1">Manage your cryptocurrency price alerts</p>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <AiOutlineBell className="text-6xl mb-4 mx-auto text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
          <p className="text-gray-400 mb-6">
            Set price alerts from the market to get notified when cryptocurrencies reach your target price
          </p>
          <button
            onClick={() => navigate("/market")}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
          >
            Go to Market
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-dark-card border rounded-xl p-6 transition-all ${
                alert.is_active
                  ? "border-primary hover:shadow-glow"
                  : "border-dark-border opacity-60"
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">
                      {alert.coin_name}
                    </span>
                    <span className="text-sm text-gray-400 uppercase">
                      {alert.coin_symbol}
                    </span>
                  </div>
                  {alert.triggered_at && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <AiOutlineCheck /> Triggered
                    </span>
                  )}
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    alert.is_active ? "text-primary" : "text-gray-600"
                  }`}
                  title={alert.is_active ? "Deactivate" : "Activate"}
                >
                  {alert.is_active ? <AiOutlineBell /> : <AiOutlineMuted />}
                </button>
              </div>

              {/* Alert Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Condition:</span>
                  <span className={`font-semibold flex items-center gap-1 ${
                    alert.condition === "above" ? "text-green-400" : "text-red-400"
                  }`}>
                    {alert.condition === "above" ? <><AiOutlineRise /> Above</> : <><AiOutlineFall /> Below</>}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Target Price:</span>
                  <span className="text-white font-bold">
                    ${parseFloat(alert.target_price.toString()).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Created:</span>
                  <span className="text-gray-300 text-sm">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-dark-border">
                <button
                  onClick={() => navigate(`/coin/${alert.coin_id}`)}
                  className="flex-1 py-2 px-4 bg-dark text-gray-300 rounded-lg text-sm font-medium hover:text-white transition-colors"
                >
                  View Coin
                </button>
                <button
                  onClick={() => setDeleteConfirm(alert.id)}
                  className="py-2 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {alerts.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AiOutlineBulb className="text-2xl text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold mb-1">How it works</h4>
              <p className="text-gray-400 text-sm">
                Active alerts will monitor cryptocurrency prices. When a coin reaches your target price,
                the alert will be triggered. Toggle the bell icon to activate/deactivate alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 99999 }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-dark-card border border-red-500/30 rounded-xl max-w-md w-full my-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-xl font-bold text-white">Delete Alert</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-400 hover:text-white transition-colors text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this price alert? This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-dark text-gray-400 rounded-lg font-medium hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAlert(deleteConfirm)}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
