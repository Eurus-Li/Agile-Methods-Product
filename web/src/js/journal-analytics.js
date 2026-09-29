(() => {
  'use strict';

  const dateParts = key => {
    const [year, month, day] = String(key).split('-').map(Number);
    return { year, month, day };
  };

  function entriesForMonth(entries, monthDate) {
    const prefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    return Object.entries(entries || {}).filter(([key]) => key.startsWith(prefix));
  }

  function mostFrequent(entries, values, selector) {
    const counts = new Map();
    for (const item of entries) {
      const value = selector(item);
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    }
    return values.slice().sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))[0] || null;
  }

  function recent(entries) {
    return Object.entries(entries || {}).sort(([leftKey, left], [rightKey, right]) => {
      const leftTime = left.created || `${leftKey}T00:00:00`;
      const rightTime = right.created || `${rightKey}T00:00:00`;
      return rightTime.localeCompare(leftTime);
    });
  }

  function weeklyPatterns(entries, monthDate, moods) {
    const weeks = Array.from({ length: 6 }, (_, index) => ({ week: index + 1, total: 0, dominantMood: null, counts: {} }));
    for (const [key, entry] of entriesForMonth(entries, monthDate)) {
      const { year, month, day } = dateParts(key);
      const firstOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
      const weekIndex = Math.floor((firstOffset + day - 1) / 7);
      const week = weeks[weekIndex];
      week.total += 1;
      week.counts[entry.mood] = (week.counts[entry.mood] || 0) + 1;
    }
    for (const week of weeks) {
      week.dominantMood = moods.slice().sort((a, b) => (week.counts[b] || 0) - (week.counts[a] || 0))[0] || null;
      if (!week.counts[week.dominantMood]) week.dominantMood = null;
    }
    return weeks.filter(week => week.total);
  }

  function monthlyMoodCounts(entries, monthDate, moods) {
    const counts = Object.fromEntries(moods.map(mood => [mood, 0]));
    for (const [, entry] of entriesForMonth(entries, monthDate)) {
      if (entry.mood in counts) counts[entry.mood] += 1;
    }
    return counts;
  }

  function preferredActivity(entries, catalog) {
    const counts = new Map();
    for (const entry of Object.values(entries || {})) {
      if (entry.activityId) counts.set(entry.activityId, (counts.get(entry.activityId) || 0) + 1);
    }
    const ranked = [...counts].sort((a, b) => b[1] - a[1]);
    if (!ranked.length) return null;
    const [id, count] = ranked[0];
    const activity = (catalog || []).find(item => item.id === id);
    return { id, count, name: activity?.name || id };
  }

  globalThis.RongrongJournalAnalytics = {
    entriesForMonth,
    monthlyMoodCounts,
    preferredActivity,
    recent,
    weeklyPatterns
  };
})();
