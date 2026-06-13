import { RootState } from '@store/index'

export const selectPantryItemCount = (state: RootState) => state.pantry.itemCount
