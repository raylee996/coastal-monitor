import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

interface FunMenuState {
    index: number
    params: any
    showPlanView: boolean
}

const initialState: FunMenuState = {
    index: -1,
    params: {},
    showPlanView: false
}

export const funMenuSlice = createSlice({
    name: 'funMenu',
    initialState,
    reducers: {
        setIndex: (state, actions: PayloadAction<number>) => {
            state.index = actions.payload
        },
        setParams: (state, actions: PayloadAction<any>) => {
            state.params = actions.payload
        },
        setShowPlanView: (state, actions: PayloadAction<any>) => {
            state.showPlanView = actions.payload
        },
        resetIndex: (state) => {
            state.index = -1
        },
        resetParams: (state) => {
            state.params = {}
        },
        resetShowPlanView: (state) => {
            state.showPlanView = false
        }
    }
})

export const { setIndex, setParams, setShowPlanView, resetIndex, resetParams, resetShowPlanView } = funMenuSlice.actions

export const currentIndex = (state: RootState) => state.funMenu.index
export const currentParams = (state: RootState) => state.funMenu.params
export const currentShowPlanView = (state: RootState) => state.funMenu.showPlanView

export default funMenuSlice.reducer