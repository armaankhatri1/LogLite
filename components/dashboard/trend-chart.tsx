"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp } from "lucide-react"

interface TrendData {
  time: string
  info: number
  warn: number
  error: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Log Activity Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="warnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.75 0.18 85)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.75 0.18 85)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.6 0.22 25)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.6 0.22 25)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--card-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="info"
              stroke="oklch(0.55 0.18 250)"
              strokeWidth={2}
              fill="url(#infoGradient)"
              name="INFO"
            />
            <Area
              type="monotone"
              dataKey="warn"
              stroke="oklch(0.75 0.18 85)"
              strokeWidth={2}
              fill="url(#warnGradient)"
              name="WARN"
            />
            <Area
              type="monotone"
              dataKey="error"
              stroke="oklch(0.6 0.22 25)"
              strokeWidth={2}
              fill="url(#errorGradient)"
              name="ERROR"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
