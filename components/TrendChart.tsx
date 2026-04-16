'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'

interface TrendDataPoint {
  date: string
  score: number
  vulnerabilities: number
  status: 'SECURE' | 'ATTENTION' | 'AT_RISK' | 'STABLE'
}

interface TrendChartProps {
  data: TrendDataPoint[]
  title?: string
  description?: string
}

/**
 * TrendChart Component
 * Visualize health score and vulnerability trends over time
 * Simple line chart representation untuk non-technical users
 */
export function TrendChart({
  data,
  title = 'Security Trend',
  description = 'Health score history dari scan terakhir',
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 text-center py-8">
          Belum ada data trend. Lakukan scan minimal 2x untuk melihat tren perbaikan.
        </p>
      </div>
    )
  }

  // Sort data by date (oldest first)
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate chart dimensions
  const maxScore = 100
  const minScore = 0
  const chartHeight = 200
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = 400

  // Calculate points for line chart
  const pointsCount = sortedData.length
  const pointSpacing = (chartWidth - chartPadding.left - chartPadding.right) / Math.max(pointsCount - 1, 1)

  // Convert scores to Y coordinates
  const points = sortedData.map((item, index) => {
    const x = chartPadding.left + index * pointSpacing
    const y = chartHeight - chartPadding.bottom + chartPadding.top - ((item.score / maxScore) * (chartHeight - chartPadding.top - chartPadding.bottom))
    return { ...item, x, y, index }
  })

  // Create SVG path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Get trend summary
  const firstScore = sortedData[0].score
  const lastScore = sortedData[sortedData.length - 1].score
  const scoreChange = lastScore - firstScore
  const percentChange = ((scoreChange / firstScore) * 100).toFixed(1)
  const trendDirection = scoreChange > 0 ? 'improved' : scoreChange < 0 ? 'worsened' : 'stable'

  // Status colors
  const statusColors = {
    SECURE: '#10b981',      // Green
    ATTENTION: '#f59e0b',   // Yellow
    AT_RISK: '#ef4444',     // Red
    STABLE: '#3b82f6',      // Blue
  }

  const statusLabels = {
    SECURE: '✅ Aman',
    ATTENTION: '⚠ Perhatian',
    AT_RISK: '🔴 Berisiko',
    STABLE: '🔵 Stabil',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {trendDirection === 'improved' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Meningkat {percentChange}%</span>
            </div>
          )}
          {trendDirection === 'worsened' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-semibold">Menurun {Math.abs(parseFloat(percentChange))}%</span>
            </div>
          )}
          {trendDirection === 'stable' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              <Minus className="w-4 h-4" />
              <span className="text-sm font-semibold">Stabil</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto mb-6">
        <svg
          viewBox={`0 0 ${chartWidth + chartPadding.left + chartPadding.right} ${chartHeight + chartPadding.top + chartPadding.bottom}`}
          className="w-full min-w-max"
          style={{ height: 'auto' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = chartHeight - chartPadding.bottom + chartPadding.top - ((value / maxScore) * (chartHeight - chartPadding.top - chartPadding.bottom))
            return (
              <g key={`grid-${value}`}>
                <line
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartWidth + chartPadding.left}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4"
                  strokeWidth="1"
                />
                <text
                  x={chartPadding.left - 10}
                  y={y + 4}
                  fontSize="12"
                  fill="#9ca3af"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {/* Axis lines */}
          <line
            x1={chartPadding.left}
            y1={chartPadding.top}
            x2={chartPadding.left}
            y2={chartHeight + chartPadding.top}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={chartPadding.left}
            y1={chartHeight + chartPadding.top}
            x2={chartWidth + chartPadding.left}
            y2={chartHeight + chartPadding.top}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Line chart */}
          <path
            d={pathD}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              {/* Circle */}
              <circle cx={point.x} cy={point.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
              {/* Hover tooltip background */}
              <rect
                x={point.x - 40}
                y={point.y - 30}
                width="80"
                height="26"
                fill="white"
                stroke="#d1d5db"
                rx="4"
                opacity="0"
                className="hover:opacity-100"
              />
              {/* Score label */}
              <text
                x={point.x}
                y={point.y - 35}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill="#1f2937"
                opacity="0"
                className="hover:opacity-100"
              >
                {point.score}
              </text>
            </g>
          ))}

          {/* Date labels on X axis */}
          {points.map((point, index) => (
            index % Math.ceil(pointsCount / 3) === 0 && (
              <g key={`date-${index}`}>
                <text
                  x={point.x}
                  y={chartHeight + chartPadding.top + 20}
                  fontSize="11"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {new Date(point.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                </text>
              </g>
            )
          ))}
        </svg>
      </div>

      {/* Data Table */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Riwayat Scan</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Tanggal
                </th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Skor</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Vulnerabilities</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-600">
                    {new Date(item.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            item.score >= 75
                              ? 'bg-green-500'
                              : item.score >= 50
                              ? 'bg-yellow-500'
                              : item.score >= 25
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900">{item.score}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: statusColors[item.status] + '20',
                        color: statusColors[item.status],
                      }}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-900">{item.vulnerabilities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>📊 Kesimpulan:</strong> Skor Anda{' '}
          {scoreChange > 0 ? (
            <>
              <span className="text-green-600 font-bold">meningkat {scoreChange} poin</span> dalam periode ini. Terus pertahankan!
            </>
          ) : scoreChange < 0 ? (
            <>
              <span className="text-red-600 font-bold">menurun {Math.abs(scoreChange)} poin</span> dari periode sebelumnya.
              Segera perbaiki kerentanan yang ditemukan.
            </>
          ) : (
            <>
              <span className="font-bold">tetap sama</span> dengan periode sebelumnya.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
