import { useAppDispatch, useAppSelector } from "app/hooks"
import ViewHistoryTrack from "features/Core/components/ShipList/components/ViewHistoryTrack"
import _ from "lodash"
import { useCallback, useMemo } from "react"
import { selectValue, set } from "slice/coreTrackSlice"



const HocViewHistoryTrack = () => {
  console.debug('HocViewHistoryTrack')

  const dispatch = useAppDispatch()

  const coreTrack = useAppSelector(selectValue)

  const targetType = useMemo(() => {
    let result = 'ais'
    if (coreTrack.targetList.some(ele => _.has(ele, 'batchNum'))) {
      result = 'radar'
    }
    return result
  }, [coreTrack])

  const list = useMemo(() => coreTrack.targetList, [coreTrack])

  const handleSetList = useCallback((list: any[]) => {
    dispatch(set({
      targetList: list,
      isShow: true
    }))
  }, [dispatch])

  return <ViewHistoryTrack list={list} setList={handleSetList} targetType={targetType} />
}

export default HocViewHistoryTrack