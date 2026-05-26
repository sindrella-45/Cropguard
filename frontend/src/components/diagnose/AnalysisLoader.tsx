'use client'
import { motion } from 'framer-motion'



interface AnalysisLoaderProps {
  progress: number
  message: string
}

export function AnalysisLoader({ progress, message }: AnalysisLoaderProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-6" />
      <div className="text-lg font-semibold text-gray-800 mb-1">{message}</div>
      <div className="text-sm text-gray-400 mb-8">Our AI is scanning for disease markers</div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}
