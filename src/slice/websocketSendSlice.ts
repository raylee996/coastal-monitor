import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';


interface Value {
  /** channel 更新船舶信息通道发送消息*/
  channel?: any
}

interface WebsocketSendState {
  value: Value
}

const initialState: WebsocketSendState = {
  value: {
    channel: null
  }
};

const waitFn = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}

export const websocketSend = createAsyncThunk('websocket/send', async (data: any) => {
  await waitFn(500)
  return data
})

export const websocketSendSlice = createSlice({
  name: 'websocketSend',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(websocketSend.fulfilled, (state, action) => {
        state.value.channel = action.payload.channel
      })
  }
});

export const selectWebsocketSend = (state: RootState) => state.websocketSend.value;

export default websocketSendSlice.reducer;
