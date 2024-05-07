import styles from "./index.module.sass";
import FormInterface from "hooks/integrity/FormInterface"


const inputs = [
  ['名称', 'name']
]

interface Props {
  onAsyncFinish: (data: any) => Promise<void>
}

const ConfirmArea: React.FC<Props> = ({ onAsyncFinish }) => {
  console.debug('ConfirmArea')

  return (
    <article className={styles.wrapper}>
      <FormInterface inputs={inputs} onAsyncFinish={onAsyncFinish} />
    </article>
  )
}


export default ConfirmArea