'use client'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Upload } from 'lucide-react'

interface UploadZoneProps {
  onUpload: () => void
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onUpload()
  }, [onUpload])

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      animate={{ borderColor: dragging ? '#22c55e' : '#86efac', backgroundColor: dragging ? '#f0fdf4' : '#f0fdf4' }}
      className="border-2 border-dashed border-green-300 rounded-3xl p-12 text-center cursor-pointer bg-green-50 hover:bg-green-100 hover:border-green-500 transition-colors"
      onClick={onUpload}
    >
      <div className="text-5xl mb-4">📷</div>
      <div className="text-base font-semibold text-gray-700 mb-1">Drop your crop image here</div>
      <div className="text-sm text-gray-400 mb-6">or choose one of the options below · Supported: JPG, PNG, HEIC</div>
      <div className="flex gap-3 justify-center flex-wrap" onClick={e => e.stopPropagation()}>
        <Button onClick={onUpload}><Upload size={15} /> Upload Image</Button>
        <Button variant="secondary" onClick={onUpload}>📸 Take Photo</Button>
        <Button variant="ghost" onClick={onUpload}>🔬 Use Sample</Button>
      </div>
    </motion.div>
  )
}
