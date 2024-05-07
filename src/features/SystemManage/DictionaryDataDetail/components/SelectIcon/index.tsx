import { Select } from "antd"
import { DefaultOptionType, SelectProps } from "antd/es/select"
import { shipIconType } from "helper/dictionary"
import styles from "./index.module.sass";


const options: DefaultOptionType[] = shipIconType.map(dict => {
  return {
    value: dict.value,
    label: (
      <div>
        <img className={styles.img} src={dict.name} alt='' />
      </div>
    )
  }
})

const SelectIcon: React.FC<SelectProps> = (props) => {
  console.debug('SelectIcon')


  return (
    <Select options={options} size='large' {...props} />
  )
}

export default SelectIcon