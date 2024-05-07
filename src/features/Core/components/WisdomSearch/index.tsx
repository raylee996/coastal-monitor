import { Form } from "antd";
import dayjs from "dayjs";
import windowstill from "hooks/basis/Windowstill";
import FormPanel from "hooks/flexibility/FormPanel";
import { useCallback, useEffect, useMemo, useState } from "react"
import { controlInputs } from "./AISTable";
import { CarInputs } from "./CarTable";
import { CodeInputs } from "./CodeTable";
import RadioGroupTabs from "./components/RadioGroupTabs";
import { FaceInputs } from "./FaceTable";
import styles from "./index.module.sass";
import OverallSituation from "./OverallSituation";
import { OverallInputs } from "./OverallSituation/components/OverallSituationItem";
import { RadarInputs } from "./RadarTable";
import { VideoInputs } from "./VideoTable";
import SvgPic from 'component/SvgaPic'
import { useAppDispatch } from "app/hooks";
import { setSituationalAnalysis } from "slice/coreMapSlice";
import { personInputs } from "./PersonTable";


export interface WisdomProps {
  /** 请求参数 */
  params: any
}

const searchTabs = [OverallInputs, controlInputs, RadarInputs, CodeInputs, FaceInputs, CarInputs, VideoInputs, personInputs]
const IconList: string[] = ['a-1quanju', 'a-1AIS', 'a-1leida', 'a-1zhenma', 'a-1renlian', 'a-1cheliang', 'a-1shipin', 'shenfenzhengzuoce']
const picSearch = require('images/situation/serch.svga')

const initData = undefined

const options = {
  isShowReset: true,
  submitText: '搜索'
}

const formProps = {
  labelCol: {
    span: 4,
  }
}

interface Props {
  /** 关闭弹窗 */
  onClosePopup?: Function
}

const WisdomSearchHome: React.FC<Props> = ({ onClosePopup }) => {
  console.debug('WisdomSearchHome')


  const dispatch = useAppDispatch()


  const [form] = Form.useForm();


  const [value, setValue] = useState<string>('0')

  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])



  useEffect(() => {
    form && form.resetFields()
  }, [form, value])

  useEffect(() => {
    form && form.setFieldsValue(
      value === '0' ? {} : {
        datetime: [dayjs().subtract(1, 'day'), dayjs()],
        ...(value === '4' ? { searchType: 0 } : {})
      })
  }, [form, value]);


  const handleFinish = useCallback(
    (params: any) => {
      onClosePopup && onClosePopup()
      windowstill(<OverallSituation params={params} value={value} setValue={setValue} />, { title: '智搜', key: '分类智搜页面', width: '1880px', height: '840px', offset: [20, 70] })
    },
    [onClosePopup, value],
  )

  const inputs = useMemo(() => searchTabs[Number(value)], [value])


  return (
    <article className={styles.wrapper}>
      <div className={styles.imageBox}>
        <div className={styles.image}>
          <span className={`${styles.leftIcon} iconfont icon-${IconList[Number(value)]}`}></span>

          <div className={styles.leftSvg}>
            <SvgPic pic={picSearch} svagid='serchid' option={{ height: '420px', width: '427px' }} />
          </div>

        </div>
      </div>
      <div className={styles.contentBox}>
        <RadioGroupTabs key={'WisdomSearchHome'} value={value} setValue={setValue} />
        <div className={styles.content}>
          <FormPanel
            form={form}
            inputs={inputs}
            initData={initData}
            options={options}
            formProps={formProps}
            onFinish={handleFinish} />
        </div>
      </div>
    </article>
  )
}

export default WisdomSearchHome