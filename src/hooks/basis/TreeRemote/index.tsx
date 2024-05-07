import { Form, FormInstance, Tree, TreeProps } from "antd";
import { DataNode } from "antd/es/tree";
import { Key } from "rc-tree/lib/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";


interface Value {
  checkedKeys: Key[]
  halfCheckedKeys: Key[]
}

interface Props extends TreeProps {
  /** 选中的key数组 */
  value?: Value | Key[]
  /** 表单FormInstance */
  form?: FormInstance<any>
  /** 监听表单对应的字段 */
  watchKey?: string
  /** 远程请求 */
  remote?: (params: any, signal: AbortController) => Promise<DataNode[]>
  /** 实现表单onChange响应 */
  onChange?: (value: Value) => void
}

const TreeRemote: React.FC<Props> = ({ form, watchKey, value, remote, onChange, ...treeProps }) => {
  console.debug('TreeRemote')


  const [realform] = Form.useForm(form);
  const watchValue = Form.useWatch(watchKey || '', realform);


  const [treeData, setTreeData] = useState<DataNode[]>([])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (remote) {
        ctr = new AbortController()
        const vo = await remote(watchValue, ctr)
        setTreeData(vo)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [remote, watchValue])


  const checkedKeys = useMemo(() => {
    if (value) {
      if (Array.isArray(value)) {
        return value
      } else {
        return value.checkedKeys
      }
    } else {
      return []
    }
  }, [value])


  const handleCheck = useCallback(
    (checkedKeys: any, info: any) => {
      let result = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked
      const halfCheckedKeys = info.halfCheckedKeys || []
      onChange && onChange({
        checkedKeys: result,
        halfCheckedKeys
      })
    },
    [onChange],
  )


  return (
    <article className={styles.wrapper}>
      <Tree
        checkable
        checkedKeys={checkedKeys}
        onCheck={handleCheck}
        treeData={treeData}
        {...treeProps}
      />
    </article>
  )
}

export default TreeRemote