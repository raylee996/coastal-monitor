import TabsRadio from "component/TabsRadio";

export interface RadioTabsPorps {
  /** tabs值 */
  value: string
  /** 更新tabs值方法 */
  setValue: Function
}

export const WisdomSearchTabs = [
  { value: '0', name: '全局', icon: 'quanju' },
  { value: '1', name: 'AIS', icon: 'a-1AIS' },
  { value: '2', name: '雷达', icon: 'leida' },
  // { value: '3', name: '侦码', icon: 'zhenma' },
  { value: '4', name: '人脸', icon: 'renlian' },
  { value: '5', name: '车辆', icon: 'cheliang' },
  { value: '6', name: '视频', icon: 'luxiang', size: 12, height: 32 },
  { value: '7', name: '身份证', icon: 'shenfenzheng' ,size: 12,height: 32 }
]

const RadioGroupTabs: React.FC<RadioTabsPorps> = ({ value, setValue }) => {
  console.debug('RadioGroupTabs')

  function handleChange(activeKey: string) {
    setValue(activeKey);
  }

  return (
    <TabsRadio options={WisdomSearchTabs} defaultActive={value} onChange={handleChange} />
  )
}

export default RadioGroupTabs