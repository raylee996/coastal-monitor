import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface Value {
  /** channel 更新船舶信息通道消息*/
  channel_ship: any,
  channel_trails: any
}

interface WebsocketMessageState {
  value: Value
}

const initialState: WebsocketMessageState = {
  value: {
    channel_ship: null,
    channel_trails: null,
  }
};

export const websocketMessageSlice = createSlice({
  name: 'websocketMessage',
  initialState,
  reducers: {
    setMessageShip: (state, action: PayloadAction<any>) => {
      state.value.channel_ship = action.payload;
    },
    setMessageTrails: (state, action: PayloadAction<any>) => {
      state.value.channel_trails = action.payload;
    },
  }
});

export const {
  setMessageShip,
  setMessageTrails
} = websocketMessageSlice.actions;

export const selectMessageShip = (state: RootState) => state.websocketMessage.value.channel_ship;

export const selectMessageTrails = (state: RootState) => state.websocketMessage.value.channel_trails;

export default websocketMessageSlice.reducer;
