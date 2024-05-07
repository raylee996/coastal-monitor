import { useAppDispatch } from "app/hooks"
import { useEffect, useState } from "react"
import { setSituationalAnalysis } from "slice/coreMapSlice"
import AISTable from "../AISTable"
import CarTable from "../CarTable"
import CodeTable from "../CodeTable"
import RadioGroupTabs from "../components/RadioGroupTabs"
import FaceTable from "../FaceTable"
import PersonTable from "../PersonTable"
import RadarTable from "../RadarTable"
import VideoTable from "../VideoTable"
import OverallSituationItem from "./components/OverallSituationItem"
import styles from "./index.module.sass"


interface Props {
  params?: any
  value?: string
  setValue?: (val: string) => void
}

const OverallSituation: React.FC<Props> = ({ params, value, setValue }) => {
  console.debug('OverallSituation')


  const dispatch = useAppDispatch()


  const [radioValue, setRadioValue] = useState(value || '0')
  const [realParams, setRealParams] = useState(params)


  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  useEffect(() => {
    setValue && radioValue && setValue(radioValue)
  }, [radioValue, setValue])

  useEffect(() => {
    radioValue !== value && setRealParams({})
  }, [value, radioValue])


  return (
    <article className={styles.wrapper}>
      <RadioGroupTabs key={'OverallSituation'} value={radioValue} setValue={setRadioValue} />
      {radioValue === '0' && <OverallSituationItem params={value === '0' ? realParams : {}} />}
      {radioValue === '1' && <AISTable params={value === '1' ? realParams : {}} />}
      {radioValue === '2' && <RadarTable params={value === '2' ? realParams : {}} />}
      {radioValue === '3' && <CodeTable params={value === '3' ? realParams : {}} />}
      {radioValue === '4' && <FaceTable params={value === '4' ? realParams : {}} />}
      {radioValue === '5' && <CarTable params={value === '5' ? realParams : {}} />}
      {radioValue === '6' && <VideoTable params={value === '6' ? realParams : {}} />}
      {radioValue === '7' && <PersonTable params={value === '7' ? realParams : {}} />}
    </article>
  )
}

export default OverallSituation