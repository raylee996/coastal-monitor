import { Button, Modal, Select } from "antd";
import { Key, useCallback, useEffect, useState } from "react";
import { getAreaOptionsAndRecords } from "server/core/controlManage";
import MapAreaSelect from "./components/MapAreaSelect";
import styles from "./index.module.sass";


export type AreaDeviceValueType = Key | Key[]

interface Props {
  value?: AreaDeviceValueType
  onChange?: (val: AreaDeviceValueType) => void
}

const AreaDeviceInput: React.FC<Props> = ({ value, onChange }) => {
  console.debug('AreaDeviceInput')


  const [isOpenAreaSelect, setIsOpenAreaSelect] = useState(false)
  const [options, setOptions] = useState<{ label: string, value: Key }[]>()
  const [areaList, setAreaList] = useState<any[]>()


  const handleUpdate = useCallback(
    async (ctr?: AbortController) => {
      const [_options, _areaList] = await getAreaOptionsAndRecords(ctr)
      setOptions(_options)
      setAreaList(_areaList)
    },
    []
  )

  // 初始化区域数据
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      await handleUpdate(ctr)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [handleUpdate])


  // 打开区域管理
  const handleOpenAreaSelect = useCallback(
    () => {
      setIsOpenAreaSelect(true)
    },
    [],
  )

  // 关闭区域管理
  const handleCloseAreaSelect = useCallback(
    () => {
      setIsOpenAreaSelect(false)
    },
    [],
  )

  const handleChange = useCallback(
    (val: AreaDeviceValueType) => {
      onChange && onChange(val)
    },
    [onChange],
  )


  return (
    <article className={styles.wrapper}>
      <section className={styles.inputs}>
        <Select options={options} value={value} onChange={handleChange} placeholder='请选择区域' />
        <Button type="text" size="small" onClick={handleOpenAreaSelect}>添加</Button>
      </section>
      <Modal
        title='区域管理'
        footer={false}
        width={1366}
        open={isOpenAreaSelect}
        onCancel={handleCloseAreaSelect}
        mask={false}
        maskClosable={false}
      >
        <MapAreaSelect
          areaList={areaList}
          value={value}
          onChange={handleChange}
          onUpdate={handleUpdate}
        />
      </Modal>
    </article>
  )
}

export default AreaDeviceInput