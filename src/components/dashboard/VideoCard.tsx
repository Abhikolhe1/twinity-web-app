'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Play } from 'lucide-react'
import type { ApiVideoJob } from '@/lib/api'

export function thumbnailGradient(status: string) {
  switch (status) {
    case 'delivered':   return 'linear-gradient(135deg, #059669 0%, #064e3b 100%)'
    case 'in-progress': return 'linear-gradient(135deg, #9a78fe 0%, #422266 100%)'
    case 'review':      return 'linear-gradient(135deg, #d97706 0%, #78350f 100%)'
    default:            return 'linear-gradient(135deg, #6b7280 0%, #374151 100%)'
  }
}

export function statusBadge(status: string, labels: Record<string, string>) {
  const label = labels[status] ?? status
  switch (status) {
    case 'delivered':   return <Badge variant="green"  dot>{label}</Badge>
    case 'in-progress': return <Badge variant="purple" dot>{label}</Badge>
    case 'review':      return <Badge variant="yellow" dot>{label}</Badge>
    default:            return <Badge variant="gray"   dot>{label}</Badge>
  }
}

export default function VideoCard({
  order,
  labels,
}: {
  order: ApiVideoJob
  labels: Record<string, string>
}) {
  const celeb = order.celebrityId as { name: string; nameAr: string; initials: string; avatarColor: string }
  const videoUrl = order.previewUrl || order.watermarkedUrl || order.finalVideoUrl
  const isInProgress = order.status === 'in-progress'

  return (
    <div className="relative rounded-2xl bg-white border border-brand-purple/12 overflow-hidden hover:border-brand-purple/30 hover:shadow-card-hover transition-all group">

      <Link href={`/videos/${order.referenceId}`} className="block cursor-pointer">

        {/* Thumbnail */}
        <div className="relative w-full" style={{ aspectRatio: '16/9', background: thumbnailGradient(order.status) }}>

          {/* Actual video thumbnail if available */}
          {videoUrl && !isInProgress && (
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
              controlsList="nodownload"
            />
          )}

          {/* Scan-line texture */}
          {!videoUrl && !isInProgress && (
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.4) 3px,rgba(0,0,0,0.4) 4px)' }} />
          )}

          {/* In-progress loading animation */}
          {isInProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/80"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <style jsx>{`
                @keyframes bounce {
                  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                  40% { transform: scale(1); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {/* Play button (not in-progress) */}
          {!isInProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)' }}>
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Celebrity initial — top left */}
          <div className="absolute top-2.5 left-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
              {celeb?.initials ?? '?'}
            </div>
          </div>

          {/* Status badge — top right */}
          <div className="absolute top-2.5 right-2.5">
            {statusBadge(order.status, labels)}
          </div>

          {/* Duration tag — bottom right */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="text-[9px] font-bold tracking-widest uppercase text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              30s
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-content-primary truncate leading-tight">{celeb?.name ?? '—'}</p>
          <p className="text-xs text-content-muted truncate capitalize">{order.productType}</p>
          <div className="flex items-center justify-between pt-1 border-t border-brand-purple/8 mt-0.5">
            <span className="text-[10px] font-mono text-content-muted">{order.referenceId}</span>
            <span className="text-xs font-bold text-brand-purple">${(order.estimatedPrice || 0).toLocaleString()}</span>
          </div>
        </div>

      </Link>
    </div>
  )
}
