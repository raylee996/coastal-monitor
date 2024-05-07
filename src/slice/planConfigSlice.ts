import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface PlanConfigState {
  value: any[]
}

const initialState: PlanConfigState = {
  value: []
};

export const planConfigSlice = createSlice({
  name: 'planConfig',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<any>) => {
      state.value = action.payload;
    },
    clear: (state) => {
      state.value = []
    },
  }
});

export const { set, clear } = planConfigSlice.actions;

export const selectValue = (state: RootState) => state.planConfig.value;

export default planConfigSlice.reducer;
