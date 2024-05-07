import { Button, Select } from "antd"
import popup from "hooks/basis/Popup";
import { useEffect, useMemo, useState } from "react";
import { queryDeviceDict } from "server/core/wisdomSearch";
import { CreateProps } from "webgis/extendUntils/layer/CommonMarker";
import DrawAreaChoosePoint, { DrawAreaChoosePointProps } from "./component/DrawAreaChoosePoint";
import styles from "./index.module.sass";

const { Option } = Select;

interface AreaPointDrawProps {
  onChange?: Function
  value: any
  /** 表单select控件参数 */
  inputProps?: any
  /** 点位参数 */
  pointProps?: DrawAreaChoosePointProps
}

const AreaPointDrawFrom: React.FC<AreaPointDrawProps> = ({ onChange, value, inputProps, pointProps }) => {
  console.debug('AreaPointDrawFrom')


  const [pointList, setPointList] = useState<CreateProps[]>([]);
  const [activeId, setActiveId] = useState([]);


  // 解构是否选点标识值
  const isPoint = useMemo(() => pointProps?.isPoint, [pointProps])
  const params = useMemo(() => pointProps?.params, [pointProps])


  //获取点位列表
  useEffect(() => {
    async function main() {
      const vo = await queryDeviceDict(params)
      if (vo) {
        const _pointList = vo.map((item: any) => {
          const { deviceCode, latitude, longitude } = item || {}
          return {
            latLng: [latitude, longitude],
            markerId: deviceCode,
            ...item
          }
        })
        setPointList(_pointList)
      }
    }
    params && main()
  }, [params]);

  //给select赋值
  useEffect(() => {
    setActiveId(value)
  }, [value]);

  //下拉框变化
  function onChangeArea(val: any) {
    onChange && onChange(val)
    setActiveId(val)
  }

  function openDrawPopup() {
    popup(<DrawAreaChoosePoint pointList={pointList} {...pointProps} value={value} onChange={onChange} />, { title: `${isPoint ? '点位' : '区域'}选择`, size: 'large' })
  }

  return (
    <section className={styles.wrapper}>
      {
        isPoint && <Select
          mode={"multiple"}
          className={styles.selectArea}
          optionFilterProp="children"
          allowClear
          showSearch
          value={activeId}
          onChange={onChangeArea}
          placeholder={'请选择点位'}
          maxTagCount={2}
          {...inputProps}>
          {pointList && pointList.map((item: any) => {
            return <Option value={item.deviceCode} key={item.deviceCode}>{item.name}</Option>
          })}
        </Select>
      }
      {/*<div className={styles.addBtn} style={{ marginLeft: '10px' }} onClick={openDrawPopup}>地图选择</div>*/}
      <Button type={"link"} onClick={openDrawPopup}>地图选择</Button>
    </section>
  )
}

export default AreaPointDrawFrom
