import { WarningOutlined } from "@ant-design/icons";
import styles from "./index.module.sass";

interface Props {
  title: string
}

const WarnNotificationHeader: React.FC<Props> = ({ title }) => {
  console.debug('WarnNotificationHeader')

  return (
    <article className={styles.wrapper}>
      <WarningOutlined style={{ color: 'red' }} />
      <span>{title}</span>
    </article>
  )
}

export default WarnNotificationHeader