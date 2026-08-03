'use client'

import { useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import {
  RefreshCw, AlertTriangle, TrendingUp, DollarSign,
  Server, Database, HardDrive, Zap, Clock, ChevronDown,
  ChevronUp, ArrowDownRight, Loader2, CheckCircle2
} from 'lucide-react'
import { GCPData, AnalysisResult, Recommendation, MonthlySpend } from '@/types'
import { clsx } from 'clsx'

interface Props {
  initialGcpData: GCPData
  initialTrend: MonthlySpend[]
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#f87171', bg: '#f8717115', border: '#f8717130' },
  high:     { label: 'High',     color: '#fbbf24', bg: '#fbbf2415', border: '#fbbf2430' },
  medium:   { label: 'Medium',   color: '#60a5fa', bg: '#60a5fa15', border: '#60a5fa30' },
  low:      { label: 'Low',      color: '#8888aa', bg: '#8888aa10', border: '#8888aa25' },
}

const EFFORT_LABEL = { low: '~1 hr', medium: '~1 day', high: '~1 week' }

const SERVICE_ICON = {
  'Cloud Run':     <Server size={13} />,
  'Cloud Storage': <HardDrive size={13} />,
  'BigQuery':      <Database size={13} />,
}

const CHART_COLORS = {
  cloudRun: '#a78bfa',
  storage:  '#4ade80',
  bigquery: '#fbbf24',
}

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
}

function RecCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [open, setOpen] = useState(false)
  const cfg = PRIORITY_CONFIG[rec.priority]

  return (
    <div
      className="animate-fade-up rounded-xl border transition-colors cursor-pointer"
      style={{
        animationDelay: `${index * 60}ms`,
        background: open ? '#1c1c28' : '#16161f',
        borderColor: open ? cfg.border : 'rgba(255,255,255,0.06)',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {SERVICE_ICON[rec.service]}
                {rec.service}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                · {EFFORT_LABEL[rec.estimatedEffort]} effort
              </span>
            </div>
            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
              {rec.title}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end" style={{ color: '#4ade80' }}>
              <ArrowDownRight size={13} />
              <span className="text-sm font-semibold">{fmt(rec.estimatedMonthlySaving)}</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>per month</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <code className="text-[11px] px-2 py-0.5 rounded" style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {rec.resourceId}
          </code>
          <span style={{ color: 'var(--text-muted)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm mt-3 mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {rec.description}
          </p>
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <Zap size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
            <p className="text-[12px] leading-relaxed" style={{ color: '#4ade80' }}>
              <span className="font-medium">Action: </span>{rec.action}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardClient({ initialGcpData, initialTrend }: Props) {
  const [gcpData] = useState(initialGcpData)
  const [trend] = useState(initialTrend)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', { method: 'POST' })
      if (!res.ok) throw new Error(`Recommendations API error: ${res.status}`)
      const data = await res.json()

      setAnalysis(data.analysis)
      setLastRun(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(`Failed to fetch recommendations: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const totalCloudRun = gcpData.cloudRun.reduce((s, x) => s + x.monthlyCost, 0)
  const totalStorage = gcpData.storage.reduce((s, x) => s + x.monthlyCost, 0)
  const totalBQ = gcpData.bigquery.reduce((s, x) => s + x.monthlyQueryCost + x.monthlyStorageCost, 0)

  const serviceBreakdown = [
    { name: 'Cloud Run', cost: totalCloudRun, pct: Math.round((totalCloudRun / gcpData.totalMonthlyCost) * 100), color: CHART_COLORS.cloudRun },
    { name: 'BigQuery',  cost: totalBQ,       pct: Math.round((totalBQ       / gcpData.totalMonthlyCost) * 100), color: CHART_COLORS.bigquery },
    { name: 'Storage',   cost: totalStorage,  pct: Math.round((totalStorage  / gcpData.totalMonthlyCost) * 100), color: CHART_COLORS.storage },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: '#4ade80' }} />
              <span className="text-xs font-mono" style={{ color: '#4ade80' }}>LIVE MONITOR</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              GCP Cost Monitor
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {gcpData.projectName} · {gcpData.billingPeriod}
              {lastRun && <span> · Last analysis {lastRun} AEST</span>}
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: loading ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.12)',
              color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.25)',
            }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Analysing…</>
              : <><RefreshCw size={14} /> {analysis ? 'Re-run analysis' : 'Run AI analysis'}</>
            }
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <AlertTriangle size={15} style={{ color: '#f87171' }} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'May spend (MTD)', value: fmt(gcpData.totalMonthlyCost), sub: '+12% vs Apr', icon: <DollarSign size={14} />, up: true },
            { label: 'Projected (EOM)', value: fmt(gcpData.projectedMonthCost), sub: 'at current burn', icon: <TrendingUp size={14} />, up: true },
            { label: 'Waste identified', value: analysis ? fmt(analysis.totalPotentialSaving) : '—', sub: analysis ? `${analysis.recommendations.length} recommendations` : 'Run analysis', icon: <Zap size={14} />, up: false },
            { label: 'Active services', value: '3', sub: 'Run · Storage · BQ', icon: <CheckCircle2 size={14} />, up: false },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{m.icon}</span>
              </div>
              <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</div>
              <div className="text-xs mt-1" style={{ color: m.up ? '#f87171' : 'var(--text-muted)' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          {/* Trend Chart */}
          <div className="md:col-span-3 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Monthly spend trend</p>
              <div className="flex items-center gap-4">
                {Object.entries(CHART_COLORS).map(([key, color]) => (
                  <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                    {key === 'cloudRun' ? 'Cloud Run' : key === 'storage' ? 'Storage' : 'BigQuery'}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend} barSize={22} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#8888aa' }}
                  formatter={(v: number) => [`$${v}`, '']}
                />
                <Bar dataKey="cloudRun" stackId="a" fill={CHART_COLORS.cloudRun} radius={[0,0,0,0]} />
                <Bar dataKey="storage"  stackId="a" fill={CHART_COLORS.storage}  radius={[0,0,0,0]} />
                <Bar dataKey="bigquery" stackId="a" fill={CHART_COLORS.bigquery}  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service Breakdown */}
          <div className="md:col-span-2 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Service breakdown</p>
            <div className="space-y-4">
              {serviceBreakdown.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      ${s.cost.toLocaleString()}
                      <span className="ml-1.5 font-normal" style={{ color: 'var(--text-muted)' }}>{s.pct}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Top cost drivers</p>
              {gcpData.cloudRun.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Server size={11} style={{ color: CHART_COLORS.cloudRun }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>${s.monthlyCost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI recommendations</p>
              {analysis && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{analysis.summary}</p>
              )}
            </div>
            {analysis && (
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                  {fmt(analysis.totalPotentialSaving)}/mo
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>total potential saving</div>
              </div>
            )}
          </div>

          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <Zap size={20} style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Ready to analyse
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Click "Run AI analysis" to get Claude-powered recommendations for your GCP spend
              </p>
              <button
                onClick={runAnalysis}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                <RefreshCw size={13} /> Run analysis now
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={24} className="animate-spin mb-3" style={{ color: '#4ade80' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Claude is analysing your GCP data…
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Checking Cloud Run, Storage and BigQuery for savings opportunities
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <RecCard key={rec.id} rec={rec} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={11} className="inline mr-1" />
            Mock data mode · Phase 2: connect real GCP Billing API
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by Claude claude-sonnet-4 · Envaedha
          </p>
        </div>
      </div>
    </div>
  )
}
