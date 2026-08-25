import React, { useEffect, useState } from 'react';
import { ConnectionStatus, subscribeConnectionStatus, api } from '../../shared/api/client';
import { Sparkles, Wifi } from 'lucide-react';

export const DemoBadge: React.FC = () => {
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('checking');
  const [dataMode, setDataMode] = useState<string>('synthetic');

  useEffect(() => {
    const unsub = subscribeConnectionStatus((status) => {
      setConnStatus(status);
    });

    api.getHealth()
      .then((res) => {
        if (res.dataMode) setDataMode(res.dataMode);
      })
      .catch(() => {
        setDataMode('synthetic');
      });

    return unsub;
  }, []);

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Compact Demo Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-bold shadow-2xs cursor-default"
        title={`Data Mode: ${dataMode} | Connection: ${connStatus === 'live' ? 'Live API (127.0.0.1:3141)' : 'Offline Interactive Demo'}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="text-[11px] font-bold">Demo</span>
        {connStatus === 'live' && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="API Live" />
        )}
      </div>
    </div>
  );
};
