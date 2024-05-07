import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.sass'
import CoastalMonitorWebgis from "../../../../../helper/map";
import { getCRSByMapType, MapType } from "../../../../../helper/map/crsUtil";
import getMapOffLineDate from "../../../../../helper/map/getMap";
import { Button, Form, } from "antd";
import _ from "lodash";
import { addPlanAsync } from "../../../../../server/core/planManage";
import { editPlan } from "../../../../../api/core/planManagement";
import FormItem from "./component/FormItem";
import XcEmpty from "../../../../../component/XcEmpty";


interface Props {
  onClosePopup?: Function
  //点击确定，跳转到下一步
  nextStep?: Function
  //事件集合
  totalItem?: any[]
  //表单基础信息
  basicInfo: any
}

//预案配置
const PlanConfig: React.FC<Props> = ({
  onClosePopup,
  nextStep,
  totalItem,
  basicInfo
}) => {
  console.debug('PlanConfig')

  const mapRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>();

  //上一步下一步总数据
  const [TotalItems, setTotalItems] = useState(() => {
    if (totalItem && totalItem.length > 0) {
      for (let i = 0; i < totalItem.length; i++) {
        totalItem[i].id = _.uniqueId();
        totalItem[i].typeId = '1';
        totalItem[i].isShow = true;
      }
      return totalItem
    }
    return []
  });
  //下一步：增加一条数据; 上一步，减少一条数据
  const [stepItems, setStepItems] = useState(() => {
    if (TotalItems.length > 0) {
      let newTotalItems = [...TotalItems]
      newTotalItems.splice(0, 1)
      setTotalItems(newTotalItems)
      return [TotalItems[0]]
    }
    return []
  });

  //历史步数存放,每条数据的Id，用于撤销上一步操作。
  const [historyStep, setHistoryStep] = useState(() => {
    if (TotalItems && TotalItems.length > 0) {
      return [TotalItems[0].id]
    }
    return []
  });


  //编辑时，给配置预案表单赋初值
  const [defaultData, setDefaultData] = useState([]);

  //给配置预案赋初始值
  useEffect(() => {
    if (basicInfo && basicInfo.planSettingJson) {
      setDefaultData(basicInfo.planSettingJson)
    }
  }, [basicInfo]);

  //渲染地图
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  // 地图上渲染模型区域
  useEffect(() => {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      const polygonList = [
        [[113.97161, 22.521803], [113.97382, 22.521704], [113.975902, 22.520416], [113.978283, 22.520614], [113.978949, 22.52105], [113.980365, 22.521843], [113.98736, 22.515897], [113.963456, 22.515203], [113.97161, 22.521803]],
        [[113.756561, 22.611038], [113.784675, 22.585085], [113.738708, 22.57048], [113.756561, 22.611038]]
      ]
      const latlngs: any[] = []
      polygonList.forEach(item => {
        const polygon = item.map(([lng, lat]) => [lat, lng])
        L.polygon(polygon, { color: 'blue' }).addTo(map)

        const center = turf.centerOfMass(turf.polygon([item]));
        latlngs.push(center.geometry.coordinates.reverse())
      })
      L.polyline(latlngs, { color: 'green', dashArray: '5,10' }).addTo(map);

      const circleMarker = mapLeaflet.createCircleMarker({ latLng: _.head(latlngs) })
      circleMarker.addTo(map);
      circleMarker.bindPopup('未开AIS').openPopup();
    }
  }, [mapLeaflet])


  //取消
  function handleCancel() {
    onClosePopup && onClosePopup()
  }

  //确定
  function handleSubmit() {
    let formData = form.getFieldsValue()
    let data = { ...basicInfo, planSettingJson: formData.stepItem }
    if (basicInfo && basicInfo.id) {
      editPlan(data).then(() => {
        nextStep && nextStep(2)
      })
    } else {
      addPlanAsync(data).then(() => {
        nextStep && nextStep(2)
      })
    }
  }

  //上一步
  function prevBtn() {
    //获取操作最后一步的id
    let lastStepId = historyStep[historyStep.length - 1];
    let index = stepItems.findIndex((item: any) => item.id === lastStepId)
    removeMethodHandler(index)
    page_scroll()
  }

  //下一步
  function nextBtn() {
    let oldList = [...stepItems]
    //获取下一步的数据,即TotalItems 的第一个数
    let item = TotalItems[0]
    setStepItems([...oldList, item])
    setHistoryStep((val) => {
      return [...val, item.id]
    })

    //删除TotalItems第一个数
    let newTotalItems = [...TotalItems]
    newTotalItems.splice(0, 1)
    setTotalItems(newTotalItems)

    page_scroll()
  }

  //添加处置,点击添加处理后，需要复制当前这条数据
  function addMethodHandler(index: number) {
    let defaultFormData = form.getFieldsValue()
    for (let i = 0; i < stepItems.length; i++) {
      if (stepItems[i].isShow === false) {
        defaultFormData.stepItem[i].isShow = false;
      }
    }
    let needAddData = {
      ...defaultFormData.stepItem[index],
      typeId: '1',
      isAddManually: true,
      isShow: true,
      id: _.uniqueId(),
    }
    if (defaultFormData.stepItem.length > 0) {
      defaultFormData.stepItem.splice(index + 1, 0, needAddData)
    }
    setStepItems(defaultFormData.stepItem)
    setHistoryStep((val: any) => {
      return [...val, needAddData.id]
    })

    form.setFieldsValue({
      stepItem: defaultFormData.stepItem
    })

    //添加一项后，需要滚动一下160px
    let i = 0
    let element = document.getElementById('planConfigForm')!
    function main() {
      if (i >= 8) {
        clearInterval(interval)
      } else {
        element.scrollTop += 20;
        i = i + 1
      }
    }
    let interval = setInterval(main, 3)
  }
  //删除处置方式
  function removeMethodHandler(index: number) {
    let oldList = [...stepItems]
    let stepId = oldList[index].id

    let currentStepData: any = stepItems.filter((item: any) => item.id === stepId)
    if (currentStepData.length > 0 && !currentStepData[0].isAddManually) {//非手动添加的处理方法，数据需要还原回去
      setTotalItems((val) => {
        return [...currentStepData, ...val]
      })
    }
    setHistoryStep((val: any) => {
      return val.filter((item: any) => item !== stepId)
    })

    setStepItems((val) => {
      return val.filter((item: any) => item.id !== stepId)
    })

    let defaultFormData = form.getFieldsValue()
    defaultFormData.stepItem.splice(index, 1)
    form.setFieldsValue({
      stepItem: defaultFormData.stepItem
    })
  }

  //非手动添加的处置方式，删除
  function hideMainHandler(index: number) {
    setStepItems((val: any) => {
      let list = [...val];
      list[index].isShow = false
      return list
    })
  }

  //新增一条数据时，自动滚动至底部
  function page_scroll() {
    let i = 0
    let element = document.getElementById('planConfigForm')!

    // 设置定时器，时间即为滚动速度
    function main() {
      if (element.scrollTop + element.clientHeight === element.scrollHeight) {
        clearInterval(interval)
        //console.log('已经到底部了')
      } else {
        element.scrollTop += 20;
        i = i + 1;
      }
    }

    // 定义定时器ID
    let interval = setInterval(main, 30)
  }

  return (
    <div className={styles.wrapper}>
      {/*地图*/}
      <div className={styles.map} ref={mapRef} />

      {/*表单*/}
      <div className={styles.formWrapper}>
        <div className={styles.wrapperTitle}>处置</div>
        {(stepItems && stepItems.length === 0) &&
          <XcEmpty description={'请点击下一步操作按钮来配置'} />
        }
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          className={styles.form}
          id='planConfigForm'
          form={form}>
          {
            stepItems.map((item: any, index: number) => {
              return <FormItem
                addMethod={addMethodHandler}
                removeMethod={removeMethodHandler}
                hideMainMethod={hideMainHandler}
                stepItem={item}
                index={index}
                key={item.id}
                defaultData={defaultData[index]}
              />
            })
          }
        </Form>
      </div>

      {/*底部按钮*/}
      <div className={styles.bottom}>
        {stepItems && stepItems.length > 1 && <Button type={"primary"} onClick={prevBtn}>上一步</Button>}
        <Button type={"default"} onClick={handleCancel}>取消</Button>
        {stepItems && TotalItems.length > 0 && <Button type={"primary"} onClick={nextBtn}>下一步</Button>}
        {stepItems && TotalItems.length === 0 && <Button type={"primary"} htmlType="submit" onClick={handleSubmit}>确定</Button>}
      </div>
    </div>
  )
}

export default PlanConfig
