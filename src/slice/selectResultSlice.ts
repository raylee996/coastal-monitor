import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface InitialState {
  value: any[]
}

const initialState: InitialState = {
  value: []
};

export const selectResultSlice = createSlice({
  name: 'selectResult',
  initialState,
  reducers: {
    setSelectResult: (state, action: PayloadAction<any>) => {
      state.value = action.payload;
    }
  }
});

export const { setSelectResult } = selectResultSlice.actions;

export const selectResult = (state: RootState) => state.selectResult.value;

export default selectResultSlice.reducer;
