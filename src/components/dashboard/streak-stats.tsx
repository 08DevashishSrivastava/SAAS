import type { ActivityStats } from '@/lib/dashboard/streaks'

const items = [
  { key: 'dayStreak', label: 'DAY STREAK' },
  { key: 'bestStreak', label: 'BEST STREAK' },
  { key: 'totalDays', label: 'TOTAL DAYS' },
] as const

export default function StreakStats({ stats }: { stats: ActivityStats }) {
  return (
    <section className="streak-stats" aria-label="Caption activity statistics">
      {items.map((item) => (
        <div className="streak-stat" key={item.key}>
          <span className="streak-stat-value">{stats[item.key]}</span>
          <span className="streak-stat-label">{item.label}</span>
        </div>
      ))}
    </section>
  )
}
