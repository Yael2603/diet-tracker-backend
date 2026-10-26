// חישובים שהשרת מבצע בעצמו - הצד של React רק מציג את התוצאה

export type DailyStatus = 'NO_TRACK' | 'NO_DATA' | 'UNDER' | 'ON_TARGET' | 'SLIGHTLY_OVER' | 'FAR_OVER';

export const DAILY_STATUS_LABELS: Record<DailyStatus, string> = {
  NO_TRACK: 'לא נבחר מסלול',
  NO_DATA: 'עדיין לא נרשמו ארוחות',
  UNDER: 'נמוך מהיעד',
  ON_TARGET: 'עמדת ביעד 🎯',
  SLIGHTLY_OVER: 'קצת מעל היעד',
  FAR_OVER: 'הרבה מעל היעד',
};

// טווח "עמידה ביעד": בין 80% ל-110% מיעד הקלוריות
const LOWER_BOUND = 80;
const UPPER_BOUND = 110;
const FAR_OVER_BOUND = 125;
// כמה נקודות יורדות על כל אחוז מחוץ לטווח
const PENALTY_PER_PERCENT = 2;

export interface DailyScore {
  score: number | null;
  status: DailyStatus;
  statusLabel: string;
  /** כמה אחוזים מהיעד נאכלו (למשל 95) */
  percentOfTarget: number | null;
}

export function calculateDailyScore(totalCalories: number, targetCalories: number | null, mealsCount: number): DailyScore {
  const result = (status: DailyStatus, score: number | null, percent: number | null): DailyScore => ({
    score,
    status,
    statusLabel: DAILY_STATUS_LABELS[status],
    percentOfTarget: percent,
  });

  if (!targetCalories) return result('NO_TRACK', null, null);
  if (mealsCount === 0) return result('NO_DATA', null, 0);

  const percent = Math.round((totalCalories / targetCalories) * 100);
  let outside = 0;
  if (percent < LOWER_BOUND) outside = LOWER_BOUND - percent;
  else if (percent > UPPER_BOUND) outside = percent - UPPER_BOUND;
  const score = Math.max(0, 100 - outside * PENALTY_PER_PERCENT);

  let status: DailyStatus = 'ON_TARGET';
  if (percent < LOWER_BOUND) status = 'UNDER';
  else if (percent > FAR_OVER_BOUND) status = 'FAR_OVER';
  else if (percent > UPPER_BOUND) status = 'SLIGHTLY_OVER';

  return result(status, score, percent);
}

export interface Progress {
  startWeightKg: number | null;
  targetWeightKg: number | null;
  currentWeightKg: number | null;
  /** כמה ק"ג השתנו מההתחלה (שלילי = ירידה) */
  changeKg: number | null;
  /** כמה ק"ג נותרו עד היעד */
  remainingKg: number | null;
  /** אחוז התקדמות לעבר היעד 0-100 */
  percent: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function calculateProgress(
  startWeightKg: number | null,
  targetWeightKg: number | null,
  latestWeightKg: number | null,
): Progress {
  const current = latestWeightKg ?? startWeightKg;
  if (startWeightKg == null || targetWeightKg == null || current == null) {
    return {
      startWeightKg,
      targetWeightKg,
      currentWeightKg: current,
      changeKg: null,
      remainingKg: null,
      percent: null,
    };
  }

  const totalNeeded = startWeightKg - targetWeightKg;
  let percent: number;
  if (totalNeeded === 0) {
    // מסלול שמירה: 100% כשנמצאים במשקל היעד
    percent = current === targetWeightKg ? 100 : 0;
  } else {
    percent = ((startWeightKg - current) / totalNeeded) * 100;
  }

  return {
    startWeightKg,
    targetWeightKg,
    currentWeightKg: current,
    changeKg: round1(current - startWeightKg),
    remainingKg: round1(Math.abs(current - targetWeightKg)),
    percent: Math.round(Math.min(100, Math.max(0, percent))),
  };
}

/** קלוריות של ארוחה: מספר מנות × קלוריות למנה, מעוגל למספר שלם */
export function mealCalories(servings: number, caloriesPerServing: number): number {
  return Math.round(servings * caloriesPerServing);
}
