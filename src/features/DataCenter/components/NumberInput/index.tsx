import { InputNumber } from "antd";
import styles from "./index.module.sass";


interface INumberInput {
  unit?: any
  value?: any
  onChange?: any
  onFinish?: Function
}

/**
 * 档案数据详情页的基本信息展示
 * @param param0 
 * @returns 
 */
const NumberInput: React.FC<INumberInput> = (props) => {
  console.debug("NumberInput")
  const { onChange, onFinish, unit } = props;
  function handleChange(value: any) {
    onChange && onChange(value)
    onFinish && onFinish(value)
  }

  return (
    <div className={styles.wrapper}>
      <InputNumber onChange={handleChange} min={0} precision={0}/>
      <div className={`${styles.unit} unit`}>{unit}</div>
    </div>
  )
}


// // 组件属性默认值
NumberInput.defaultProps = {
  unit: ''
}

export default NumberInput