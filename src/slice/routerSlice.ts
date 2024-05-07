import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import { RootState } from '../app/store';


interface RouterSliceState {
  value: {
    navigate?: {
      path: string,
      state: any
    }
  }
}

const initialState: RouterSliceState = {
  value: {
    navigate: undefined
  }
};

export const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<any>) => {
      state.value = action.payload;
    },
    setNavigate: (state, action: PayloadAction<any>) => {
      const _value = { ...state.value }
      _.set(_value, 'navigate', action.payload)
      state.value = _value;
    },
    clearNavigate: (state) => {
      const _value = { ...state.value }
      _.set(_value, 'navigate', undefined)
      state.value = _value;
    }
  }
});

export const { set, setNavigate, clearNavigate } = routerSlice.actions;

export const selectValue = (state: RootState) => state.router.value;

export default routerSlice.reducer;
