(() => {
  'use strict';
  const DEFAULT_PET_NAME = 'Rongrong';
  const PET_NAME_MAX = 20;
  const GOALS_MAX = 3;
  const callMeOptions = Object.freeze([
    { id: 'nickname', label: 'My nickname' },
    { id: 'dear', label: 'Dear' },
    { id: 'friend', label: 'Friend' },
    { id: 'sunshine', label: 'Sunshine' }
  ].map(Object.freeze));
  const goalCatalog = Object.freeze([
    { id: 'sleep', name: 'Sleep a little better', emoji: '🌙' },
    { id: 'calm', name: 'Feel less anxious', emoji: '🍃' },
    { id: 'kind', name: 'Be kinder to myself', emoji: '💗' },
    { id: 'move', name: 'Move my body more', emoji: '🚶' },
    { id: 'connect', name: 'Stay connected with people', emoji: '💌' },
    { id: 'focus', name: 'Take one small step at a time', emoji: '🌱' }
  ].map(Object.freeze));
  const findGoal = id => goalCatalog.find(goal => goal.id === id);
  function cleanPetName(value) {
    const name = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, PET_NAME_MAX).trim() : '';
    return name || DEFAULT_PET_NAME;
  }
  function cleanGoals(value) {
    return Array.isArray(value) ? [...new Set(value.filter(id => findGoal(id)))].slice(0, GOALS_MAX) : [];
  }
  function normalize(state) {
    return {
      ...state,
      petName: cleanPetName(state.petName),
      callMe: callMeOptions.some(option => option.id === state.callMe) ? state.callMe : 'nickname',
      goals: cleanGoals(state.goals)
    };
  }
  // How the pet addresses the user in greetings; falls back to "friend" when no nickname is set.
  function address(state) {
    const next = normalize(state);
    if (next.callMe !== 'nickname') return next.callMe;
    const nickname = typeof state.nickname === 'string' ? state.nickname.trim().slice(0, 30) : '';
    return nickname || 'friend';
  }
  // Feb 29 birthdays are celebrated on Feb 28 in non-leap years.
  function isBirthday(birthday, dateKey) {
    const born = /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday || '');
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || '');
    if (!born || !day) return false;
    const year = Number(day[1]);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const monthDay = born[1] === '02' && born[2] === '29' && !leap ? '02-28' : `${born[1]}-${born[2]}`;
    return monthDay === `${day[2]}-${day[3]}`;
  }
  function backup(state, exportedAt) {
    return { app: 'rongrong', format: 'rongrong-demo-v1', exportedAt, data: normalize(state) };
  }
  const backupFileName = dateKey => `rongrong-backup-${dateKey}.json`;
  const BACKUP_MAX_CHARS = 1_000_000;
  // Validates a backup file's text; the caller still runs data through the normal load/normalize flow.
  function readBackup(text) {
    if (typeof text !== 'string') return { ok: false, error: 'This file could not be read.' };
    if (text.length > BACKUP_MAX_CHARS) return { ok: false, error: 'This file is too large to be a Rongrong backup.' };
    let file;
    try { file = JSON.parse(text); } catch { return { ok: false, error: 'This file is not valid JSON.' }; }
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    if (!isObject(file) || file.app !== 'rongrong') return { ok: false, error: 'This file is not a Rongrong backup.' };
    if (file.format !== 'rongrong-demo-v1') return { ok: false, error: 'This backup format is not supported.' };
    if (!isObject(file.data)) return { ok: false, error: 'This backup has no data to restore.' };
    return { ok: true, data: file.data, exportedAt: typeof file.exportedAt === 'string' ? file.exportedAt : null };
  }
  // Growth stages are derived from bond only, so they need no stored field.
  const growthStages = Object.freeze([
    { id: 'fluff', name: 'Fluff', emoji: '☁️', minBond: 0, description: 'A soft little puff, just getting to know you.' },
    { id: 'sprout', name: 'Sprout', emoji: '🌱', minBond: 200, description: 'Feeling at home and growing a little braver.' },
    { id: 'bloom', name: 'Bloom', emoji: '🌸', minBond: 500, description: 'Happy and blooming from your time together.' },
    { id: 'glow', name: 'Glow', emoji: '✨', minBond: 1000, description: 'Glowing with all the care you have shared.' }
  ].map(Object.freeze));
  const cleanBond = bond => Number.isFinite(bond) ? Math.max(0, bond) : 0;
  function growth(bond) {
    const value = cleanBond(bond);
    const index = growthStages.findLastIndex(stage => value >= stage.minBond);
    const stage = growthStages[index], next = growthStages[index + 1] || null;
    return {
      stage, next, index, bond: value,
      toNext: next ? next.minBond - value : 0,
      progress: next ? (value - stage.minBond) / (next.minBond - stage.minBond) : 1
    };
  }
  // Returns the newly reached stage when bond crosses a threshold, otherwise null.
  function stageUp(previousBond, nextBond) {
    const before = growth(previousBond), after = growth(nextBond);
    return after.index > before.index ? after.stage : null;
  }
  globalThis.RongrongProfile = Object.freeze({
    DEFAULT_PET_NAME, PET_NAME_MAX, GOALS_MAX, BACKUP_MAX_CHARS, callMeOptions, goalCatalog, growthStages,
    findGoal, cleanPetName, cleanGoals, normalize, address, isBirthday, backup, backupFileName, readBackup, growth, stageUp
  });
})();
