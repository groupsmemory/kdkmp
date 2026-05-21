'use client';

import { useState } from 'react';
import { getPksPamekasanMetrics } from './actions';
import { Activity, ShieldAlert, CheckCircle2, Server, Network } from 'lucide-react';

export default function PksPamekasanDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    setMetrics(null);
    setClientIp(null);
    
    try {
      const result = await getPksPamekasanMetrics({
        queryId: crypto.randomUUID(),
        timestamp: Date.now()
      });
      
      if (result.success) {
        setMetrics(result.data);
        setClientIp(result.ip);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-200 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4">
            <Network className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            PKS Pamekasan Metrics
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            Secure, high-throughput routing metrics dashboard 
          </p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
          
          <div className="flex justify-center mb-8">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="w-full sm:w-auto relative group px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Fetching Data...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Request Live Metrics</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3 text-sm">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-300">Request Denied or Failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {metrics && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Region</p>
                    <p className="text-lg font-medium text-white">{metrics.region}</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <p className="text-lg font-medium text-emerald-400 capitalize">{metrics.status}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Latency</p>
                    <p className="text-lg font-medium text-white">{metrics.latency_ms} <span className="text-sm text-neutral-500">ms</span></p>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Throughput</p>
                    <p className="text-lg font-medium text-white">{metrics.throughput_mbps} <span className="text-sm text-neutral-500">Mbps</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl text-xs text-neutral-500 font-mono">
                  <Server className="w-3.5 h-3.5" />
                  <span>Client IP:</span>
                  <span className="text-neutral-300 truncate">{clientIp}</span>
                </div>
              </div>
            )}
            
            {!metrics && !error && !loading && (
              <div className="py-12 text-center text-sm text-neutral-500">
                End-to-end encryption active.<br />Awaiting secure handshake.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
