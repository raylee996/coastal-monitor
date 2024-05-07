import { PlaySquareOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input } from "antd";
import { CameraTypeDict } from "helper/dictionary";
import SelectSimple from "hooks/basis/SelectSimple";
import { Type } from "hooks/hooks";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDictDataByType } from "server/system";
import styles from "./index.module.sass";


export interface DeviceListSearchData {
  text?: string,
  type?: number,
  source?: number
}

const trigger: ("contextMenu" | "click" | "hover")[] = ['contextMenu']

interface Props {
  /** 设备列表 */
  list: any[]
  /** 选择的设备列表 */
  checkList?: any[]
  /** 选中的设备 */
  target?: any
  /** 是否不展示设备类型选项 */
  isNotShowTypeSelect?: boolean
  /** 选择更新 */
  onChange: (data: any) => void
  /** 搜索 */
  onSearch: (data: DeviceListSearchData) => void
  /** 快捷设置多路视频播放 */
  onPlayList: (data: any[]) => void
}

const DeviceList: React.FC<Props> = ({
  list,
  checkList,
  target,
  isNotShowTypeSelect,
  onChange,
  onSearch,
  onPlayList
}) => {
  console.debug('DeviceList')


  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectItems, setSelectItems] = useState<any[]>([])
  const [type, setType] = useState<number>()
  const [sourceDict, setSourceDict] = useState<Type<number>[]>()
  const [source, setSource] = useState<number>(0)
  const [text, setText] = useState<string>()


  useEffect(() => {
    const _deviceList = list.map(item => {
      let isSelect = false
      if (checkList) {
        const _isSelect = checkList.some(ele => item.id === ele.id)
        isSelect = _isSelect
      }
      return {
        ...item,
        isSelect
      }
    })
    setDeviceList(_deviceList)
    checkList && setSelectItems(checkList)
  }, [list, checkList])

  useEffect(() => {
    if (target) {
      setDeviceList(val => {
        val.forEach(ele => {
          if (ele.id === target.id) {
            ele.isTarget = true
          } else {
            ele.isTarget = false
          }
        })
        return [...val]
      })
    }
  }, [target])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const vo = await getDictDataByType<number>('device_source', 'number', ctr)
      setSourceDict(vo)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [])


  const handleDoubleClick = useCallback(
    (item: any) => {
      if (!selectItems.some(ele => ele.id === item.id)) {
        onChange({
          selectItems,
          target,
          clickItem: item
        })
      }
    },
    [selectItems, target, onChange],
  )

  const handleType = useCallback(
    (value: number) => {
      setType(value)
      onSearch({
        text,
        source,
        type: value
      })
    },
    [onSearch, text, source],
  )

  const handleSource = useCallback(
    (value: number) => {
      setSource(value)
      onSearch({
        type,
        text,
        source: value
      })
    },
    [onSearch, text, type],
  )


  const handleSearch = useCallback(
    (value: string) => {
      setText(value)
      onSearch({
        type,
        source,
        text: value
      })
    },
    [onSearch, type, source],
  )

  const handleOpenNine = useCallback(
    (index: number) => {
      const end = index + 9
      const result = deviceList.slice(index, end)
      if (result.length === 9) {
        onPlayList(result)
      } else {
        do {
          result.push({ id: _.uniqueId('OpenNine') })
        } while (result.length < 9)
        onPlayList(result)
      }
    },
    [deviceList, onPlayList],
  )


  const isDropdownDisabled = useMemo(() => source === 1, [source])


  return (
    <article className={styles.wrapper}>
      <header>
        <Input.Search className={styles.search} size="small" placeholder="请输入搜索内容" onSearch={handleSearch} allowClear />
        {!isNotShowTypeSelect &&
          <>
            <div className={styles.selectBox}>
              <span>设备类型:</span>
              <SelectSimple wrapperClass={styles.selectWrapper} className={styles.select} size="small" dict={CameraTypeDict} onChange={handleType} />
            </div>
            <div className={styles.selectBox}>
              <span>设备来源:</span>
              <SelectSimple wrapperClass={styles.selectWrapper} defaultValue={0} className={styles.select} size="small" dict={sourceDict} onChange={handleSource} />
            </div>
          </>
        }
      </header>
      <section>
        {deviceList.map((item, index) =>
          <section
            className={item.isTarget ? styles.itemTarget : styles.item}
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}
          >
            <Dropdown
              overlayClassName='dropdown_ui'
              trigger={trigger}
              disabled={isDropdownDisabled}
              menu={{
                items: [{
                  key: '1',
                  label: (
                    <Button type="link" onClick={() => handleOpenNine(index)}>播放由此开始9路视频</Button>
                  ),
                }]
              }}  >
              <div className={styles.deviceName} title={item.deviceName}>{item.deviceName}</div>
            </Dropdown>
            {item.isSelect && <div className={styles.itemIcon}><PlaySquareOutlined /></div>}
          </section>
        )}
      </section>
    </article>
  )
}

export default DeviceList