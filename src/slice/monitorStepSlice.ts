import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface InitialState {
  value: number
}

const initialState: InitialState = {
  value: 20
}

export const monitorStepSlice = createSlice({
  name: 'monitorStep',
  initialState,
  reducers: {
    setMonitorStep: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  }
});

export const { setMonitorStep } = monitorStepSlice.actions;

export const selectMonitorStep = (state: RootState) => state.monitorStep.value;

export default monitorStepSlice.reducer;
