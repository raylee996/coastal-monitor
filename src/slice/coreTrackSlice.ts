import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import { RootState } from '../app/store';

interface Value {
  targetList: { mmsi?: number | string, batchNum?: string }[]
  isShow: boolean
}

interface InitialState {
  value: Value
}

const initialState: InitialState = {
  value: {
    targetList: [],
    isShow: false
  }
}

export const coreTrackSlice = createSlice({
  name: 'coreTrack',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Value>) => {
      state.value = action.payload;
    },
    add: (state, action: PayloadAction<{
      targetList: any[]
      isShow?: boolean
    }>) => {
      state.value.targetList = state.value.targetList.concat(action.payload.targetList)
      if (!_.isUndefined(action.payload.isShow)) {
        state.value.isShow = action.payload.isShow
      }
    },
    closeTrack: (state) => {
      state.value = {
        ...state.value,
        isShow: false
      }
    },
    clearTrack: (state) => {
      state.value = {
        targetList: [],
        isShow: false
      }
    }
  }
});

export const { set, add, closeTrack, clearTrack } = coreTrackSlice.actions;

export const selectValue = (state: RootState) => state.coreTrack.value;

export const selectIsShowCoreTrack = (state: RootState) => state.coreTrack.value.isShow;

export const selectTargetList = (state: RootState) => state.coreTrack.value.targetList;

export default coreTrackSlice.reducer;
