(() => {
  'use strict';
  const catalog = [
    { id: 'notice', name: 'Notice something lovely', minutes: 3, description: 'Make room for a small detail around you.', steps: ['Find a comfortable spot.', 'Notice three colors, shapes, or sounds around you.', 'Stay with one detail you enjoy for a moment.'] },
    { id: 'gratitude', name: 'Keep a little gratitude', minutes: 3, description: 'Hold onto one ordinary thing you appreciate.', steps: ['Think of something small you appreciate today.', 'Write a sentence about it on paper or in your journal.', 'Read it back at your own pace.'] },
    { id: 'music', name: 'Listen to a favorite song', minutes: 5, description: 'Spend a few minutes with a familiar sound.', steps: ['Choose a song you would like to hear.', 'Set the volume to a comfortable level.', 'Listen without needing to do anything else.'] },
    { id: 'celebrate', name: 'Save a happy moment', minutes: 3, description: 'Give a good moment a little space.', steps: ['Recall one moment that made you smile.', 'Write down what happened and what you liked about it.', 'Keep the note somewhere you can revisit.'] },
    { id: 'connect', name: 'Send a friendly hello', minutes: 2, description: 'Reach out to someone you feel comfortable with.', steps: ['Think of someone you would enjoy saying hello to.', 'Send a short greeting or a kind thought if you want to.', 'Let that small gesture be enough, without waiting for a reply.'] },
    { id: 'water', name: 'Take a water break', minutes: 2, description: 'Pause with a drink of water.', steps: ['Get some water and settle somewhere comfortable.', 'Take a few unhurried sips.', 'Give yourself a moment before returning to your day.'] },
    { id: 'rest', name: 'Rest for a moment', minutes: 3, description: 'Let yourself pause without a task to finish.', steps: ['Sit or lie somewhere comfortable.', 'Rest your hands and look somewhere easy on your eyes.', 'Take your time before deciding what comes next.'] },
    { id: 'comfort', name: 'Create a cozy corner', minutes: 5, description: 'Make a little space feel welcoming.', steps: ['Choose a comfortable place to sit.', 'Bring over a favorite cushion, blanket, or familiar object.', 'Settle in and enjoy the space for a few minutes.'] },
    { id: 'one-step', name: 'Choose one small step', minutes: 3, description: 'Make the next thing feel a little smaller.', steps: ['Write down one thing on your mind.', 'Pick a small next step you could take, or choose to pause.', 'Leave the rest of the list for another time.'] }
  ].map(activity => Object.freeze({ ...activity, steps: Object.freeze(activity.steps) }));
  const byMood = Object.freeze({ Calm: ['notice', 'gratitude', 'music'], Happy: ['celebrate', 'connect', 'gratitude'], Tired: ['water', 'rest', 'music'], Sad: ['comfort', 'music', 'connect'], Tense: ['notice', 'rest', 'one-step'] });
  const find = id => catalog.find(activity => activity.id === id);
  const recommend = mood => Object.hasOwn(byMood, mood) ? byMood[mood].map(find) : [];
  function normalizeEntry(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    return { ...entry, activityId: recommend(entry.mood).some(activity => activity.id === entry.activityId) ? entry.activityId : null };
  }
  function select(entry, id) {
    const next = normalizeEntry(entry);
    return next && recommend(next.mood).some(activity => activity.id === id) ? { ...next, activityId: id } : next;
  }
  function changeMood(entry, mood) {
    return normalizeEntry({ ...entry, mood, activityId: entry?.mood === mood ? entry.activityId : null });
  }
  globalThis.RongrongActivities = Object.freeze({ catalog: Object.freeze(catalog), find, recommend, normalizeEntry, select, changeMood });
})();
