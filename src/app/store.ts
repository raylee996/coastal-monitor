import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userInfoReducer from '../slice/userInfoSlice';
import coreMapReducer from '../slice/coreMapSlice';
import websocketSendSliceReducer from '../slice/websocketSendSlice';
import websocketMessageSliceReducer from '../slice/websocketMessageSlice';
import routerSliceReducer from '../slice/routerSlice';
import planConfigSliceReducer from '../slice/planConfigSlice';
import funMenuSliceReducer from '../slice/funMenuSlice';
import selectTargetReducer from '../slice/selectTargetSlice';
import coreTrackReducer from '../slice/coreTrackSlice';
import coreSectorReducer from '../slice/coreSectorSlice';
import selectResultReducer from '../slice/selectResultSlice';
import coreAreaReducer from '../slice/coreAreaSlice';
import videoLinkReducer from '../slice/videoLinkSlice';
import monitorStepReducer from '../slice/monitorStepSlice';


export const store = configureStore({
  reducer: {
    userInfo: userInfoReducer,
    coreMap: coreMapReducer,
    websocketSend: websocketSendSliceReducer,
    websocketMessage: websocketMessageSliceReducer,
    router: routerSliceReducer,
    planConfig: planConfigSliceReducer,
    funMenu: funMenuSliceReducer,
    selectTarget: selectTargetReducer,
    coreTrack: coreTrackReducer,
    coreSecotr: coreSectorReducer,
    selectResult: selectResultReducer,
    coreArea: coreAreaReducer,
    videoLink: videoLinkReducer,
    monitorStep: monitorStepReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['coreMap/setMap2D', 'coreArea/setCoreArea'],
        // Ignore these field paths in all actions
        // ignoredActionPaths: ['coreMap/setMap2D'],
        // Ignore these paths in the state
        ignoredPaths: ['coreMap.value.map2d', 'coreArea.value.layer'],
      },
    })
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
