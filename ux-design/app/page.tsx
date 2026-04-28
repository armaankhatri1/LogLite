"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { LogsTable, type LogEntry } from "@/components/dashboard/logs-table"
import { SeverityChart } from "@/components/dashboard/severity-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { SecurityAlerts } from "@/components/dashboard/security-alerts"
import { ErrorGroups } from "@/components/dashboard/error-groups"
import { FileText, AlertTriangle, XCircle, Info, Shield } from "lucide-react"

// Sample data for demonstration
const sampleLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:15",
    level: "ERROR",
    message: "Failed to connect to database: Connection timeout after 30000ms",
    source: "db-service",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:31:42",
    level: "WARN",
    message: "API rate limit approaching threshold (85% utilized)",
    source: "api-gateway",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:31:08",
    level: "INFO",
    message: "User authentication successful for user_id: usr_12345",
    source: "auth-service",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:30:55",
    level: "ERROR",
    message: "Unhandled exception in payment processing module",
    source: "payment-service",
  },
  {
    id: "5",
    timestamp: "2024-01-15 14:30:22",
    level: "INFO",
    message: "Background job completed: cleanup_expired_sessions",
    source: "scheduler",
  },
  {
    id: "6",
    timestamp: "2024-01-15 14:29:58",
    level: "WARN",
    message: "Memory usage exceeded 80% threshold on worker-3",
    source: "monitoring",
  },
  {
    id: "7",
    timestamp: "2024-01-15 14:29:15",
    level: "INFO",
    message: "New deployment started: version 2.4.1",
    source: "deployment",
  },
  {
    id: "8",
    timestamp: "2024-01-15 14:28:42",
    level: "ERROR",
    message: "Failed to send email notification: SMTP server unreachable",
    source: "notification-service",
  },
  {
    id: "9",
    timestamp: "2024-01-15 14:28:10",
    level: "INFO",
    message: "Cache invalidation completed for product catalog",
    source: "cache-service",
  },
  {
    id: "10",
    timestamp: "2024-01-15 14:27:35",
    level: "WARN",
    message: "Deprecated API endpoint accessed: /api/v1/users",
    source: "api-gateway",
  },
]

const severityData = [
  { name: "INFO", value: 1250, color: "oklch(0.55 0.18 250)" },
  { name: "WARN", value: 340, color: "oklch(0.75 0.18 85)" },
  { name: "ERROR", value: 127, color: "oklch(0.6 0.22 25)" },
]

const trendData = [
  { time: "00:00", info: 45, warn: 12, error: 3 },
  { time: "04:00", info: 32, warn: 8, error: 2 },
  { time: "08:00", info: 78, warn: 15, error: 5 },
  { time: "12:00", info: 120, warn: 25, error: 8 },
  { time: "16:00", info: 95, warn: 18, error: 12 },
  { time: "20:00", info: 68, warn: 14, error: 4 },
  { time: "Now", info: 85, warn: 20, error: 6 },
]

const securityAlerts = [
  {
    id: "1",
    type: "auth_failure" as const,
    title: "Multiple Failed Login Attempts",
    description: "15 failed login attempts detected from IP 192.168.1.105 in the last 5 minutes",
    timestamp: "2024-01-15 14:30:00",
    severity: "high" as const,
  },
  {
    id: "2",
    type: "rate_limit" as const,
    title: "Rate Limit Exceeded",
    description: "API endpoint /api/search exceeded rate limit (1000 req/min)",
    timestamp: "2024-01-15 14:25:00",
    severity: "medium" as const,
  },
]

const errorGroups = [
  {
    id: "1",
    message: "Database connection timeout",
    count: 42,
    percentage: 33,
    lastOccurred: "2 minutes ago",
  },
  {
    id: "2",
    message: "SMTP server unreachable",
    count: 28,
    percentage: 22,
    lastOccurred: "5 minutes ago",
  },
  {
    id: "3",
    message: "Payment processing failed",
    count: 19,
    percentage: 15,
    lastOccurred: "12 minutes ago",
  },
  {
    id: "4",
    message: "File upload size exceeded",
    count: 15,
    percentage: 12,
    lastOccurred: "18 minutes ago",
  },
]

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState("Just now")

  const handleRefresh = () => {
    setLastUpdated("Just now")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header lastUpdated={lastUpdated} onRefresh={handleRefresh} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics Overview */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Logs"
              value="1,717"
              subtitle="Today"
              icon={FileText}
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title="Info Logs"
              value="1,250"
              subtitle="73% of total"
              icon={Info}
              variant="info"
            />
            <MetricCard
              title="Warnings"
              value="340"
              subtitle="20% of total"
              icon={AlertTriangle}
              variant="warning"
              trend={{ value: 5, isPositive: false }}
            />
            <MetricCard
              title="Errors"
              value="127"
              subtitle="7% of total"
              icon={XCircle}
              variant="error"
              trend={{ value: 23, isPositive: false }}
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
                  Review the security patterns section below for details
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
          <LogsTable logs={sampleLogs} />
          <div className="space-y-6">
            <SecurityAlerts alerts={securityAlerts} />
            <ErrorGroups errors={errorGroups} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            LogLite - Lightweight Log Analysis Dashboard
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Built with Node.js, Express, and Chart.js
          </p>
        </footer>
      </main>
    </div>
  )
}
