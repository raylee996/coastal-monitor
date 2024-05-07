import { Button, Input, InputNumber } from "antd";
import SelectSimple from "hooks/basis/SelectSimple";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";


interface TableTrData {
  uniqueId: string
  channelNo: string
  ip: string
  port: number | undefined
  tcpPort: number | undefined
  account: string
  password: string
  vadioType: number
  northAngle: number
  remark: string
}

const getTableTrDataTemp = () => {
  return {
    uniqueId: _.uniqueId('tableTrDataTemp'),
    channelNo: '',
    ip: '',
    port: undefined,
    tcpPort: undefined,
    account: '',
    password: '',
    vadioType: 1,
    northAngle: 0,
    remark: ''
  }
}

const TableTr: React.FC<{
  index: number,
  data: TableTrData,
  onDelete: (idx: number) => void
  onChange: (idx: number, key: string, value: any) => void
}> = ({ index, data, onDelete, onChange }) => {


  const [realData] = useState(() => {
    return {
      ...data,
      port: data.port ? data.port : undefined
    }
  })


  const handleChange = useCallback(
    (key: string, evt: any) => {
      if (key === 'port' && evt.target.ariaValueNow) {
        const val = Number(evt.target.ariaValueNow)
        onChange(index, key, val)
      } else if (key === 'northAngle' && evt.target.value) {
        const val = Number(evt.target.value)
        onChange(index, key, val)
      } else if (key === 'vadioType') {
        onChange(index, key, evt)
      } else {
        onChange(index, key, evt.target.value)
      }
    },
    [onChange, index],
  )

  const handleDelete = useCallback(
    () => {
      onDelete(index)
    },
    [index, onDelete],
  )


  return (
    <tr>
      <td>
        <Input
          placeholder="请输入通道编号"
          defaultValue={realData.channelNo}
          onBlur={evt => handleChange('channelNo', evt)}
        />
      </td>
      <td>
        <Input
          placeholder="请输入IP"
          defaultValue={realData.ip}
          onBlur={evt => handleChange('ip', evt)}
        />
      </td>
      <td>
        <InputNumber
          placeholder="请输入端口"
          defaultValue={realData.port}
          min={0}
          onBlur={evt => handleChange('port', evt)}
        />
      </td>
      <td>
        <InputNumber
          placeholder="请输入tcp端口"
          defaultValue={realData.port}
          min={0}
          onBlur={evt => handleChange('tcpPort', evt)}
        />
      </td>
      <td>
        <Input
          placeholder="请输入登录账号"
          defaultValue={realData.account}
          onBlur={evt => handleChange('account', evt)}
        />
      </td>
      <td>
        <Input.Password
          placeholder="请输入登录密码"
          defaultValue={realData.password}
          onBlur={evt => handleChange('password', evt)}
        />
      </td>
      <td>
        <SelectSimple
          defaultValue={realData.vadioType}
          dict={[{ value: 1, name: '可见光' }, { value: 2, name: '红外' }]}
          allowClear={false}
          onChange={evt => handleChange('vadioType', evt)}
        />
      </td>
      <td>
        <InputNumber
          placeholder="请输入偏北角"
          defaultValue={realData.northAngle}
          onBlur={evt => handleChange('northAngle', evt)}
        />
      </td>
      <td>
        <Input
          placeholder="请输入备注"
          defaultValue={realData.remark}
          onBlur={evt => handleChange('remark', evt)}
        />
      </td>
      <td>
        <Button type="link" size="small" onClick={handleDelete}>删除</Button>
      </td>
    </tr>
  )
}

interface Props {
  value?: any[]
  onChange?: (value: any) => void
}

const ChannelPanel: React.FC<Props> = ({ value, onChange }) => {
  console.debug('ChannelPanel')


  const [tableData, setTableData] = useState<TableTrData[]>([getTableTrDataTemp()])


  useEffect(() => {
    if (value) {
      const _value = value.map(item => {
        if (_.has(item, 'uniqueId')) {
          return item
        } else {
          const uniqueId = _.uniqueId('tableTrDataTemp')
          return { uniqueId, ...item }
        }
      })
      setTableData(_value)
    }
  }, [value])


  const handleAdd = useCallback(
    () => {
      setTableData(val => {
        const _tableData = _.clone(val)
        const _tableTrData = getTableTrDataTemp()
        _tableData.push(_tableTrData)
        onChange && onChange(_tableData)
        return _tableData
      })
    },
    [onChange],
  )

  const handleDelete = useCallback(
    (idx: number) => {
      setTableData(val => {
        const _tableData = _.clone(val)
        _.remove(_tableData, (item, index) => {
          return index === idx
        })
        onChange && onChange(_tableData)
        return _tableData
      })
    },
    [onChange],
  )

  const handleChange = useCallback(
    (idx: number, key: string, value: any) => {
      setTableData(val => {
        const _tableData = _.clone(val)
        const data = _tableData[idx]
        _.set(data, key, value)
        onChange && onChange(_tableData)
        return _tableData
      })
    },
    [onChange],
  )


  return (
    <article className={styles.wrapper}>
      <section>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTr}>
              <th scope="col">通道编号</th>
              <th scope="col">IP</th>
              <th scope="col">端口</th>
              <th scope="col">tcp端口</th>
              <th scope="col">登录账号</th>
              <th scope="col">登录密码</th>
              <th scope="col">视频类型</th>
              <th scope="col">偏北角</th>
              <th scope="col">备注</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) =>
              <TableTr
                key={item.uniqueId}
                index={index}
                data={item}
                onDelete={handleDelete}
                onChange={handleChange}
              />
            )}
          </tbody>
        </table>
      </section>
      <footer>
        <Button type="link" size="small" onClick={handleAdd}>新增通道</Button>
      </footer>
    </article>
  )
}

export default ChannelPanel