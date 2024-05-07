import { Switch, SwitchProps } from "antd";
import _ from "lodash";
import { useState } from "react";
import styles from "./index.module.sass";

interface Props extends Omit<SwitchProps, 'onChange' | 'value'> {
  data?: any
  remote?: (checked: boolean, data: any) => Promise<boolean>
  value?: boolean
  onChange?: Function
}

const SwitchRemote: React.FC<Props> = (props) => {
  console.debug('SwitchRemote')

  const { value, onChange, checkedChildren, unCheckedChildren, data, remote, ...switchProps } = props

  const [realValue, setRealValue] = useState<boolean>(() => {
    if (_.isUndefined(value)) {
      return true
    } else {
      return value
    }
  })
  const [loading, setLoading] = useState<boolean>(false)


  async function handleChange(checked: boolean) {
    if (_.isFunction(remote)) {
      let result = checked
      setLoading(true)
      result = await remote(checked, data)
      setRealValue(result)
      setLoading(false)
    } else {
      setRealValue(checked)
    }
  }

  return (
    <article className={styles.wrapper}>
      <Switch
        loading={loading}
        checkedChildren={checkedChildren || '启用'}
        unCheckedChildren={unCheckedChildren || '停用'}
        checked={realValue}
        onChange={handleChange}
        {...switchProps} />
    </article>
  )
}

export default SwitchRemote