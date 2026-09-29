import test from 'node:test';
import assert from 'node:assert/strict';

await import('../src/js/journal-analytics.js');
const analytics = globalThis.RongrongJournalAnalytics;
const moods = ['Calm', 'Happy', 'Tired', 'Sad', 'Tense'];

test('recent orders records newest first and supports legacy records without created', () => {
  const result = analytics.recent({
    '2026-09-01': { mood: 'Calm', created: '2026-09-01T20:00:00Z' },
    '2026-09-03': { mood: 'Happy' },
    '2026-09-02': { mood: 'Sad', created: '2026-09-02T20:00:00Z' }
  });
  assert.deepEqual(result.map(([key]) => key), ['2026-09-03', '2026-09-02', '2026-09-01']);
});

test('monthly mood counts exclude records outside the selected month', () => {
  const result = analytics.monthlyMoodCounts({
    '2026-09-01': { mood: 'Calm' },
    '2026-09-02': { mood: 'Calm' },
    '2026-09-03': { mood: 'Happy' },
    '2026-08-31': { mood: 'Tense' }
  }, new Date(2026, 8, 1), moods);
  assert.deepEqual(result, { Calm: 2, Happy: 1, Tired: 0, Sad: 0, Tense: 0 });
});

test('weekly patterns group records into calendar rows and find each dominant mood', () => {
  const result = analytics.weeklyPatterns({
    '2026-09-01': { mood: 'Calm' },
    '2026-09-02': { mood: 'Calm' },
    '2026-09-08': { mood: 'Happy' }
  }, new Date(2026, 8, 1), moods);
  assert.deepEqual(result.map(week => [week.week, week.total, week.dominantMood]), [[1, 2, 'Calm'], [2, 1, 'Happy']]);
});

test('preferred activity returns the most selected catalog activity', () => {
  const result = analytics.preferredActivity({
    a: { activityId: 'breathe' }, b: { activityId: 'walk' }, c: { activityId: 'breathe' }
  }, [{ id: 'breathe', name: 'One-minute breathing' }, { id: 'walk', name: 'Short walk' }]);
  assert.deepEqual(result, { id: 'breathe', count: 2, name: 'One-minute breathing' });
});

test('preferred activity returns null when no activity has been selected', () => {
  assert.equal(analytics.preferredActivity({ a: { mood: 'Calm' } }, []), null);
});
