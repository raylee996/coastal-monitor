import dayjs from "dayjs"
import { DayjsPair } from "hooks/hooks"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import EntryExitRecords from "../EntryExitRecords"


interface NavigateState {
  state?: {
    /** 场所id */
    id?: string
    /** 时间范围 */
    range?: [string, string]
  }
}

const HOCEntryExitRecords: React.FC = () => {
  console.debug('HOCEntryExitRecords')


  const { state } = useLocation() as NavigateState


  const id = useMemo(() => state?.id, [state])

  const range = useMemo(() => {
    if (state?.range) {
      const [sTimeStr, eTimeStr] = state.range
      const result: DayjsPair = [dayjs(sTimeStr), dayjs(eTimeStr)]
      return result
    } else {
      return undefined
    }
  }, [state])


  return <EntryExitRecords id={id} range={range} />
}


export default HOCEntryExitRecords