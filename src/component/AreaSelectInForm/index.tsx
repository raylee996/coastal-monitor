//选择区域组件
import React, { useEffect, useState } from "react";
import { getAreaTable } from "../../server/core/controlManage";
// import windowstill from "hooks/basis/Windowstill";
import AreaSelect from "../AreaSelect";
import styles from "./index.module.sass";
import { Select } from "antd";
import popup from "hooks/basis/Popup";
import _ from "lodash";
const { Option } = Select;

//选择区域
interface SelectAreaProps {
  onChange?: Function
  value: any
  size?: any
  // 选择类型，line：线， yaw:航道， area:区域，默认是选择区域
  chooseType?: 'line' | 'yaw' | 'area'
  /** 表单控件参数 */
  inputProps?: any
  /*是否显示AB面*/
  isShowAB?: boolean
  /*单选多选,默认多选, mode:'single' 为单选*/
  mode?: string
  /**扩展参数 */
  extraParams?: any
}

const SelectArea: React.FC<SelectAreaProps> = ({ onChange, value, chooseType, inputProps, isShowAB, size, mode, extraParams }) => {
  console.debug('SelectArea')

  const [areaList, setAreaList] = useState([]);
  const [areaId, setAreaId] = useState<any>([]);
  // 选择区域类型，线条，航道，区域，默认区域
  const [areaType] = useState(() => {
    if (chooseType === 'line') {
      return 'line'
    } else if (chooseType === 'yaw') {
      return 'yaw'
    } else {
      return 'area'
    }
  })

  //获取区域列表
  useEffect(() => {
    switch (areaType) {

      case 'line':
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '1', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
        break
      case 'yaw':
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '5', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
        break;
      case 'area':
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
        break
    }

  }, [extraParams, areaType]);

  //给select赋值
  useEffect(() => {
    if (value) {
      setAreaId(value)
    }
  }, [value]);

  //选择区域获取的值
  function getCheckedArea(val: any) {
    if (!mode) {
      let ids: any = [];
      if (val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          ids.push(val[i].id)
        }
      }
      switch (areaType) {
        case 'line':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '1', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange(ids)
            setAreaId(ids)
          })
          break
        case 'yaw':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '5', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange(ids)
            setAreaId(ids)
          })
          break;
        case 'area':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange(ids)
            setAreaId(ids)
          })
          break;
      }
    } else {
      switch (areaType) {
        case 'line':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '1', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange([val[0].id])
            setAreaId([val[0].id])
          })
          break
        case 'yaw':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '5', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange([val[0].id])
            setAreaId([val[0].id])
          })
          break;
        case 'area':
          getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4', ...extraParams }).then(res => {
            setAreaList(res.data)
            onChange && onChange([val[0].id])
            setAreaId([val[0].id])
          })
          break;
      }
    }

  }

  //下拉框变化
  function onChangeArea(val: any) {
    if (!val) {
      onChange && onChange([])
      setAreaId([])
      return;
    }
    if (!mode) {
      onChange && onChange(val)
      setAreaId(val)
    } else {
      onChange && onChange([val])
      setAreaId([val])
    }
  }

  function chooseArea() {
    popup(<AreaSelect defaultRowKeys={areaId} onChange={getCheckedArea} chooseType='2,3,4' isNotLine={true} isMultiple={!mode} extraParams={inputProps?.extraParams} />, {
      title: '选择区域',
      size: "large",
      onCloseCallback: () => {
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '2,3,4', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
      }
    })
  }

  function chooseLine() {
    popup(<AreaSelect isShowAB={isShowAB} defaultRowKeys={areaId} onChange={getCheckedArea} chooseType='1' isNotCircle={true} isNotPolygon={true} isMultiple={!mode}
      isNotRectangle={true} extraParams={inputProps?.extraParams} />, {
      title: '选择线',
      size: 'large',
      onCloseCallback: () => {
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '1', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
      }
    })
  }

  function chooseYaw() {
    popup(<AreaSelect defaultRowKeys={areaId} onChange={getCheckedArea} chooseType='5' isNotCircle={true} isNotPolygon={true} isMultiple={!mode}
      isNotRectangle={true} extraParams={inputProps?.extraParams} />, {
      title: '选择航道',
      size: 'large',
      onCloseCallback: () => {
        getAreaTable({ pageSize: -1, pageNumber: 1 }, { type: '5', ...extraParams }).then(res => {
          setAreaList(res.data)
        })
      }
    })
  }

  const otherInputProps = _.omit(inputProps, ['extraParams'])

  return <div className={styles.selectAreaWrap}>
    <Select
      style={{ width: '300px' }}
      size={size ? size : "small"}
      mode={mode ? undefined : "multiple"}
      className={styles.selectArea}
      optionFilterProp="children"
      allowClear
      showSearch
      maxTagCount={2}
      value={areaId}
      placeholder={'请选择'}
      onChange={onChangeArea}
      {...otherInputProps}>
      {areaList && areaList.map((item: any) => {
        return <Option value={item.id} key={item.id}>{item.name} </Option>
      })}
    </Select>
    {areaType === 'area' && <span className={styles.addBtn} style={{ marginLeft: '10px' }} onClick={chooseArea}>添加</span>}
    {areaType === 'line' && <span className={styles.addBtn} style={{ marginLeft: '10px' }} onClick={chooseLine}>添加</span>}
    {areaType === 'yaw' && <span className={styles.addBtn} style={{ marginLeft: '10px' }} onClick={chooseYaw}>添加</span>}
  </div>
}

export default SelectArea
