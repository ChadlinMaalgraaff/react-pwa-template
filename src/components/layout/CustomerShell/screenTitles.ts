const SCREEN_TITLES: Record<string, string> = {
  '/pantry': 'Pantry',
  '/recipes': 'Recipes',
  '/recipes/browse': 'Recipes',
  '/specials': 'Specials',
  '/shopping-lists': 'Shopping Lists',
  '/profile': 'Profile & Settings',
}

export const getScreenTitle = (pathname: string): string => {
  if (SCREEN_TITLES[pathname]) {
    return SCREEN_TITLES[pathname]
  }
  if (pathname.startsWith('/recipes/')) {
    return 'Recipe Detail'
  }
  if (pathname.startsWith('/shopping-lists/')) {
    return 'Shopping List'
  }
  return 'PantryPal'
}
