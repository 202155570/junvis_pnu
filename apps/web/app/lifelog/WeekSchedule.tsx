// apps/web/src/widgets/Lifelog/WeekSchedule.tsx
'use client'
import dayjs from 'dayjs'

export function WeekSchedule({
  baseDate,
  entries, // [{ id, entryDate, ... }]
}: {
  baseDate: Date
  entries: { id: string; entryDate: string; memo?: string }[]
}) {
  const weekStart = dayjs(baseDate).startOf('week')
  const days = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'))
  const hours = Array.from({ length: 18 }).map((_, i) => 6 + i) // 06~23

  // 실제 배치는 entryDate를 day/hour로 매핑해서 해당 셀에 뱃지/블록 렌더
  return (
    <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
      <div />
      {days.map((d) => (
        <div key={d.toString()} className="text-xs text-center py-1">{d.format('MM/DD(ddd)')}</div>
      ))}
      {hours.map((h) => (
        <>
          <div key={`h-${h}`} className="text-xs text-right pr-2 py-3 text-gray-500">{h}:00</div>
          {days.map((d) => {
            const inCell = entries.filter(e => {
              const t = dayjs(e.entryDate)
              return t.isSame(d, 'day') && t.hour() === h
            })
            return (
              <div key={`${d}-${h}`} className="border h-12 p-1">
                {inCell.slice(0,2).map(e => (
                  <div key={e.id} className="text-[10px] truncate">• {e.memo || '기록'}</div>
                ))}
              </div>
            )
          })}
        </>
      ))}
    </div>
  )
}