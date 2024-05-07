import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

interface Value {
  mmsi?: string
  radar?: string
  isCenter?: boolean
}

interface InitialState {
  value: Value
}

const initialState: InitialState = {
  value: {}
};

export const selectTargetSlice = createSlice({
  name: 'selectTarget',
  initialState,
  reducers: {
    selectTarget: (state, action: PayloadAction<Value>) => {
      state.value = action.payload;
    },
    clearSelectTarget: (state) => {
      state.value = {}
    },
    clearSelectTargetByValue: (state, action: PayloadAction<Value>) => {
      if (state.value.mmsi === action.payload.mmsi || state.value.radar === action.payload.radar) {
        state.value = {}
      }
    },
  }
});

export const { selectTarget, clearSelectTarget, clearSelectTargetByValue } = selectTargetSlice.actions;

export const selectTargetValue = (state: RootState) => state.selectTarget.value;

export default selectTargetSlice.reducer;
