'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react'

interface RemediationGuideProps {
  ruleName: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  riskDescription: string
  whyItsDangerous: string
  stepByStepFix: string[]
  beforeCode: string
  afterCode: string
  bestPractices: string[]
  additionalResources?: string[]
}

/**
 * RemediationCard Component
 * Display educational remediation guide untuk vulnerability
 * Fokus: User-friendly, actionable, dan non-teknis explanation
 */
export function RemediationCard({
  ruleName,
  severity,
  riskDescription,
  whyItsDangerous,
  stepByStepFix,
  beforeCode,
  afterCode,
  bestPractices,
  additionalResources,
}: RemediationGuideProps) {
  const [expandedSection, setExpandedSection] = useState<string>('risk')
  const [copiedCode, setCopiedCode] = useState<'before' | 'after' | null>(null)

  // Severity color mapping
  const severityColors = {
    CRITICAL: 'bg-red-50 border-red-200',
    HIGH: 'bg-orange-50 border-orange-200',
    MEDIUM: 'bg-yellow-50 border-yellow-200',
    LOW: 'bg-blue-50 border-blue-200',
  }

  const severityBadgeColors = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800',
  }

  const severityIcons = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🔵',
  }

  const handleCopyCode = (code: 'before' | 'after') => {
    navigator.clipboard.writeText(code === 'before' ? beforeCode : afterCode)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  return (
    <div className={`border-l-4 rounded-lg p-6 ${severityColors[severity]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{severityIcons[severity]}</span>
            <h3 className="text-xl font-bold text-gray-900">{ruleName}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityBadgeColors[severity]}`}>
              {severity}
            </span>
          </div>
          <p className="text-gray-700 font-medium">{riskDescription}</p>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {/* Why It's Dangerous */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('danger')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-900">Mengapa Berbahaya?</span>
            </div>
            {expandedSection === 'danger' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'danger' && (
            <div className="px-4 py-3 bg-red-50 border-t border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {whyItsDangerous}
              </p>
            </div>
          )}
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('code')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Contoh Kode (Sebelum & Sesudah)</span>
            </div>
            {expandedSection === 'code' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'code' && (
            <div className="px-4 py-4 border-t border-gray-200 space-y-4">
              {/* Before Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-red-700">❌ RENTAN (Jangan lakukan)</label>
                  <button
                    onClick={() => handleCopyCode('before')}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    {copiedCode === 'before' ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-red-50 border border-red-200 rounded p-3 overflow-x-auto text-xs font-mono text-gray-800">
                  {beforeCode}
                </pre>
              </div>

              {/* After Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-green-700">✅ AMAN (Lakukan ini)</label>
                  <button
                    onClick={() => handleCopyCode('after')}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    {copiedCode === 'after' ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-green-50 border border-green-200 rounded p-3 overflow-x-auto text-xs font-mono text-gray-800">
                  {afterCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Step by Step Fix */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('steps')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-900">Langkah-Langkah Perbaikan</span>
            </div>
            {expandedSection === 'steps' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'steps' && (
            <div className="px-4 py-4 border-t border-gray-200 bg-yellow-50">
              <ol className="space-y-3">
                {stepByStepFix.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('practices')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="font-semibold text-gray-900">Best Practices</span>
            </div>
            {expandedSection === 'practices' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'practices' && (
            <div className="px-4 py-4 border-t border-gray-200 bg-blue-50">
              <ul className="space-y-2">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Resources */}
        {additionalResources && additionalResources.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('resources')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span className="font-semibold text-gray-900">Referensi & Pembelajaran Lanjut</span>
              </div>
              {expandedSection === 'resources' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSection === 'resources' && (
              <div className="px-4 py-4 border-t border-gray-200 bg-purple-50">
                <ul className="space-y-2">
                  {additionalResources.map((resource, index) => (
                    <li key={index} className="text-sm text-purple-700">
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>💡 Tips:</strong> Klik pada setiap section untuk melihat detail. Copy kode yang aman ke project Anda, lalu test untuk memastikan semuanya bekerja dengan baik.
        </p>
      </div>
    </div>
  )
}
