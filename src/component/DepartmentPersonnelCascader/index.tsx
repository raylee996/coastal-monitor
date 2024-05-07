import { Select } from "antd"
import CascaderRemote from "hooks/basis/CascaderRemote"
import { useEffect, useState } from "react"
import { getDeptCascader, getUserTable } from "server/user"
import styles from './index.module.sass'

interface Props {
  /** form */
  onChange?: Function
  value: any
  /** 部门参数 */
  DepartmentInputProps?: any
  /** 人员参数 */
  PersonnelInputProps?: any
}

const DepartmentPersonnelCascader: React.FC<Props> = (props) => {
  console.debug('DepartmentPersonnelCascader')

  const { onChange, value, DepartmentInputProps, PersonnelInputProps } = props

  const [realValue, setRealValue] = useState<{
    /** 部门 */
    department: any
    /** 人员 */
    personnel: any
  }>({ department: null, personnel: null })

  const [personnelData, setPersonnelData] = useState<any[]>([]);

  useEffect(() => {
    value && setRealValue(value)
  }, [value])

  useEffect(() => {
    if (!realValue.department) return;
    async function main() {
      const result: any[] = []
      const vo: { [key: string]: any } = await getUserTable({ pageSize: -1, pageNumber: 1 }, { deptId: realValue.department })
      vo?.data.forEach((ele: any) => result.push({ ...ele, value: ele.userId, label: ele.name }))
      setPersonnelData(result)
    }
    main();
    return () => {
      setPersonnelData([])
    };
  }, [realValue?.department]);

  // 部门级联更改
  function handleDepartmentChange(val: any) {
    setRealValue({
      department: val?.length ? val[val.length - 1] : '',
      personnel: null
    })
    setPersonnelData([])
  }

  // 人员更改
  function handleChange(val: any) {
    setRealValue((oldValue) => {
      const newVal = {
        ...oldValue,
        personnel: val
      }
      onChange && onChange(newVal)
      return newVal
    })
  }

  return (
    <article className={styles.wrapper}>
      <CascaderRemote
        value={realValue?.department}
        remote={getDeptCascader}
        onChange={handleDepartmentChange}
        placeholder={'请选择部门'}
        changeOnSelect
        {...DepartmentInputProps}
      />
      <div className={styles.select}>
        <Select
          value={realValue?.personnel}
          options={personnelData}
          onChange={handleChange}
          placeholder={'请选择人员'}
          allowClear
          {...PersonnelInputProps}>
        </Select>
      </div>
    </article>
  )
}

export default DepartmentPersonnelCascader