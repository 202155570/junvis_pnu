// apps/web/src/widgets/Lifelog/CalendarMonth.tsx
'use client'
import dayjs from 'dayjs'

export function CalendarMonth({
  baseDate,
  onSelectDate,
  countsByDay, // { '2025-09-01': 3, ... }
}: {
  baseDate: Date
  onSelectDate: (d: Date) => void
  countsByDay?: Record<string, number>
}) {
  const start = dayjs(baseDate).startOf('month').startOf('week')
  const days = Array.from({ length: 42 }).map((_, i) => start.add(i, 'day'))

  return (
    <div className="grid grid-cols-7 gap-2">
      {['일','월','화','수','목','금','토'].map((w) => (
        <div key={w} className="text-xs text-gray-500 text-center">{w}</div>
      ))}
      {days.map((d) => {
        const key = d.format('YYYY-MM-DD')
        const inMonth = d.month() === dayjs(baseDate).month()
        const count = countsByDay?.[key] || 0
        return (
          <button
            key={key}
            onClick={() => onSelectDate(d.toDate())}
            className={`h-24 rounded border p-2 text-left ${inMonth ? '' : 'opacity-50'}`}
          >
            <div className="text-xs font-semibold">{d.date()}</div>
            {count > 0 && (
              <div className="mt-2 text-[10px] text-blue-600">기록 {count}개</div>
            )}
          </button>
        )
      })}
    </div>
  )
}