'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface ImagePreviewProps {
  onDiagnose: () => void
  onReset: () => void
  loading: boolean
}

export function ImagePreview({ onDiagnose, onReset, loading }: ImagePreviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-full h-56 bg-gradient-to-br from-green-100 via-green-200 to-green-400 rounded-2xl flex items-center justify-center text-8xl relative overflow-hidden mb-4">
        🍅
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700">
          tomato_leaf_sample.jpg · 2.4 MB
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5 bg-white rounded-2xl border border-gray-200 mb-4">
        {[
          { icon: '🌿', label: 'Crop Detected', val: 'Tomato (Solanum lycopersicum)' },
          { icon: '🍃', label: 'Plant Part', val: 'Leaf (Upper Surface)' },
        ].map(({ icon, label, val }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
            <div>
              <div className="text-xs text-gray-400">{label}</div>
              <div className="text-sm font-semibold text-gray-800">{val}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button size="lg" onClick={onDiagnose} loading={loading} className="flex-1">
          🔬 Diagnose Crop
        </Button>
        <Button variant="secondary" onClick={onReset}>Clear</Button>
      </div>
    </motion.div>
  )
}
