import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

interface winPositionProps {
  width?: number,
  height?: number,
  left?: number,
  top?: number
}

interface winPositionData {
  width: number,
  height: number,
  left: number,
  top: number
}

interface Value {
  keys: string[]
  selectedKey: string, //当前选中的视频key和deviceList里面的一致，关联关系
  winPosition: winPositionData,//弹窗位置和大小
  controlWinPosition: winPositionData //控制窗口的位置
  deviceList: {
    key: string
    deviceCode: string,
    videoInfo: any,
    videoLinkData?: any,
    stepVal?: number,//步长
  }[]
}

interface VideoLinkState {
  value: Value
}

const initialState: VideoLinkState = {
  value: {
    keys: [],
    selectedKey: '', //初始值为空
    winPosition: {
      width: 0,
      height: 0,
      top: 0,
      left: 0
    },
    controlWinPosition: {
      width: 0,
      height: 0,
      top: 0,
      left: 0
    },
    deviceList: []
  }
}

export const videoLinkSlice = createSlice({
  name: 'videoLink',
  initialState,
  reducers: {
    // 设置云台控制的位置
    setControlWinPosition: (state, action: PayloadAction<winPositionProps>) => {
      state.value.controlWinPosition = {
        ...state.value.controlWinPosition,
        ...action.payload
      }
    },
    // 设置弹窗位置
    setWinInfo: (state, action: PayloadAction<winPositionProps>) => {
      state.value.winPosition = {
        ...state.value.winPosition,
        ...action.payload
      }
    },
    //当前选中的视频
    setSelectedKey: (state, action: PayloadAction<string>) => {
      state.value.selectedKey = action.payload
    },
    setDeviceList: (state, action: PayloadAction<any>) => {
      // 判断传入的值，原数组中是否有，有的话，直接修改，否则，追加
      let key = action.payload.key
      let list = state.value.deviceList.filter((item: any) => {
        return item.key === key
      })
      if (state.value.deviceList.length <= 3) {
        // 有相同的就替换，否则直接追加
        let _deviceList = [...state.value.deviceList]
        for (let i = 0; i < state.value.deviceList.length; i++) {
          if (state.value.deviceList[i].key === key) {
            _deviceList.splice(i, 1, action.payload)
          }
        }
        if (list.length === 0) {
          _deviceList = [...state.value.deviceList, action.payload]
        }
        state.value.deviceList = _deviceList;
      } else {
        // 长度大于3，替换。
        let _deviceList = [...state.value.deviceList]
        for (let i = 0; i < state.value.deviceList.length; i++) {
          if (state.value.deviceList[i].key === key) {
            _deviceList.splice(i, 1, action.payload)
          }
        }
      }
    },
  }
});


export const { setDeviceList, setSelectedKey, setWinInfo, setControlWinPosition } = videoLinkSlice.actions;

export const selectVideoLinkDeviceList = (state: RootState) => state.videoLink.value.deviceList;
export const selectedKey = (state: RootState) => state.videoLink.value.selectedKey
export const winPositionInfo = (state: RootState) => state.videoLink.value.winPosition
export const controlWinPositionInfo = (state: RootState) => state.videoLink.value.controlWinPosition

export default videoLinkSlice.reducer;
