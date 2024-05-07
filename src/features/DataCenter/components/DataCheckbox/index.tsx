import { Checkbox } from "antd";
import { isNull } from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface IDataCheckbox {
  data: any
  checked?: string[]
  setChecked?: Function
  onFinish?: any
}

const DataCheckbox: React.FC<IDataCheckbox> = (props) => {
  console.debug("DataCheckbox")
  const { data, checked, setChecked, onFinish } = props;
  console.log(setChecked)

  const [myChecked, setMyChecked] = useState<any>('')

  useEffect(() => {
    setMyChecked(checked)
  }, [checked])

  function handleChange(value: any) {
    // setChecked && setChecked(value)
    setMyChecked(value)
    onFinish && onFinish(value)
    // onFinish && onFinish(value)
  }

  return (
    <div>
      <Checkbox.Group onChange={handleChange} value={myChecked} className={styles.wrapperGroup}>
        {
          data && data.map((item: any, index: number) => {
            return (
              <div key={index} className={styles.checkboxCol}>
                <Checkbox value={item.value}>
                  {item.label && !isNull(item.label) ? <span className={styles.checkboxColTitle}>{item.label}</span> : null}
                  {item.component ? <span className={styles.checkboxColTitle}>{item.component}</span> : null}
                </Checkbox>
              </div>
            )
          })
        }
      </Checkbox.Group>
    </div>
  )
}

export default DataCheckbox