import { describe, expect, it } from 'vitest';
import { calculateDailyScore, calculateProgress, mealCalories } from '../src/lib/calculations';

describe('ציון יומי', () => {
  it('ללא מסלול - אין ציון', () => {
    expect(calculateDailyScore(1000, null, 3)).toMatchObject({ score: null, status: 'NO_TRACK' });
  });
  it('ללא ארוחות - אין ציון', () => {
    expect(calculateDailyScore(0, 1800, 0)).toMatchObject({ score: null, status: 'NO_DATA' });
  });
  it('בין 80% ל-110% - 100 ועמידה ביעד', () => {
    expect(calculateDailyScore(1440, 1800, 3)).toMatchObject({ score: 100, status: 'ON_TARGET', percentOfTarget: 80 });
    expect(calculateDailyScore(1980, 1800, 3)).toMatchObject({ score: 100, status: 'ON_TARGET', percentOfTarget: 110 });
  });
  it('קצת מעל - יורדות 2 נקודות לכל אחוז', () => {
    expect(calculateDailyScore(2160, 1800, 3)).toMatchObject({ score: 80, status: 'SLIGHTLY_OVER', percentOfTarget: 120 });
  });
  it('הרבה מעל', () => {
    expect(calculateDailyScore(2700, 1800, 3)).toMatchObject({ score: 20, status: 'FAR_OVER', percentOfTarget: 150 });
  });
  it('נמוך מהיעד', () => {
    expect(calculateDailyScore(1080, 1800, 2)).toMatchObject({ score: 60, status: 'UNDER', percentOfTarget: 60 });
  });
  it('הציון לא יורד מתחת ל-0', () => {
    expect(calculateDailyScore(9000, 1800, 5).score).toBe(0);
  });
});

describe('אחוז התקדמות', () => {
  it('ירידה במשקל', () => {
    expect(calculateProgress(80, 70, 75)).toMatchObject({ percent: 50, changeKg: -5, remainingKg: 5, currentWeightKg: 75 });
  });
  it('עלייה במשקל', () => {
    expect(calculateProgress(60, 70, 65).percent).toBe(50);
  });
  it('ללא שקילות - משקל נוכחי הוא המשקל ההתחלתי', () => {
    expect(calculateProgress(80, 70, null)).toMatchObject({ percent: 0, currentWeightKg: 80 });
  });
  it('מוגבל בין 0 ל-100', () => {
    expect(calculateProgress(80, 70, 65).percent).toBe(100);
    expect(calculateProgress(80, 70, 85).percent).toBe(0);
  });
  it('ללא פרופיל - אין אחוז', () => {
    expect(calculateProgress(null, null, null).percent).toBeNull();
  });
});

describe('קלוריות לארוחה', () => {
  it('מנות × קלוריות למנה', () => {
    expect(mealCalories(1.5, 140)).toBe(210);
    expect(mealCalories(0.25, 85)).toBe(21);
  });
});
