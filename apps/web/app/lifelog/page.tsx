'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import axios from 'axios'

type Granularity = 'day' | 'week' | 'month'

type Entry = {
  id: string
  entryDate: string
  memo?: string
  imageUrl?: string
  tags?: string[]
  location?: { latitude: number; longitude: number; address?: string }
}

export default function LifelogPage() {
  const [granularity, setGranularity] = useState<Granularity>('day')
  const [current, setCurrent] = useState<Date>(new Date())
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

  const range = useMemo(() => {
    const d = dayjs(current)
    if (granularity === 'day') {
      const from = d.startOf('day'); const to = d.endOf('day')
      return { from: from.toISOString(), to: to.toISOString(), label: d.format('YYYY.MM.DD (ddd)') }
    }
    if (granularity === 'week') {
      const from = d.startOf('week'); const to = d.endOf('week')
      return { from: from.toISOString(), to: to.toISOString(), label: `${from.format('YYYY.MM.DD')} - ${to.format('MM.DD')}` }
    }
    const from = d.startOf('month'); const to = d.endOf('month')
    return { from: from.toISOString(), to: to.toISOString(), label: d.format('YYYY.MM') }
  }, [granularity, current])

  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const { data } = await axios.get(`${baseURL}/api/lifelog/timeline`, {
          params: { from: range.from, to: range.to, granularity },
          // headers: { Authorization: `Bearer ${token}` },
        })
        const source = Array.isArray(data) ? data : (data.items ?? [])
        const mapped: Entry[] = source.map((e: any) => ({
          id: e.id,
          entryDate: e.entryDate,
          memo: e.memo,
          imageUrl: e.imageUrl,
          tags: e.tags,
          location: (e.latitude != null && e.longitude != null)
            ? { latitude: Number(e.latitude), longitude: Number(e.longitude), address: e.address }
            : undefined
        }))
        if (on) setItems(mapped)
      } catch (e: any) {
        if (on) setError(e?.message || '타임라인 불러오기 실패')
      } finally {
        if (on) setLoading(false)
      }
    })()
    return () => { on = false }
  }, [baseURL, range.from, range.to, granularity])

  const goPrev = () => {
    if (granularity === 'day') setCurrent(prev => dayjs(prev).subtract(1, 'day').toDate())
    else if (granularity === 'week') setCurrent(prev => dayjs(prev).subtract(1, 'week').toDate())
    else setCurrent(prev => dayjs(prev).subtract(1, 'month').toDate())
  }
  const goNext = () => {
    if (granularity === 'day') setCurrent(prev => dayjs(prev).add(1, 'day').toDate())
    else if (granularity === 'week') setCurrent(prev => dayjs(prev).add(1, 'week').toDate())
    else setCurrent(prev => dayjs(prev).add(1, 'month').toDate())
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200/70 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">라이프로그</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">사진과 동선을 모아 일·주·월 단위로 한눈에 확인해 보세요.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/lifelog/search"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                🔎 검색/필터
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 bg-white/90 dark:bg-gray-950/90 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
              {(['day','week','month'] as Granularity[]).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-4 py-2 text-sm rounded-lg transition ${
                    granularity === g ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {g === 'day' ? '일' : g === 'week' ? '주' : '월'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">◀</button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{range.label}</span>
              <button onClick={goNext} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">▶</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && <div className="text-sm text-gray-500 dark:text-gray-400">불러오는 중…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {!loading && !error && granularity === 'month' && (
          <MonthGrid baseDate={current} entries={items} onSelectDate={(d) => { setGranularity('day'); setCurrent(d) }} />
        )}
        {!loading && !error && granularity === 'week' && <WeekGrid baseDate={current} entries={items} />}
        {!loading && !error && granularity === 'day' && <DayTimeline entries={items} />}
      </div>
    </div>
  )
}

function MonthGrid({ baseDate, entries, onSelectDate }: { baseDate: Date; entries: Entry[]; onSelectDate: (d: Date) => void }) {
  const start = dayjs(baseDate).startOf('month').startOf('week')
  const days = Array.from({ length: 42 }).map((_, i) => start.add(i, 'day'))
  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    const k = dayjs(e.entryDate).format('YYYY-MM-DD'); acc[k] = (acc[k] || 0) + 1; return acc
  }, {})
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 shadow-sm">
      <div className="grid grid-cols-7 gap-2">
        {['일','월','화','수','목','금','토'].map((w) => (<div key={w} className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">{w}</div>))}
        {days.map((d) => {
          const key = d.format('YYYY-MM-DD')
          const inMonth = d.month() === dayjs(baseDate).month()
          const count = counts[key] || 0
          return (
            <button key={key} onClick={() => onSelectDate(d.toDate())}
              className={`h-24 rounded-xl border p-3 text-left transition relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 ${inMonth ? '' : 'opacity-60'}`}>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">{d.date()}</div>
              {count > 0 && (<div className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">기록 {count}개</div>)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useRouter } from 'next/navigation'
function WeekGrid({ baseDate, entries }: { baseDate: Date; entries: Entry[] }) {
  const weekStart = dayjs(baseDate).startOf('week')
  const days = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'))
  const hours = Array.from({ length: 18 }).map((_, i) => 6 + i)
  const router = useRouter()
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 md:p-4 shadow-sm">
      <div className="grid mt-2" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
        <div />
        {days.map((d) => (<div key={d.toString()} className="text-xs text-center py-2 font-medium text-gray-700 dark:text-gray-200">{d.format('MM/DD(ddd)')}</div>))}
        {hours.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="text-xs text-right pr-3 py-4 text-gray-500 dark:text-gray-400">{h}:00</div>
            {days.map((d) => {
              const inCell = entries.filter(e => dayjs(e.entryDate).isSame(d, 'day') && dayjs(e.entryDate).hour() === h)
              return (
                <div key={`${d}-${h}`} className="border h-14 p-1.5 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  {inCell.slice(0, 2).map(e => {
                    const dayStr = dayjs(e.entryDate).format('YYYY-MM-DD')
                    const href = `/lifelog/search?date=${encodeURIComponent(dayStr)}${e.tags?.[0] ? `&tag=${encodeURIComponent(e.tags[0])}` : ''}${e.location?.address ? `&place=${encodeURIComponent(e.location.address)}` : ''}`
                    return (
                      <button key={e.id} type="button" onClick={(ev) => { ev.stopPropagation(); router.push(href) }}
                        className="w-full text-left text-[11px] truncate text-gray-700 dark:text-gray-200 hover:underline">
                        • {e.memo || '기록'}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function DayTimeline({ entries }: { entries: Entry[] }) {
  const sorted = [...entries].sort((a,b) => dayjs(a.entryDate).valueOf() - dayjs(b.entryDate).valueOf())
  return (
    <div className="space-y-3">
      {sorted.map(e => {
        const dayStr = dayjs(e.entryDate).format('YYYY-MM-DD')
        const searchHref = `/lifelog/search?date=${encodeURIComponent(dayStr)}${e.tags?.[0] ? `&tag=${encodeURIComponent(e.tags[0])}` : ''}${e.location?.address ? `&place=${encodeURIComponent(e.location.address)}` : ''}`
        return (
          <Link key={e.id} href={searchHref} className="block">
            <div className="flex gap-3 items-center rounded-2xl border p-3 md:p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <div className="text-xs w-16 text-gray-500 dark:text-gray-400">{dayjs(e.entryDate).format('HH:mm')}</div>
              {e.imageUrl
                ? <img src={e.imageUrl} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-800" alt="" />
                : <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400">🗂️</div>}
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-base text-gray-900 dark:text-white truncate">{e.memo || '(메모 없음)'}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!!e.tags?.length && e.tags.map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 cursor-default">{t}</span>
                  ))}
                  {e.location?.address && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 cursor-default">{e.location.address}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-300">자세히</span>
            </div>
          </Link>
        )
      })}
      {sorted.length === 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          이 날에는 기록이 없어요.
        </div>
      )}
    </div>
  )
}