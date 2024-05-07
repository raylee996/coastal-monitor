import { Button } from "antd"
import WisdomModel from "features/Core/components/WisdomModel"
import popup from "hooks/basis/Popup"
import SelectSimple from "hooks/basis/SelectSimple"
import { useEffect, useState } from "react"
import { getModelListAsync } from "server/core/model"
import { PageInfo } from "../.."
import styles from './index.module.sass'

interface Props {
  onChange?: Function
  value: any
  /** 默认文字 */
  placeholder?: string
}

const JudgmentModelingSelectAdd: React.FC<Props> = ({ onChange, value, placeholder = "请选择" }) => {
  console.debug('JudgmentModelingSelectAdd')

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    requestList()
  }, [])

  useEffect(() => {
    if(data?.length && !data.map(v => v.value).includes(value)) {
      onChange && onChange('')
    }
  }, [data, onChange, value])

  function handleChange(value: any) {
    onChange && onChange(value)
  }

  function handleClick() {
    popup(<WisdomModel isShowTable={false} getRecord={getRecord} />, { title: '智慧建模', size: 'fullscreen' })
  }

  async function getRecord(params: any) {
    await requestList()
    params?.modelId && handleChange(params?.modelId)
  }

  async function requestList() {
    const res = await getModelListAsync(PageInfo, {})
    setData(res?.data?.map((item: any) => {
      return {
        name: item.modelName,
        value: item.modelId,
        ...item
      }
    }) || [])
  }

  return (
    <article className={styles.wrapper}>
      <SelectSimple
        value={value}
        onChange={handleChange}
        dict={data}
        placeholder={placeholder}
      />
      <Button type={'link'} onClick={handleClick}>{`添加模型`}</Button>
    </article>
  )
}

export default JudgmentModelingSelectAdd