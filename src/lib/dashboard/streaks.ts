export type DailyActivity = {
  date: string
  count: number
}

export type ActivityStats = {
  dayStreak: number
  bestStreak: number
  totalDays: number
}

export type HeatmapDay = DailyActivity & {
  week: number
  weekday: number
}

export type MonthLabel = {
  month: string
  week: number
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function weekdayFor(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function getDateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function getActivityStats(activity: DailyActivity[], todayKey: string): ActivityStats {
  const activeDates = [...new Set(activity.filter((item) => item.count > 0).map((item) => item.date))].sort()
  const activeSet = new Set(activeDates)
  let dayStreak = 0
  let cursor = activeSet.has(todayKey) ? todayKey : addDays(todayKey, -1)

  while (activeSet.has(cursor)) {
    dayStreak += 1
    cursor = addDays(cursor, -1)
  }

  let bestStreak = 0
  let runningStreak = 0
  let previousDate: string | undefined

  for (const date of activeDates) {
    runningStreak = previousDate && addDays(previousDate, 1) === date ? runningStreak + 1 : 1
    bestStreak = Math.max(bestStreak, runningStreak)
    previousDate = date
  }

  return { dayStreak, bestStreak, totalDays: activeDates.length }
}

export function buildYearHeatmap(
  activity: DailyActivity[],
  today: Date,
  timeZone: string,
): { days: HeatmapDay[]; months: MonthLabel[] } {
  const todayKey = getDateKeyInTimeZone(today, timeZone)
  const weekdayToday = weekdayFor(todayKey)
  const firstDate = addDays(todayKey, -(364 + weekdayToday))
  const activityByDate = new Map(activity.map((item) => [item.date, item.count]))
  const days: HeatmapDay[] = []
  const months: MonthLabel[] = []
  let lastMonth = ''

  for (let index = 0; index <= 364 + weekdayToday; index += 1) {
    const date = addDays(firstDate, index)
    const month = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      month: 'short',
    }).format(new Date(`${date}T00:00:00Z`))
    const week = Math.floor(index / 7)

    if (month !== lastMonth) {
      months.push({ month, week })
      lastMonth = month
    }

    days.push({
      date,
      count: activityByDate.get(date) ?? 0,
      week,
      weekday: weekdayFor(date),
    })
  }

  return { days, months }
}

export function getActivityIntensity(count: number) {
  if (count <= 0) return 'level-0'
  if (count === 1) return 'level-1'
  if (count === 2) return 'level-2'
  if (count <= 4) return 'level-3'
  return 'level-4'
}
