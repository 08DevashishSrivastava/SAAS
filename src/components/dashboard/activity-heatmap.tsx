import {
  buildYearHeatmap,
  getActivityIntensity,
  type DailyActivity,
} from '@/lib/dashboard/streaks'

const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function ActivityHeatmap({
  activity,
  timeZone,
}: {
  activity: DailyActivity[]
  timeZone: string
}) {
  const { days, months } = buildYearHeatmap(activity, new Date(), timeZone)
  const totalCaptions = activity.reduce((sum, item) => sum + item.count, 0)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  })

  return (
    <section className="activity-card" aria-labelledby="activity-heading">
      <div className="activity-heading">
        <div>
          <h2 id="activity-heading">Your activity</h2>
          <p>A year of showing up for your practice</p>
        </div>
        <span>{totalCaptions} {totalCaptions === 1 ? 'caption' : 'captions'} saved</span>
      </div>
      {totalCaptions === 0 && (
        <p className="activity-empty">Your activity will appear here when you save your first caption.</p>
      )}
      <div className="activity-scroll" aria-label="Caption activity over the past year">
        <div className="activity-layout">
          <div className="activity-weekdays" aria-hidden="true">
            {weekdayLabels.map((label, index) => <span key={index}>{label}</span>)}
          </div>
          <div className="activity-chart">
            <div className="activity-months" aria-hidden="true">
              {months.map((item, index) => (
                <span key={`${item.month}-${index}`} style={{ left: `calc(${item.week} * 15px)` }}>
                  {item.month}
                </span>
              ))}
            </div>
            <div className="activity-grid" role="grid" aria-label="Daily saved caption counts">
              {days.map((day) => {
                const dateLabel = dateFormatter.format(new Date(`${day.date}T00:00:00Z`))
                const label = `${dateLabel}: ${day.count} ${day.count === 1 ? 'caption' : 'captions'} saved`
                return (
                  <span
                    key={day.date}
                    className={`activity-cell ${getActivityIntensity(day.count)}`}
                    style={{ gridColumn: day.week + 1, gridRow: day.weekday + 1 }}
                    title={label}
                    aria-label={label}
                    role="gridcell"
                    tabIndex={0}
                  />
                )
              })}
            </div>
            <div className="activity-legend" aria-label="Activity intensity: less to more">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={level} className={`activity-cell level-${level}`} aria-hidden="true" />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
