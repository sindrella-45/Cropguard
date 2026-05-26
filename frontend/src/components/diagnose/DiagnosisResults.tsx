'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Chatbot } from './Chatbot'
import { MOCK_TREATMENT, MOCK_PREVENTION } from '@/lib/utils'

interface DiagnosisResultsProps {
  onReset: () => void
  diagnosisId: string
}

export function DiagnosisResults({
  onReset,
  diagnosisId,
}: DiagnosisResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Diagnosis Complete
            </h2>

            <p className="text-gray-500 text-sm mt-0.5">
              April 29, 2025 · 14:32
            </p>
          </div>

          <span className="bg-red-100 text-red-700 text-sm font-medium px-4 py-1.5 rounded-full">
            ⚠️ High Severity
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            ['🍅', 'Crop Identified', 'Tomato'],
            ['🦠', 'Disease Detected', 'Late Blight'],
            ['📊', 'Confidence', '87%'],
          ].map(([icon, lbl, val]) => (
            <div
              key={String(lbl)}
              className="text-center p-4 bg-gray-50 rounded-xl"
            >
              <div className="text-2xl mb-1">
                {icon}
              </div>

              <div className="text-xs text-gray-400 mb-0.5">
                {lbl}
              </div>

              <div className="font-semibold text-sm text-gray-800">
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-gray-600">
            AI Confidence Score
          </span>

          <span className="font-bold text-green-600">
            87%
          </span>
        </div>

        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '87%' }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Treatment + Prevention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Treatment */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">
            Recommended Treatment
          </h4>

          <div className="flex flex-col gap-3">
            {MOCK_TREATMENT.map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Prevention */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">
            Prevention Tips
          </h4>

          <div className="flex flex-col gap-3">
            {MOCK_PREVENTION.map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* Actions */}
      <div className="flex gap-3 mt-4">

        {/* Feedback */}
        <Link
          href={`/feedback?id=${diagnosisId}`}
          className="flex-1"
        >
          <Button
            variant="secondary"
            className="w-full"
          >
            ⭐ Rate This Diagnosis
          </Button>
        </Link>

        {/* Reset */}
        <Button
          onClick={onReset}
          className="flex-1"
        >
          + New Diagnosis
        </Button>
      </div>
    </motion.div>
  )
}