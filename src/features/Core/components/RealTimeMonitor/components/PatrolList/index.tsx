import { CloseOutlined, EditOutlined, PlaySquareOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Radio, RadioChangeEvent } from "antd";
import ButtonSmall from "component/ButtonSmall";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { delVedioTConfigData, getVedioTConfigData, VedioTConfigInfo } from "server/admin";
import PatroDetail from "./components/PatroDetail";
import styles from "./index.module.sass";

interface PatrolInfo extends VedioTConfigInfo {
  isSelect: boolean
}


interface Props {
  /** 选中的播放视频窗口 */
  target?: any
  /** 窗口数量 */
  patroScreenType?: string
  /** 当前的Tabs选择*/
  activeKey?: string
  /** 是否开启轮巡 */
  isOpenPatro?: boolean
  /** 设置选中的 */
  onPatroTarget?: (data: any) => void
  /** 设置播放列表 */
  onPatroVideoList?: (data: any[]) => void
  /** 设置播放窗口数量 */
  onPatroScreenType?: (value: string) => void
  /** 设置轮巡模式 */
  onPatroMode?: (value: number) => void
}

// const uniqueIdList = _.times(8, () => _.uniqueId('PatrolList'))

const PatrolList: React.FC<Props> = ({
  target,
  patroScreenType,
  activeKey,
  isOpenPatro,
  onPatroTarget,
  onPatroVideoList,
  onPatroScreenType,
  onPatroMode
}) => {
  console.debug('PatrolList')


  const [list, setList] = useState<PatrolInfo[]>([])
  const [checkList, setCheckList] = useState<PatrolInfo[]>([])
  const [type, setType] = useState(1)


  const singleGroupInfo = useMemo(() => {
    if (!_.isEmpty(checkList) && activeKey === '2' && type === 1) {
      const [targetPatro] = checkList
      const count = Number(targetPatro.splitType)
      const videoList: any[] = _.times(count, _.stubObject)
      const allDevice = targetPatro.deviceInfoList.map((item: any) => {
        return {
          ...item,
          id: _.uniqueId('PatrolList'),
          channelList: item.deviceChannelList
        }
      })
      onPatroTarget && onPatroTarget(undefined)
      onPatroScreenType && onPatroScreenType(targetPatro.splitType)
      return {
        targetPatro,
        videoList,
        allDevice
      }
    } else {
      return undefined
    }
  }, [activeKey, checkList, onPatroScreenType, onPatroTarget, type])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const vo = await getVedioTConfigData(ctr)
      const _list = vo.map(item => ({ ...item, isSelect: false }))
      if (!_.isEmpty(_list)) {
        const _targetPatro = _.head(_list)
        _targetPatro && setCheckList([_targetPatro])
      }
      setList(_list)
    }
    main()
    return () => {
      ctr.abort()
    }
  }, [])


  const handleSingleGroup = useCallback(
    () => {
      if (singleGroupInfo) {
        const videoList = singleGroupInfo.videoList
        const allDevice = singleGroupInfo.allDevice

        const _last = _.last(videoList)!
        const index = allDevice.findIndex(ele => ele.deviceCode === _last.deviceCode)

        for (let i = 0; i < videoList.length; i++) {
          let targetDevice: any

          if (index === -1) {
            if (allDevice[i]) {
              targetDevice = allDevice[i]
            }
          } else {
            let nextIdx = index + 1 + i
            if (nextIdx > allDevice.length - 1) {
              nextIdx = Math.abs(allDevice.length - nextIdx)
            }
            targetDevice = allDevice[nextIdx]
          }

          if (targetDevice) {
            videoList[i] = targetDevice
          } else {
            videoList[i] = { deviceCode: _.uniqueId('deviceCode') }
          }
        }

        onPatroVideoList && onPatroVideoList([...videoList])
      }
    },
    [onPatroVideoList, singleGroupInfo],
  )


  useEffect(() => {
    if (!_.isEmpty(checkList) && activeKey === '2') {
      if (type === 1) {
        handleSingleGroup()
      } else {
        let count = Number(patroScreenType)
        if (checkList.length > count) {
          const _checkList = _.take(checkList, count)
          setCheckList(_checkList)

        } else {
          const videoList = _.take(checkList, count)
          if (videoList.length < count) {
            const diffCount = count - videoList.length
            _.times(diffCount, () => videoList.push({
              id: _.uniqueId('PatrolList'),
              isSelect: false,
              splitType: '',
              ttl: 0,
              groupName: '',
              deviceNum: 0,
              deviceInfoList: []
            }))
          }

          onPatroVideoList && onPatroVideoList([...videoList])
          onPatroTarget && onPatroTarget(_.head(videoList))
        }
      }
    }
  }, [activeKey, checkList, handleSingleGroup, onPatroTarget, onPatroVideoList, patroScreenType, type])

  useEffect(() => {
    setList(val => {
      val.forEach(ele => {
        const _isSelect = checkList.some(item => item.id === ele.id)
        ele.isSelect = _isSelect
      })
      return [...val]
    })
  }, [checkList])

  useEffect(() => {
    let timer: NodeJS.Timer
    if (singleGroupInfo && activeKey === '2' && type === 1 && isOpenPatro) {
      timer = setInterval(handleSingleGroup, singleGroupInfo.targetPatro.ttl * 1000)
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [type, isOpenPatro, activeKey, handleSingleGroup, singleGroupInfo])


  const handleDelete = useCallback(
    async (item: any) => {
      await delVedioTConfigData(item)
      setList(val => {
        const _val = [...val]
        _.remove(_val, (ele => ele.id === item.id))
        return _val
      })
    },
    [],
  )

  const handleAddSuccess = useCallback(
    async () => {
      const vo = await getVedioTConfigData()
      const _list = vo.map(item => ({ ...item, isSelect: false }))
      if (!_.isEmpty(_list)) {
        setCheckList(val => {
          const result = _.filter(_list, item => val.some(ele => ele.id === item.id))
          return result
        })
      }
      setList(_list)
    },
    [],
  )

  const handleAdd = useCallback(
    () => {
      popup(<PatroDetail onSuccess={handleAddSuccess} />, { title: '新增轮巡', size: "small" })
    },
    [handleAddSuccess],
  )

  const handleEdit = useCallback(
    (params: any) => {
      popup(<PatroDetail onSuccess={handleAddSuccess} id={params.id} />, { title: '编辑轮巡', size: "small" })
    },
    [handleAddSuccess],
  )

  const handleDoubleClick = useCallback(
    (item: PatrolInfo) => {
      if (item.isSelect === false) {
        let _checkList: any[]
        if (type === 1) {
          _checkList = [item]
        } else {
          const count = Number(patroScreenType)
          _checkList = [...checkList]
          if (_checkList.length < count) {
            _checkList = _checkList.concat(item)
          } else {
            const idx = _checkList.findIndex(ele => ele.id === target?.id)
            if (idx !== -1) {
              _checkList.splice(idx, 1, item)
            }
          }
        }
        setCheckList(_checkList)
      }
    },
    [checkList, patroScreenType, target, type],
  )

  const handleType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      if (checkList.length > 1) {
        const target = _.head(checkList)
        target && setCheckList([target])
      }
      setType(value)
      onPatroMode && onPatroMode(value)
    },
    [checkList, onPatroMode],
  )


  return (
    <article className={styles.wrapper}>
      <section className={styles.content}>
        {list.map(item =>
          <div
            className={item.isSelect ? styles.cardAct : styles.card}
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}
          >
            <div className={styles.itemIcon}>{item.isSelect && <PlaySquareOutlined />}</div>
            <div className={styles.name} title={item.groupName}>{item.groupName}</div>
            <div className={styles.num}>{item.deviceNum}</div>
            <div className={styles.actions}>
              <Button shape="circle" type="link" icon={<EditOutlined />} onClick={() => { handleEdit(item) }} />
              {item.id !== -1 &&
                <Popconfirm
                  title="确认删除该项吗?"
                  onConfirm={() => { handleDelete(item) }}
                >
                  <Button shape="circle" type="link" icon={<CloseOutlined />} />
                </Popconfirm>
              }
            </div>
          </div>
        )}
      </section>
      <footer>
        <div>
          <span>轮巡模式:</span>
          <Radio.Group value={type} onChange={handleType}>
            <Radio value={1}>单组</Radio>
            <Radio value={2}>多组</Radio>
          </Radio.Group>
        </div>
        <div>
          <ButtonSmall onClick={handleAdd} name='新增轮巡' />
        </div>
      </footer>
    </article>
  )
}

export default PatrolList