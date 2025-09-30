// apps/web/src/widgets/Lifelog/DayTimeline.tsx
'use client'
import dayjs from 'dayjs'

export function DayTimeline({ entries }: { entries: { id: string; entryDate: string; memo?: string; imageUrl?: string }[] }) {
  const sorted = [...entries].sort((a,b) => dayjs(a.entryDate).valueOf() - dayjs(b.entryDate).valueOf())
  return (
    <div className="space-y-3">
      {sorted.map(e => (
        <div key={e.id} className="flex gap-3 items-center rounded-xl border p-3">
          <div className="text-xs w-14 text-gray-500">{dayjs(e.entryDate).format('HH:mm')}</div>
          {e.imageUrl && <img src={e.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />}
          <div className="text-sm">{e.memo || '(메모 없음)'}</div>
        </div>
      ))}
    </div>
  )
}