import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Map2D from 'helper/Map2D';
import _ from 'lodash';
import { RootState } from '../app/store';


interface CoreMapSliceState {
  value: {
    map2d?: Map2D
    isSituationalAnalysis: boolean
  },
  // 预警信息中的查询历史轨迹面板需要用到。
  historyTrackLoading: boolean
}

const initialState: CoreMapSliceState = {
  value: {
    map2d: undefined,
    isSituationalAnalysis: true,
  },
  historyTrackLoading: false
};

export const coreMapSlice = createSlice({
  name: 'coreMap',
  initialState,
  reducers: {
    setHistoryTrackLoading: (state, action: PayloadAction<boolean>) => {
      state.historyTrackLoading = action.payload
    },
    set: (state, action: PayloadAction<any>) => {
      state.value = action.payload;
    },
    setMap2D: (state, action: PayloadAction<Map2D>) => {
      const _value = _.clone(state.value)
      _.set(_value, 'map2d', action.payload)
      state.value = _value;
    },
    setSituationalAnalysis: (state, action: PayloadAction<boolean>) => {
      const _value = _.clone(state.value)
      _.set(_value, 'isSituationalAnalysis', action.payload)
      state.value = _value;
    },
    clearMap2D: (state) => {
      state.value = {
        ...state.value,
        map2d: undefined
      }
    }
  }
});

export const { set, setMap2D, setSituationalAnalysis, clearMap2D, setHistoryTrackLoading } = coreMapSlice.actions;

export const selectValue = (state: RootState) => state.coreMap.value;
export const historyTrackLoading = (state: RootState) => state.coreMap.historyTrackLoading

export default coreMapSlice.reducer;
