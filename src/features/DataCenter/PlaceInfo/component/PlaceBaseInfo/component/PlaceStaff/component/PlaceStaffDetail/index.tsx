

import { Button, message } from "antd";
import XcRadios from "component/XcRadios";
import PersonnelArchiveSelect from "features/DataCenter/PersonnelArchiveTable/component/PersonnelArchiveSelect";
import { defaultImgPeople } from "helper/common";
import { positionStatusDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import React, { useCallback, useEffect, useState } from "react";
import { doEditPlaceStaff, doGetPlaceStaff } from "server/place";
import styles from "./index.module.sass";

interface IPlaceStaffDetail {
  type?: UseType
  placeId?: any
  id?: string
  /**人员信息 */
  peopleItem?: any
  onFinish?: Function
  onClosePopup?: any
}

const PlaceStaffDetail: React.FC<IPlaceStaffDetail> = (props) => {
  console.debug("PlaceStaffDetail")

  const { placeId, type, id, peopleItem, onClosePopup, onFinish } = props
  const [personInfo, setPersonInfo] = useState<any>(() => {
    if (peopleItem) {
      return {
        ...peopleItem
      }
    } else {
      return null
    }

  })

  const formInputs: any = [
    [
      '职务',
      'position',
      {
        placeholder: '请输入'
      }
    ],
    [
      '在职状态',
      'status',
      InputType.component,
      {
        component: XcRadios,
        option: {
          data: positionStatusDict
        },
        defaultValue: 1
      }
    ],
  ]

  // 新增、编辑
  async function handleFinish(data: any) {
    if (type === 1) {
      // 新增
      if (!personInfo) {
        message.warning('请选择人员！')
        return
      }

    }
    await doEditPlaceStaff({
      ...data,
      type,
      personId: peopleItem ? peopleItem.personId : personInfo.id,
      focusPlaceId: placeId,//场所ID            
    })
    onFinish && onFinish()
    onClosePopup && onClosePopup() // 关闭POPUP
  }

  function handleOpenPeopleSelect() {
    popup(<PersonnelArchiveSelect onFinish={handleSelectPerson} />, { title: '选择人员', size: "large" })
  }

  // 选择人员后
  function handleSelectPerson(data: any) {
    let peroson = data[1][0]
    setPersonInfo(peroson)
  }

  useEffect(() => {
    peopleItem && setPersonInfo(peopleItem)
  }, [peopleItem])


  const handleRequest = useCallback(
    (data: any) => {
      setPersonInfo(data)
    },
    [],
  )



  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.peopleSelect}>
          {type === 1 && <Button onClick={handleOpenPeopleSelect}>选择人员</Button>}
          {/* {selectedPerson && <DataDescriptions data={selectedPerson} column={2} />} */}
          {personInfo && <div className={styles.manContent}>
            <div className={styles.image}>
              <ImageSimple src={personInfo.facePath} width={'100%'} height={'100%'} defaultSrc={defaultImgPeople} />
            </div>
            <div>
              <div className={styles.name}>姓名：{personInfo.name}</div>
              <div className={styles.name}>手机号：{personInfo.phone}</div>
              <div className={styles.name}>性别：{personInfo.gender === '0' ? '未知' : personInfo.gender === '1' ? '男' : '女'}</div>
              <div className={styles.name}>身份证号：{personInfo.idcard}</div>
            </div>
          </div>}
        </div>
        <div className={styles.contentForm}>
          <FormInterface
            id={id}
            inputs={formInputs}
            formType={type}
            formProps={{
              labelCol: {
                span: 6,
              }
            }}
            initData={{
              'status': 1
            }}
            options={{
              submitText: '确认',
              column: 2,
              isShowReset: true
            }}
            getRequest={doGetPlaceStaff}
            onRequest={handleRequest}
            onFinish={handleFinish}
          />
        </div>
      </div>
    </div>
  )
}

export default PlaceStaffDetail