import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import { PriceAlertService } from "../services/priceAlertService";

let alertService: PriceAlertService | null = null;

export default function AlertMonitor({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || user === undefined) {
      // Stop monitoring if user logs out
      if (alertService) {
        alertService.stopMonitoring();
        alertService = null;
      }
      return;
    }

    // Request notification permission on first load
    PriceAlertService.requestNotificationPermission();

    // Create alert service with callback
    if (!alertService) {
      alertService = new PriceAlertService((alert, currentPrice) => {
        showToast(
          `🔔 ${alert.coin_name} Alert! Price is ${alert.condition} $${alert.target_price}. Current: $${currentPrice.toLocaleString()}`,
          "success"
        );
      });

      // Start monitoring (check every 5 minutes)
      alertService.startMonitoring(user.id, 5);
    }

    return () => {
      if (alertService) {
        alertService.stopMonitoring();
        alertService = null;
      }
    };
  }, [user, showToast]);

  return <>{children}</>;
}
