import { Input } from "antd";
import styles from "./index.module.sass";

interface IInputMmsi {
  type?: any
  form?: any
  extra?: any
  targetId?: any
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
  /** onBlur时的回调函数 */
  onBlurFunc?: (value: string) => void
}

// mmsi
const InputMmsi: React.FC<IInputMmsi> = ({ targetId, value, onChange, form, extra, onBlurFunc }) => {
  console.debug("InputMmsi")
  
  function handleChange(data: any) {
    onChange && onChange(data.target.value)
  }

  function blurFunc() {
    onBlurFunc && onBlurFunc(value)
  }

  return (
    <div className={styles.wrapper}>
      <Input placeholder={'请输入'} value={value} disabled={extra.disaMmsi} onChange={handleChange} onBlur={blurFunc} />
    </div>
  )
}

export default InputMmsi
