// המרת רשומות ממסד הנתונים לתשובות JSON נקיות.
// כאן מוודאים ששדות רגישים (כמו passwordHash) לעולם לא יוצאים מהשרת.
import type {
  Consultation,
  Food,
  MealEntry,
  Menu,
  MenuItem,
  Track,
  User,
  WeightEntry,
} from '@prisma/client';
import { fromDbDate } from './dates';
import { LABELS } from './labels';
import { mealCalories } from './calculations';

export function presentUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    heightCm: user.heightCm,
    startWeightKg: user.startWeightKg,
    targetWeightKg: user.targetWeightKg,
    birthDate: user.birthDate ? fromDbDate(user.birthDate) : null,
    shareWithDietitian: user.shareWithDietitian,
    trackId: user.trackId,
    menuId: user.menuId,
    createdAt: user.createdAt,
  };
}

export function presentTrack(track: Track & { _count?: { menus: number } }) {
  return {
    id: track.id,
    name: track.name,
    description: track.description,
    type: track.type,
    typeLabel: LABELS.trackType[track.type],
    difficulty: track.difficulty,
    difficultyLabel: LABELS.difficulty[track.difficulty],
    dailyCalories: track.dailyCalories,
    durationWeeks: track.durationWeeks,
    isActive: track.isActive,
    ...(track._count ? { menusCount: track._count.menus } : {}),
    createdAt: track.createdAt,
    updatedAt: track.updatedAt,
  };
}

export function presentFood(food: Food) {
  return {
    id: food.id,
    name: food.name,
    category: food.category,
    categoryLabel: LABELS.foodCategory[food.category],
    servingDescription: food.servingDescription,
    caloriesPerServing: food.caloriesPerServing,
    isActive: food.isActive,
    createdAt: food.createdAt,
    updatedAt: food.updatedAt,
  };
}

function presentFoodShort(food: Food) {
  return {
    id: food.id,
    name: food.name,
    category: food.category,
    categoryLabel: LABELS.foodCategory[food.category],
    servingDescription: food.servingDescription,
    caloriesPerServing: food.caloriesPerServing,
  };
}

const MEAL_ORDER = { BREAKFAST: 0, LUNCH: 1, DINNER: 2, SNACK: 3 } as const;

export type MenuItemWithFood = MenuItem & { food: Food };
export type MenuWithItems = Menu & { items: MenuItemWithFood[] };

export function presentMenuItem(item: MenuItemWithFood) {
  return {
    id: item.id,
    mealType: item.mealType,
    mealTypeLabel: LABELS.mealType[item.mealType],
    servings: item.servings,
    calories: mealCalories(item.servings, item.food.caloriesPerServing),
    food: presentFoodShort(item.food),
  };
}

export function sortMenuItems<T extends { mealType: MenuItem['mealType']; id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType] || a.id - b.id);
}

export function presentMenu(menu: MenuWithItems) {
  const items = sortMenuItems(menu.items).map(presentMenuItem);
  return {
    id: menu.id,
    trackId: menu.trackId,
    name: menu.name,
    description: menu.description,
    isActive: menu.isActive,
    totalCalories: items.reduce((sum, i) => sum + i.calories, 0),
    items,
    createdAt: menu.createdAt,
    updatedAt: menu.updatedAt,
  };
}

export function presentWeight(entry: WeightEntry) {
  return {
    id: entry.id,
    date: fromDbDate(entry.date),
    weightKg: entry.weightKg,
    note: entry.note,
    createdAt: entry.createdAt,
  };
}

export function presentMeal(entry: MealEntry & { food: Food }) {
  return {
    id: entry.id,
    date: fromDbDate(entry.date),
    mealType: entry.mealType,
    mealTypeLabel: LABELS.mealType[entry.mealType],
    servings: entry.servings,
    calories: entry.calories,
    fromMenu: entry.fromMenu,
    source: entry.fromMenu ? ('MENU' as const) : ('OTHER' as const),
    sourceLabel: entry.fromMenu ? 'מהתפריט' : 'מחוץ לתפריט',
    menuItemId: entry.menuItemId,
    food: presentFoodShort(entry.food),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function presentConsultation(c: Consultation & { user?: Pick<User, 'id' | 'fullName' | 'email'> }) {
  return {
    id: c.id,
    subject: c.subject,
    message: c.message,
    status: c.status,
    statusLabel: LABELS.consultationStatus[c.status],
    answer: c.answer,
    answeredAt: c.answeredAt,
    createdAt: c.createdAt,
    ...(c.user ? { user: { id: c.user.id, fullName: c.user.fullName, email: c.user.email } } : {}),
  };
}
