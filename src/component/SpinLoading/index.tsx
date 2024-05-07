import { Spin, SpinProps } from "antd"
import styles from "./index.module.sass";


const SpinLoading: React.FC<SpinProps> = (props) => {
  console.debug('SpinLoading')

  return (
    <aside className={styles.wrapper}>
      <Spin {...props} />
    </aside>
  )
}

export default SpinLoading