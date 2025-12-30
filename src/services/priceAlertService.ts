import { supabase } from "./supabase";
import { fetchMarketData } from "./cryptoApi";

interface PriceAlert {
  id: string;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  target_price: number;
  condition: "above" | "below";
  is_active: boolean;
  triggered_at: string | null;
}

export class PriceAlertService {
  private checkInterval: number | null = null;
  private onAlertTriggered?: (alert: PriceAlert, currentPrice: number) => void;

  constructor(onAlertTriggered?: (alert: PriceAlert, currentPrice: number) => void) {
    this.onAlertTriggered = onAlertTriggered;
  }

  // Start monitoring price alerts
  async startMonitoring(userId: string, intervalMinutes: number = 5) {
    console.log("Starting price alert monitoring...");

    // Check immediately
    await this.checkAlerts(userId);

    // Then check every X minutes
    this.checkInterval = setInterval(
      () => this.checkAlerts(userId),
      intervalMinutes * 60 * 1000
    );
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("Stopped price alert monitoring");
    }
  }

  // Check all active alerts for a user
  async checkAlerts(userId: string) {
    try {
      // Get user's active alerts
      const { data: alerts, error: alertsError } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .is("triggered_at", null);

      if (alertsError) {
        console.error("Error fetching alerts:", alertsError);
        return;
      }

      if (!alerts || alerts.length === 0) {
        return;
      }

      // Get current market prices
      const marketData = await fetchMarketData();
      const priceMap = new Map(
        marketData.map((coin: any) => [coin.id, coin.current_price])
      );

      // Check each alert
      for (const alert of alerts) {
        const currentPrice = priceMap.get(alert.coin_id);

        if (!currentPrice || typeof currentPrice !== 'number') continue;

        let shouldTrigger = false;

        if (alert.condition === "above" && currentPrice >= alert.target_price) {
          shouldTrigger = true;
        } else if (alert.condition === "below" && currentPrice <= alert.target_price) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          await this.triggerAlert(alert, currentPrice);
        }
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  // Trigger an alert
  async triggerAlert(alert: PriceAlert, currentPrice: number) {
    try {
      // Update alert in database
      const { error } = await supabase
        .from("price_alerts")
        .update({
          triggered_at: new Date().toISOString(),
          is_active: false, // Deactivate after triggering
        })
        .eq("id", alert.id);

      if (error) {
        console.error("Error updating alert:", error);
        return;
      }

      console.log(`Alert triggered: ${alert.coin_name} ${alert.condition} $${alert.target_price}`);

      // Call callback if provided
      if (this.onAlertTriggered) {
        this.onAlertTriggered(alert, currentPrice);
      }

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${alert.coin_name} Price Alert!`, {
          body: `${alert.coin_symbol.toUpperCase()} is now ${alert.condition} $${alert.target_price}. Current price: $${currentPrice.toLocaleString()}`,
          icon: "/favicon.ico",
          tag: alert.id,
        });
      }
    } catch (error) {
      console.error("Error triggering alert:", error);
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }
}
