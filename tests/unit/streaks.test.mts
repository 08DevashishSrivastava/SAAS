import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildYearHeatmap,
  getActivityIntensity,
  getActivityStats,
  getDateKeyInTimeZone,
} from '../../src/lib/dashboard/streaks.ts'
import { getCuratedTopic } from '../../src/services/ai/topic-generator.ts'

test('counts today and consecutive activity dates once per day', () => {
  assert.deepEqual(
    getActivityStats(
      [
        { date: '2024-03-01', count: 3 },
        { date: '2024-03-02', count: 1 },
        { date: '2024-03-03', count: 2 },
        { date: '2024-03-03', count: 1 },
      ],
      '2024-03-03',
    ),
    { dayStreak: 3, bestStreak: 3, totalDays: 3 },
  )
})

test('continues an active streak through yesterday', () => {
  assert.equal(
    getActivityStats([{ date: '2024-03-01', count: 1 }, { date: '2024-03-02', count: 2 }], '2024-03-03').dayStreak,
    2,
  )
})

test('breaks current streaks after missed days while preserving the best streak', () => {
  assert.deepEqual(
    getActivityStats(
      [
        { date: '2024-03-01', count: 1 },
        { date: '2024-03-02', count: 1 },
        { date: '2024-03-04', count: 1 },
      ],
      '2024-03-04',
    ),
    { dayStreak: 1, bestStreak: 2, totalDays: 3 },
  )
})

test('handles leap days, year changes, and timezone-local date boundaries', () => {
  assert.deepEqual(
    getActivityStats(
      [{ date: '2023-12-31', count: 1 }, { date: '2024-01-01', count: 2 }],
      '2024-01-01',
    ),
    { dayStreak: 2, bestStreak: 2, totalDays: 2 },
  )
  assert.equal(getDateKeyInTimeZone(new Date('2024-01-01T01:00:00Z'), 'America/Los_Angeles'), '2023-12-31')
})

test('positions heatmap dates, includes zero-activity days, and labels months', () => {
  const { days, months } = buildYearHeatmap(
    [{ date: '2024-02-29', count: 3 }],
    new Date('2024-03-02T12:00:00Z'),
    'UTC',
  )
  const leapDay = days.find((day) => day.date === '2024-02-29')

  assert.ok(days.length >= 365 && days.length <= 371)
  assert.equal(leapDay?.weekday, 4)
  assert.equal(leapDay?.count, 3)
  assert.ok(days.every((day) => day.date === '2024-02-29' || day.count === 0))
  assert.ok(months.some((item) => item.month === 'Feb'))
  assert.ok(months.some((item) => item.month === 'Mar'))
})

test('maps draft counts to five heatmap activity levels', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 5].map(getActivityIntensity),
    ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'],
  )
})

test('curated topics are appropriate for medical and dental practices', () => {
  assert.match(getCuratedTopic({ practiceType: 'Dental practice', specialties: [] }, 0).title, /oral hygiene/i)
  assert.match(getCuratedTopic({ practiceType: 'Family medicine', specialties: [] }, 0).title, /appointment/i)
})
