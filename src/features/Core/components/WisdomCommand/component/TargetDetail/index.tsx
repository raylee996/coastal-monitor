import { Button, Input, message, Popconfirm, Space } from "antd";
import XcEmpty from "component/XcEmpty";
import { checkShipType, getLabelName } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useEffect, useState } from "react";
import { getShipBaseInfo } from "server/ship";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'

interface Props {
  /** 目标集合 */
  targetList?: any[]
  /** 编辑确认回调 */
  confirmFunc?: (data: any[]) => void
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
}

const TargetDetail: React.FC<Props> = ({ targetList, confirmFunc, onClosePopup }) => {
  console.debug('TargetDetail')

  // 新增框
  const [insertValue, setInsertValue] = useState<string>('');

  const [targetData, setTargetData] = useState<any[]>([]);
  
  useEffect(() => {
    setTargetData([ ...targetList||[] ])
  }, [targetList])

  // 添加
  async function handleAdd() {
    if(!insertValue) {
      message.error("不能为空！")
      return
    }
    if(targetData.map(item => item.warnContent).includes(insertValue)) {
      message.error("跟踪目标已存在！")
      return
    }
    // 判断用户输入跟踪目标格式是否有效
    const shipInfo = checkShipType(insertValue)
    if(!shipInfo) {
      message.error("添加的跟踪目标格式不正确！")
      return
    }
    // 获取船舶档案信息
    const typeToKey: { [key: number]: any } = {
      // 内容类型 6-MMSI 7-雷达目标 8-目标ID
      6: { key: 'mmsi', api: getShipBaseInfo },
      7: { key: 'radarNumber', api: getShipBaseInfo },
      8: { key: 'targetId', api: getShipBaseInfo },
    }
    const para: { [key: string]: any } = {}
    para[typeToKey[shipInfo.shipType].key] = shipInfo?.shipCode
    const vo = await typeToKey[shipInfo.shipType].api(para)
    // 添加新增的目标信息
    setTargetData(val => {
      const obj = {
        sourceUrl: vo?.shipImgPath || vo?.radarImgPath,
        shipName: vo?.cnName || vo?.enName,
        warnContent: shipInfo?.shipCode,
        contentType: shipInfo?.shipType
      }
      return [...val, ...[obj]]
    })
    setInsertValue('')
  }

  // 取消
  function handleCancel() {
    onClosePopup && onClosePopup()
  }

  // 确定
  function handleConfirm() {
    confirmFunc && confirmFunc(targetData)
    handleCancel()
  }

  // 更新input-value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInsertValue(e.target.value);
  };

  function delModel(obj: any) {
    // 页面删除该目标
    setTargetData(val => {
      return val.filter(item => _.isEqual(val, item))
    })
  }

  return <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>跟踪目标：</div>
        <div className={styles.input}>
          <Input
            type="text"
            placeholder={'请输入MMSI、雷达批号'}
            value={insertValue}
            maxLength={50}
            showCount
            onChange={handleInputChange}
            allowClear
          />
        </div>
        <Button type="primary" onClick={handleAdd}>新增</Button>
      </div>
      <div className={styles.content}>
        {
          targetData?.length ? targetData?.map(item => {
            return <div className={styles.box} key={item.warnContent}>
              <div>
                <ImageSimple src={item.sourceUrl2} width={'100%'} height={'100%'} defaultSrc={shipDefSrc}/>
              </div>
              <div className={styles.text}>{`船名：${item.shipName || '--'}`}</div>
              <div className={styles.text}>{`${getLabelName(item.contentType)}：${item.warnContent || '--'}`}</div>
              <Popconfirm title="确定要删除吗?" onConfirm={() => delModel(item)}>
                <Button type={"link"} className={styles.delBtn}>删除</Button>
              </Popconfirm>
            </div>
          }) : <XcEmpty />
        }
      </div>
      <Space className={styles.footer}>
        <Button onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleConfirm}>确定</Button>
      </Space>
  </section>
}

export default TargetDetail