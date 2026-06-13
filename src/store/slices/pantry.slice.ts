import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PantryState {
  itemCount: number
}

const initialState: PantryState = {
  itemCount: 0,
}

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    setPantryItemCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload
    },
  },
})

export const { setPantryItemCount } = pantrySlice.actions

export default pantrySlice.reducer
