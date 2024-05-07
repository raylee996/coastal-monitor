import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface InitialState {
  value: {
    layer: any
  }
}

const initialState: InitialState = {
  value: {
    layer: undefined
  }
}

export const coreAreaSlice = createSlice({
  name: 'coreArea',
  initialState,
  reducers: {
    setCoreArea: (state, action: PayloadAction<any>) => {
      state.value.layer = action.payload;
    },
    clearCoreArea: (state) => {
      state.value.layer = undefined
    }
  }
});

export const { setCoreArea, clearCoreArea } = coreAreaSlice.actions;

export const selectCoreArea = (state: RootState) => state.coreArea.value;

export default coreAreaSlice.reducer;
