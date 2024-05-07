import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

// 在首页画扇形图
interface CoreSectorState {
    // 扇形参数
    params: {
        center?: [number, number],
        radius?: number,
        startAngle?: number,
        endAngle?: number,
        pointNum?: number,
        showSector?: boolean,
        key?: string
    }
    // 向后兼容，重新创建一个扇形数组
    sectorArr: {
        center?: [number, number],
        radius?: number,
        startAngle?: number,
        endAngle?: number,
        pointNum?: number,
        showSector?: boolean,
        key?: string
    }[]
}

interface PayProps {
    center?: [number, number],
    radius?: number,
    startAngle?: number,
    endAngle?: number,
    pointNum?: number,
    showSector?: boolean
    key?: string
}

const initialState: CoreSectorState = {

    params: {
        center: [22.482749, 113.926506],
        radius: 0.1,
        startAngle: 165,
        endAngle: 180,
        pointNum: 100,
        showSector: false
    },
    sectorArr: []
}

export const coreSectorSlice = createSlice({
    name: 'coreSecotr',
    initialState,
    reducers: {
        setParams: (state, actions: PayloadAction<PayProps>) => {
            state.params = actions.payload
        },
        setSectorArr: (state, actions: PayloadAction<PayProps>) => {
            // 判断传入的值，原数组中是否有，有的话，直接修改，否则，追加
            let key = actions.payload.key
            let list = state.sectorArr.filter((item: any) => {
                return item.key === key
            })
            let _sectorList = []
            if (list && list.length > 0) {
                // 直接修改原值
                _sectorList = state.sectorArr.map((item:any)=>{
                    if(item.key === key){
                        return actions.payload
                    }
                    return item
                })
                state.sectorArr = _sectorList
            } else {
                // 直接追加
                _sectorList = [...state.sectorArr, actions.payload]
                state.sectorArr = _sectorList;
            }
        }
    }
})

export const { setParams, setSectorArr } = coreSectorSlice.actions

export const sectorParams = (state: RootState) => state.coreSecotr.params
export const sectorArr = (state: RootState) => state.coreSecotr.sectorArr

export default coreSectorSlice.reducer