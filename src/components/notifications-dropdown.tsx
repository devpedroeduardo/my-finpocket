"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, XCircle, Info } from "lucide-react";
// Importamos a interface do action
import { getActiveAlerts, type Alert } from "@/app/actions/notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function NotificationsDropdown() {
  // CORREÇÃO: Tipamos o useState com a interface Alert
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    getActiveAlerts().then(setAlerts);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          {alerts.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Alertas e Avisos</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
              Tudo em ordem por aqui!
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="flex gap-3">
                  {alert.type === 'danger' ? <XCircle className="w-5 h-5 text-red-500 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}