import WisdomJudgment from "features/Core/components/WisdomJudgment";
import { defaultImgShip } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'


interface Props {
  valise?: any
  /** 船舶数据类型 */
  // dataType?: number
  /** 用于判断是否编辑信息，更新视图 */
  editFlag?: number
  /** 船舶数据 */
  shipData?: any
}

const TargetInfo: React.FC<Props> = ({ valise, editFlag, shipData }) => {
  console.debug("TargetInfo")


  const [targetData, setTargetData] = useState<any>([])
  const [data, setData] = useState<any>([])
  const [dataType, setDataType] = useState()

  useEffect(() => {
    async function main() {

      let vo = shipData
      setTargetData(shipData)
      setDataType(vo.dataType)
      if (vo) {
        setData([
          {
            label: "", value: vo[!_.isNil(vo.mmsi) ? 'mmsi' : (!_.isNil(vo.radarNumber) ? 'radarNumber' : 'targetId')], isRow: true
          },
          {
            ...(vo.fusionStatus === 2 ? {
              label: "目标ID", value: vo.targetId
            } : {})
          },
          {
            label: "船名", value: vo.cnName || vo.enName || '--'
          },
          { label: '', value: <div className={styles.btnJudgment} onClick={() => handleClick(vo)} title="研判">研判{'>'}</div>, isRow: true, isComponent: true },
        ].filter(v => Object.keys(v)?.length))
      }

    }
    main()
  }, [editFlag, shipData])

  // 跳转至研判
  function handleClick(vo: any) {
    console.log('研判', vo)
    let clueInfo = [];
    if (vo.radarNumber) {
      clueInfo.push({
        codeType: 7,
        codeValue: vo.radarNumber,
        imageUrl: vo.shipImgPath
      })
    } else {
      clueInfo.push({
        codeType: 6,
        codeValue: vo.mmsi,
        imageUrl: vo.shipImgPath
      })
    }
    popup(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['04', '05'] }} />, { title: '智能研判', size: 'fullscreen' })
  }

  return (
    <div className={styles.targetInfo}>

      <div className={styles.targetImgBox}>
        {dataType === 1 && <ImageSimple
          src={targetData.shipImgPath ? targetData.headShipImg : defaultImgShip}
          width={"90%"}
          height={'160px'}
          defaultSrc={shipDefSrc}
        />}
        {dataType === 2 && <ImageSimple
          src={targetData.radarImgPath ? targetData.radarImgPath : defaultImgShip}
          width={"90%"}
          height={'160px'}
          defaultSrc={shipDefSrc}
        />}
      </div>

      <div className={styles.targetInfoBox}>
        {
          data && data.map((item: any, index: number) => {
            return (
              <div key={index} className={styles.txt}>
                {
                  item.isRow ?
                    <div className={`${styles.txtLabel} ${styles.txtRow}`} title={item[valise.value]}>{item[valise.value]} </div>
                    :
                    <div className={styles.txtLabel} title={item[valise.value]}>
                      {`${item[valise.name]} : ${item[valise.value]}`}
                    </div>
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}


// 组件属性默认值
TargetInfo.defaultProps = {
  valise: { name: 'label', value: 'value' }
}

export default TargetInfo