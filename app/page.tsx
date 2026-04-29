"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { LogsTable, type LogEntry } from "@/components/dashboard/logs-table"
import { SeverityChart } from "@/components/dashboard/severity-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { SecurityAlerts } from "@/components/dashboard/security-alerts"
import { ErrorGroups } from "@/components/dashboard/error-groups"
import { FileText, AlertTriangle, XCircle, Info, Shield } from "lucide-react"

// ─── Types matching the Express /api/logs response ───────────────────
interface ApiEntry {
  severity: string
  message: string
  timestamp: string | null
  raw: string
}

interface ApiRecurringIssue {
  severity: string
  message: string
  count: number
  firstSeen: string | null
  lastSeen: string | null
}

interface ApiSecurityAlert {
  type: string
  category: string
  description: string
  severity: string
  message: string
  count: number
  threshold: number
  firstSeen: string | null
  lastSeen: string | null
}

interface ApiResponse {
  totalLogs: number
  info: number
  warn: number
  error: number
  unknown: number
  severityCounts: { info: number; warn: number; error: number; unknown: number }
  entries: ApiEntry[]
  recurringIssues: ApiRecurringIssue[]
  securityAlerts: ApiSecurityAlert[]
  securitySummary: {
    totalSecurityEvents: number
    threshold: number
    alertCount: number
  }
}

// ─── Transform API data into component-friendly formats ──────────────
function toLogEntries(entries: ApiEntry[]): LogEntry[] {
  return entries
    .slice(-50)
    .reverse()
    .map((e, i) => ({
      id: String(i + 1),
      timestamp: e.timestamp || new Date().toISOString().replace("T", " ").slice(0, 19),
      level: (e.severity?.toUpperCase() === "WARN"
        ? "WARN"
        : e.severity?.toUpperCase() === "ERROR"
        ? "ERROR"
        : "INFO") as "INFO" | "WARN" | "ERROR",
      message: e.message || e.raw,
      source: "app.log",
    }))
}

function toSeverityData(counts: ApiResponse["severityCounts"]) {
  return [
    { name: "INFO", value: counts.info, color: "oklch(0.55 0.18 250)" },
    { name: "WARN", value: counts.warn, color: "oklch(0.75 0.18 85)" },
    { name: "ERROR", value: counts.error, color: "oklch(0.6 0.22 25)" },
  ].filter((d) => d.value > 0)
}

function toSecurityAlerts(alerts: ApiSecurityAlert[]) {
  const categoryMap: Record<string, "auth_failure" | "rate_limit" | "suspicious" | "blocked"> = {
    authentication_failure: "auth_failure",
    authorization_failure: "blocked",
    service_failure: "suspicious",
  }

  return alerts.map((a, i) => ({
    id: String(i + 1),
    type: categoryMap[a.category] || ("suspicious" as const),
    title: a.description,
    description: `"${a.message}" occurred ${a.count} times (threshold: ${a.threshold})`,
    timestamp: a.lastSeen || "Unknown",
    severity: (a.count >= a.threshold * 2 ? "high" : "medium") as "high" | "medium" | "low",
  }))
}

function toErrorGroups(issues: ApiRecurringIssue[], totalErrors: number) {
  return issues
    .filter((i) => i.severity.toUpperCase() === "ERROR")
    .slice(0, 6)
    .map((issue, i) => ({
      id: String(i + 1),
      message: issue.message,
      count: issue.count,
      percentage: totalErrors > 0 ? Math.round((issue.count / totalErrors) * 100) : 0,
      lastOccurred: issue.lastSeen
        ? new Date(issue.lastSeen).toLocaleTimeString()
        : "Unknown",
    }))
}

// Build a simple time-bucketed trend from raw entries (when timestamps exist)
function toTrendData(entries: ApiEntry[]) {
  // If no timestamps, show a single-point summary
  const withTimestamps = entries.filter((e) => e.timestamp)
  if (withTimestamps.length === 0) {
    const counts = { info: 0, warn: 0, error: 0 }
    for (const e of entries) {
      const sev = e.severity as keyof typeof counts
      if (sev in counts) counts[sev]++
    }
    return [{ time: "Current", ...counts }]
  }

  // Bucket into 6 even time slices
  const sorted = [...withTimestamps].sort(
    (a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
  )
  const bucketCount = Math.min(6, sorted.length)
  const bucketSize = Math.ceil(sorted.length / bucketCount)
  const buckets = []

  for (let i = 0; i < bucketCount; i++) {
    const slice = sorted.slice(i * bucketSize, (i + 1) * bucketSize)
    const counts = { info: 0, warn: 0, error: 0 }
    for (const e of slice) {
      const sev = e.severity as keyof typeof counts
      if (sev in counts) counts[sev]++
    }
    const ts = slice[0]?.timestamp
      ? new Date(slice[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : `Bucket ${i + 1}`
    buckets.push({ time: ts, ...counts })
  }

  return buckets
}

// ─── Dashboard Component ─────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("Loading…")
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/logs")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: ApiResponse = await res.json()
      setData(json)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error("Failed to fetch logs:", err)
      setError("Could not connect to API. Is the Express server running?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const total = data?.totalLogs ?? 0
  const infoCount = data?.info ?? 0
  const warnCount = data?.warn ?? 0
  const errorCount = data?.error ?? 0

  const infoPercent = total > 0 ? Math.round((infoCount / total) * 100) : 0
  const warnPercent = total > 0 ? Math.round((warnCount / total) * 100) : 0
  const errorPercent = total > 0 ? Math.round((errorCount / total) * 100) : 0

  const severityData = data ? toSeverityData(data.severityCounts) : []
  const trendData = data ? toTrendData(data.entries) : []
  const logEntries = data ? toLogEntries(data.entries) : []
  const securityAlerts = data ? toSecurityAlerts(data.securityAlerts) : []
  const errorGroups = data ? toErrorGroups(data.recurringIssues, errorCount) : []

  // Include recurring warnings in error groups display too
  const allRecurringGroups = data
    ? data.recurringIssues.slice(0, 6).map((issue, i) => ({
        id: String(i + 1),
        message: `[${issue.severity.toUpperCase()}] ${issue.message}`,
        count: issue.count,
        percentage:
          total > 0 ? Math.round((issue.count / total) * 100) : 0,
        lastOccurred: issue.lastSeen
          ? new Date(issue.lastSeen).toLocaleTimeString()
          : "N/A",
      }))
    : []

  return (
    <div className="min-h-screen bg-background">
      <Header lastUpdated={lastUpdated} onRefresh={fetchLogs} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Banner */}
        {error && (
          <section className="mb-8">
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <XCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run dev:api</code> in a
                  separate terminal, or use <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run dev</code> to
                  start both.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Metrics Overview */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Logs"
              value={loading ? "—" : total.toLocaleString()}
              subtitle="Current log file"
              icon={FileText}
            />
            <MetricCard
              title="Info Logs"
              value={loading ? "—" : infoCount.toLocaleString()}
              subtitle={`${infoPercent}% of total`}
              icon={Info}
              variant="info"
            />
            <MetricCard
              title="Warnings"
              value={loading ? "—" : warnCount.toLocaleString()}
              subtitle={`${warnPercent}% of total`}
              icon={AlertTriangle}
              variant="warning"
            />
            <MetricCard
              title="Errors"
              value={loading ? "—" : errorCount.toLocaleString()}
              subtitle={`${errorPercent}% of total`}
              icon={XCircle}
              variant="error"
            />
          </div>
        </section>

        {/* Security Alert Banner */}
        {securityAlerts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 rounded-lg border border-chart-4/30 bg-chart-4/5 p-4">
              <Shield className="h-5 w-5 text-chart-4" />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {securityAlerts.length} Security Alert{securityAlerts.length > 1 ? "s" : ""} Detected
                </p>
                <p className="text-sm text-muted-foreground">
                  {data?.securitySummary.totalSecurityEvents ?? 0} security-relevant events found
                  (alert threshold: {data?.securitySummary.threshold ?? 0})
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Charts Section */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <TrendChart data={trendData} />
          <SeverityChart data={severityData} />
        </section>

        {/* Detailed Sections */}
        <section className="grid gap-6 lg:grid-cols-2">
          <LogsTable logs={logEntries} />
          <div className="space-y-6">
            <SecurityAlerts alerts={securityAlerts} />
            <ErrorGroups errors={allRecurringGroups} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">LogLite — Lightweight Log Analysis Dashboard</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Built with Node.js, Express, and Next.js
          </p>
        </footer>
      </main>
    </div>
  )
}
