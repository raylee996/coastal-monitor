import { Transfer } from "antd";
import { TransferItem } from "antd/es/transfer";
import { Type } from "hooks/hooks";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface Props {
  /** 值 */
  value?: any[]
  /** 值更新的回调 */
  onChange?: (value: any) => void
  /** 远程数据请求 */
  remote?: () => Promise<Type<any>[]>
}

const TransferSimple: React.FC<Props> = ({ value, onChange, remote }) => {
  console.debug('TransferSimple')

  const [dataSource, setDataSource] = useState<TransferItem[]>()
  const [targetKeys, setTargetKeys] = useState<any[]>();

  useEffect(() => {
    async function main() {
      if (remote) {
        const vo = await remote()
        const _dataSource = vo.map(item => ({
          name: item.name,
          key: item.value
        }))
        setDataSource(_dataSource)
      }
    }
    main()
  }, [remote])

  useEffect(() => {
    if (value) {
      setTargetKeys(value)
    }
  }, [value])

  function handleChange(targetKeys: any[]) {
    onChange && onChange(targetKeys)
  }

  return (
    <article className={styles.wrapper}>
      <Transfer
        dataSource={dataSource}
        titles={['可选择', '已选择']}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={(item) => item.name}
      />
    </article>
  )
}

export default TransferSimple