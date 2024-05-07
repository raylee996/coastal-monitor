import { Button, List, Select, Tag } from "antd";
import { DefaultOptionType } from "antd/lib/select";
import { pointTypeDict } from "helper/dictionary";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface Option extends DefaultOptionType {
  type: string | number
  lat: number
  lng: number
}

interface Props {
  /** 点位过滤类型，数组传入支持多选，默认全部类型 */
  typeList?: string[]
  /** 选中的值 */
  value: string[]
  /** 使用地图选中的值 */
  mapValue: string[]
  /** 点位数据 */
  data: Option[]
  /** 选择类型回调 */
  onTypeChange: (typeList: string[]) => void
  /** 确认的回调函数 */
  onConfirm: (values: string[]) => void
}

const PointList: React.FC<Props> = ({ typeList, value, mapValue, data, onTypeChange, onConfirm }) => {
  console.debug('PointList')

  const [typeOptions] = useState<DefaultOptionType[]>(() => {
    if (typeList) {
      const result = _.filter(pointTypeDict, (dict) => typeList.some(val => val === dict.value))
      const options = result.map(ele => ({
        value: ele.value,
        label: ele.name
      }))
      return options
    } else {
      return []
    }
  })

  const [typeSelectValue, setTypeSelectValue] = useState(typeList || [])
  const [pointSelectValue, setPointSelectValue] = useState<string[]>(value)
  const [pointSelectList, setPointSelectList] = useState<DefaultOptionType[]>([])
  const [pointOptions, setPointOptions] = useState(data)

  // 根据下拉选择更新列表
  useEffect(() => {
    const result = _.filter(data, ele => {
      return pointSelectValue.some(val => val === ele.value)
    })
    setPointSelectList(result)
  }, [pointSelectValue, data])

  // 处理地图选中增量数据
  useEffect(() => {
    setPointSelectValue(val => _.union(val, mapValue))
  }, [mapValue])

  // 根据类型选择过滤下拉选择
  useEffect(() => {
    if (typeSelectValue.length>0){
      const result = _.filter(data, ele => {
        return typeSelectValue.some(val => val === ele.type)
      })
      setPointOptions(result)
    }else{
      setPointOptions(data)
    }
  }, [typeSelectValue, data])

  function handleTypeChange(params: string[]) {
    setTypeSelectValue(params)
    onTypeChange && onTypeChange(params)
  }

  function handleChange(params: string[]) {
    setPointSelectValue(params)
  }

  function handleConfirm() {
    onConfirm(pointSelectValue)
  }

  function handleRemove(params: any) {
    setPointSelectValue(val => {
      return _.xor(val, [params.value])
    })
  }

  return (
    <article className={styles.wrapper}>
      <header>
        {typeList &&
          <Select
            className={styles.typeSelect}
            options={typeOptions}
            value={typeSelectValue}
            mode="tags"
            placeholder='选择类型'
            onChange={handleTypeChange}
          />
        }
        <Select
          className={styles.select}
          placeholder='请选择点位'
          options={pointOptions}
          value={pointSelectValue}
          mode="tags"
          maxTagCount={3}
          maxTagTextLength={4}
          onChange={handleChange}
          allowClear
        />
      </header>
      <section>
        <List
          className={styles.list}
          rowKey='id'
          size="small"
          bordered
          dataSource={pointSelectList}
          renderItem={(item: any) => (
            <List.Item
              actions={[<span className={styles.removeText} key="list-remove" onClick={() => { handleRemove(item) }}>删除</span>]}
            >
              {item.typeName && <Tag>{item.typeName}</Tag>}
              <span className={styles.label}>{item.label}</span>
            </List.Item>
          )}
        />
      </section>
      {!_.isEmpty(pointSelectValue) &&
        <footer>
          <Button type='primary' onClick={handleConfirm}>确认</Button>
        </footer>
      }
    </article>
  )
}

export default PointList
