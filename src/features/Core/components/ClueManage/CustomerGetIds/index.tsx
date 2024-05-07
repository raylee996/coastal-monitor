import React, {useEffect, useState} from "react";
import {Button, Tag} from "antd";
import popup from "hooks/basis/Popup";
import CustomerGetShipIds from "./CustomerGetShipIds";
import _ from "lodash";
import CustomerGetManIds from "./CustomerGetManIds";
import CustomerGetCarIds from "./CustomerGetCarIds";

interface Props {
  onChange?: Function
  value?: any
  /*选择类型：chooseType:ship船舶档案,man人员档案,car车辆档案,*/
  inputProps?:any
}

//自定义选择IDS
const CustomerGetIds: React.FC<Props> = ({onChange, value,inputProps}) => {
  console.debug('CustomerGetIds')
  const [ids, setIds] = useState([]);
  useEffect(() => {
    if (value) {
      setIds(value)
    }
  }, [value, inputProps]);


  function handleFinish(val: any) {
    setIds(val[0])
    onChange && onChange(val[0])
  }

  function handleClose(val: any, e: any) {
    e.preventDefault()
    let newIds = JSON.parse(JSON.stringify(ids))
    _.remove(newIds, function (x: any) {
      return x === val
    })
    setIds(newIds)
    onChange && onChange(newIds)
  }

  //添加船舶档案
  function handleChooseShipIds() {
    popup(<CustomerGetShipIds onFinish={handleFinish} defaultSelectedKey={ids}/>, {title: '添加船舶', size: 'large'})
  }
  //添加人员档案
  function handleChooseManIds(){
    popup(<CustomerGetManIds onFinish={handleFinish} defaultSelectedKey={ids}/>, {title: '添加人员', size: 'large'})
  }

  //添加车辆
  function handleChooseCarIds(){
    popup(<CustomerGetCarIds onFinish={handleFinish} defaultSelectedKey={ids}/>, {title: '添加车辆', size: 'large'})
  }
  return <>
    {inputProps.chooseType === 'ship' && <Button type="link" onClick={handleChooseShipIds}>添加船舶档案</Button>}
    {inputProps.chooseType === 'man' && <Button type="link" onClick={handleChooseManIds}>添加人员档案</Button>}
    {inputProps.chooseType === 'car' && <Button type="link" onClick={handleChooseCarIds}>添加车辆档案</Button>}
    {ids && ids.map((item: any) => {
      return <Tag closable key={item} onClose={(e) => handleClose(item, e)}>{item}</Tag>
    })}
  </>
}

export default CustomerGetIds
