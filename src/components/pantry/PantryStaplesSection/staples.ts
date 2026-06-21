export interface Staple {
  name: string
  quantity: number
  unit: string
}

export const STAPLES: Staple[] = [
  // Basics
  { name: 'Salt', quantity: 1, unit: 'box' },
  { name: 'Sugar', quantity: 1, unit: 'kg' },
  { name: 'Black Pepper', quantity: 1, unit: 'bottle' },
  { name: 'Sunflower Oil', quantity: 750, unit: 'ml' },
  { name: 'Butter', quantity: 125, unit: 'g' },
  { name: 'Vinegar', quantity: 1, unit: 'bottle' },
  // Dairy & Protein
  { name: 'Milk', quantity: 1, unit: 'L' },
  { name: 'Eggs', quantity: 6, unit: '' },
  // Baking
  { name: 'Flour', quantity: 1, unit: 'kg' },
  { name: 'Baking Powder', quantity: 1, unit: 'box' },
  // Pantry
  { name: 'Bread', quantity: 1, unit: 'loaf' },
  { name: 'Rice', quantity: 1, unit: 'kg' },
  { name: 'Pasta', quantity: 500, unit: 'g' },
  { name: 'Potato', quantity: 1, unit: 'kg' },
  // Produce
  { name: 'Onion', quantity: 1, unit: 'kg' },
  { name: 'Garlic', quantity: 1, unit: 'head' },
  { name: 'Lemon', quantity: 2, unit: '' },
  // Spices
  { name: 'Cumin', quantity: 1, unit: 'bottle' },
  { name: 'Paprika', quantity: 1, unit: 'bottle' },
  { name: 'Cinnamon', quantity: 1, unit: 'bottle' },
  { name: 'Turmeric', quantity: 1, unit: 'bottle' },
  { name: 'Chilli Flakes', quantity: 1, unit: 'bottle' },
  // Condiments
  { name: 'Tomato Paste', quantity: 1, unit: 'can' },
  { name: 'Soy Sauce', quantity: 1, unit: 'bottle' },
  { name: 'Chicken Stock', quantity: 1, unit: 'L' },
]
