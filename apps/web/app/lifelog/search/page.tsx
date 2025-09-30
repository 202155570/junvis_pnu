'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

type Entry = {
  id: string
  entryDate: string
  memo?: string
  imageUrl?: string
  tags?: string[]
  location?: { latitude: number; longitude: number; address?: string }
}

export default function SearchPage() {
  const sp = useSearchParams()
  const date = sp?.get('date') ?? undefined
  const tag = sp?.get('tag') ?? undefined
  const place = sp?.get('place') ?? undefined
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

  const range = useMemo(() => {
    if (date) {
      const d = dayjs(date)
      return { from: d.startOf('day').toISOString(), to: d.endOf('day').toISOString(), label: d.format('YYYY.MM.DD (ddd)') }
    }
    const now = dayjs()
    return { from: now.startOf('month').toISOString(), to: now.endOf('month').toISOString(), label: '이번 달' }
  }, [date])

  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const { data } = await axios.get(`${baseURL}/api/lifelog/timeline`, {
          params: { from: range.from, to: range.to, granularity: 'day', tag, place },
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
        if (on) setError(e?.message || '검색 실패')
      } finally {
        if (on) setLoading(false)
      }
    })()
    return () => { on = false }
  }, [baseURL, range.from, range.to, tag, place])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">라이프로그 검색</h1>
          <Link href="/lifelog" className="text-sm text-blue-600 dark:text-blue-300 hover:underline">← 타임라인으로</Link>
        </div>

        <div className="rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <span className="mr-3">기간: {range.label}</span>
            {date && <span className="mr-3">날짜: <b>{date}</b></span>}
            {tag && <span className="mr-3">태그: <b>{tag}</b></span>}
            {place && <span>장소: <b>{place}</b></span>}
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500 dark:text-gray-400">불러오는 중…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">조건에 맞는 기록이 없어요.</div>
        )}

        <div className="space-y-3">
          {items.map(e => {
            const day = dayjs(e.entryDate).format('YYYY-MM-DD')
            return (
              <div key={e.id} className="flex gap-3 items-center rounded-xl border p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="text-xs w-14 text-gray-500 dark:text-gray-400">{dayjs(e.entryDate).format('HH:mm')}</div>
                {e.imageUrl && <img src={e.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white truncate">{e.memo || '(메모 없음)'}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {!!e.tags?.length && e.tags.map(t => (
                      <span key={t} className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{t}</span>
                    ))}
                    {e.location?.address && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{e.location.address}</span>
                    )}
                  </div>
                </div>
                <Link href={`/lifelog?date=${encodeURIComponent(day)}`} className="text-xs text-blue-600 dark:text-blue-300 hover:underline">타임라인</Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
