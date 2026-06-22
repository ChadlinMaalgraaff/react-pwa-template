/** Display categories for staples, in the order they should appear. */
export const STAPLE_CATEGORIES = [
  'Basics',
  'Dairy & Eggs',
  'Baking',
  'Grains & Carbs',
  'Produce',
  'Spices & Herbs',
  'Cans & Jars',
  'Sauces & Condiments',
  'Stock',
] as const

export type StapleCategory = (typeof STAPLE_CATEGORIES)[number]

export interface Staple {
  name: string
  quantity: number
  unit: string
  category: StapleCategory
  /** Everyday essentials shown up-front on the staples check-in screen. */
  common?: boolean
}

export const STAPLES: Staple[] = [
  // Basics
  { name: 'Salt', quantity: 1, unit: 'box', category: 'Basics', common: true },
  { name: 'Sugar', quantity: 1, unit: 'kg', category: 'Basics', common: true },
  { name: 'Brown Sugar', quantity: 1, unit: 'kg', category: 'Basics' },
  { name: 'Black Pepper', quantity: 1, unit: 'bottle', category: 'Basics', common: true },
  { name: 'Sunflower Oil', quantity: 750, unit: 'ml', category: 'Basics', common: true },
  { name: 'Olive Oil', quantity: 500, unit: 'ml', category: 'Basics', common: true },
  { name: 'Butter', quantity: 125, unit: 'g', category: 'Basics', common: true },
  { name: 'Vinegar', quantity: 1, unit: 'bottle', category: 'Basics' },
  // Dairy & Eggs
  { name: 'Milk', quantity: 1, unit: 'L', category: 'Dairy & Eggs', common: true },
  { name: 'Eggs', quantity: 6, unit: '', category: 'Dairy & Eggs', common: true },
  { name: 'Cheddar Cheese', quantity: 250, unit: 'g', category: 'Dairy & Eggs', common: true },
  { name: 'Fresh Cream', quantity: 250, unit: 'ml', category: 'Dairy & Eggs', common: true },
  // Baking
  { name: 'Flour', quantity: 1, unit: 'kg', category: 'Baking', common: true },
  { name: 'Cornflour', quantity: 1, unit: 'box', category: 'Baking', common: true },
  { name: 'Baking Powder', quantity: 1, unit: 'box', category: 'Baking' },
  { name: 'Bicarbonate of Soda', quantity: 1, unit: 'box', category: 'Baking' },
  { name: 'Yeast', quantity: 1, unit: 'sachet', category: 'Baking' },
  { name: 'Vanilla Essence', quantity: 1, unit: 'bottle', category: 'Baking' },
  { name: 'Cocoa Powder', quantity: 1, unit: 'box', category: 'Baking' },
  // Grains & Carbs
  { name: 'Bread', quantity: 1, unit: 'loaf', category: 'Grains & Carbs', common: true },
  { name: 'Rice', quantity: 1, unit: 'kg', category: 'Grains & Carbs', common: true },
  { name: 'Pasta', quantity: 500, unit: 'g', category: 'Grains & Carbs', common: true },
  { name: 'Potato', quantity: 1, unit: 'kg', category: 'Grains & Carbs', common: true },
  { name: 'Maize Meal', quantity: 1, unit: 'kg', category: 'Grains & Carbs', common: true },
  { name: 'Oats', quantity: 1, unit: 'kg', category: 'Grains & Carbs' },
  // Produce
  { name: 'Onion', quantity: 1, unit: 'kg', category: 'Produce', common: true },
  { name: 'Garlic', quantity: 1, unit: 'head', category: 'Produce', common: true },
  { name: 'Ginger', quantity: 100, unit: 'g', category: 'Produce', common: true },
  { name: 'Carrots', quantity: 1, unit: 'kg', category: 'Produce', common: true },
  { name: 'Tomatoes', quantity: 1, unit: 'kg', category: 'Produce', common: true },
  { name: 'Lemon', quantity: 2, unit: '', category: 'Produce' },
  { name: 'Spring Onion', quantity: 1, unit: 'bunch', category: 'Produce' },
  { name: 'Green Pepper', quantity: 1, unit: '', category: 'Produce' },
  { name: 'Mushrooms', quantity: 250, unit: 'g', category: 'Produce' },
  { name: 'Spinach', quantity: 1, unit: 'bunch', category: 'Produce' },
  // Spices & Herbs
  { name: 'Curry Powder', quantity: 1, unit: 'bottle', category: 'Spices & Herbs', common: true },
  { name: 'Mixed Herbs', quantity: 1, unit: 'bottle', category: 'Spices & Herbs', common: true },
  { name: 'Cumin', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Paprika', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Cinnamon', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Turmeric', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Chilli Flakes', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Ground Coriander', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  { name: 'Bay Leaves', quantity: 1, unit: 'box', category: 'Spices & Herbs' },
  { name: 'Nutmeg', quantity: 1, unit: 'bottle', category: 'Spices & Herbs' },
  // Cans & Jars
  { name: 'Chopped Tomatoes', quantity: 1, unit: 'can', category: 'Cans & Jars', common: true },
  { name: 'Tomato Paste', quantity: 1, unit: 'can', category: 'Cans & Jars', common: true },
  { name: 'Baked Beans', quantity: 1, unit: 'can', category: 'Cans & Jars' },
  { name: 'Chickpeas', quantity: 1, unit: 'can', category: 'Cans & Jars' },
  { name: 'Lentils', quantity: 500, unit: 'g', category: 'Cans & Jars' },
  { name: 'Coconut Milk', quantity: 1, unit: 'can', category: 'Cans & Jars' },
  { name: 'Peanut Butter', quantity: 1, unit: 'jar', category: 'Cans & Jars' },
  // Sauces & Condiments
  { name: 'Honey', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments', common: true },
  { name: 'Soy Sauce', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments' },
  { name: 'Mayonnaise', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments' },
  { name: 'Tomato Sauce', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments' },
  { name: 'Mustard', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments' },
  { name: 'Worcestershire Sauce', quantity: 1, unit: 'bottle', category: 'Sauces & Condiments' },
  // Stock
  { name: 'Chicken Stock', quantity: 1, unit: 'L', category: 'Stock' },
  { name: 'Beef Stock', quantity: 1, unit: 'L', category: 'Stock' },
]

/** Everyday essentials shown up-front on the staples check-in screen. */
export const COMMON_STAPLES: Staple[] = STAPLES.filter((staple) => staple.common)

/** The remaining staples, revealed behind "Show more". */
export const MORE_STAPLES: Staple[] = STAPLES.filter((staple) => !staple.common)

/**
 * Groups staples into their display categories, preserving STAPLE_CATEGORIES
 * order and omitting any category with no staples in the provided list.
 */
export const groupStaplesByCategory = (staples: Staple[]): [StapleCategory, Staple[]][] =>
  STAPLE_CATEGORIES.map(
    (category) =>
      [category, staples.filter((staple) => staple.category === category)] as [
        StapleCategory,
        Staple[],
      ]
  ).filter(([, list]) => list.length > 0)
