import React, { useCallback, useMemo } from 'react';
import { getStateListDatas, getStateListDatastwo, addDeviceDataList, getVadioTogetherDeviceData, editInfoDeviceDataList, getDictDataByType } from "server/system";
import { InputType, PanelOptions, UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface";
import SelectLatLng from "component/SelectLatLng"
import { validatorHigt } from 'helper/validate';
import styles from "./index.module.sass";
import ChannelPanel from './components/ChannelPanel';
import { businessDict, CameraTypeDict } from 'helper/dictionary';
import { message } from 'antd';
import TitleAdd from './components/TitleAdd';
import _ from 'lodash';
import DramAreaInForm from 'component/DramAreaInForm';
import AreaRelation from './components/AreaRelation';
import MapUseArea from './components/MapUseArea';
import { getProviderTypeDict } from 'server/common';
import SceneModeConfig from './components/SceneModeConfig';


const formProps = {
  labelCol: {
    span: 2,
  }
}

const initData = {
  type: '1',
  siteType: 1,
  sceneMode: '0'
}

const options: PanelOptions = {
  submitText: '确认',
  column: 2,
  isShowClear: true
}

interface Props {
  type?: UseType
  id?: number
  deviceSource?: number
  onSuccess?: () => void
  onClosePopup?: () => void
}

const DeviceDetail: React.FC<Props> = ({ id, type, deviceSource, onSuccess, onClosePopup }) => {
  console.debug('DeviceDetail')


  const formInputs = useMemo(() => [
    [
      '设备类型',
      'type',
      InputType.selectRemote,
      {
        request: async () => getDictDataByType("device_type_02"),
        isRequired: deviceSource ? deviceSource === 0 : true,
      }
    ],
    ['设备名称', 'name',
      {
        placeholder: '请输入设备名称',
        isRequired: deviceSource ? deviceSource === 0 : true,
        maxLength: 50,
      }],
    ['设备编码', 'deviceCode',
      {
        placeholder: '请输入设备编码',
        isRequired: deviceSource ? deviceSource === 0 : true,
        maxLength: 20
      }],
    ['设备IP', 'ip',
      {
        placeholder: '请输入设备ip',
        isRequired: deviceSource ? deviceSource === 0 : true,
        maxLength: 30,
        when: { type: { '!=': '10' } }
      }],
    ['设备厂商', 'providerType', InputType.selectRemote, {
      request: getProviderTypeDict,
      placeholder: '请输入设备厂商',
      maxLength: 50,
    }],
    ['设备型号', 'deviceModel',
      {
        placeholder: '请输入设备型号',
        maxLength: 50,
      }],
    ['摄像头类型', 'cameraType',
      InputType.radio,
      {
        isRow: true,
        dict: CameraTypeDict,
        when: { type: '1' }
      }
    ],
    ['业务功能', 'businessFunction',
      InputType.checkbox,
      {
        isRow: true,
        dict: businessDict,
        when: { type: '1' }

      }
    ],
    ['视频预警范围', 'videoWarnRange', InputType.component, {
      component: AreaRelation,
      inputProps: {
        placeholder: '请选择区域',
      },
      title: '地图设定',
      isLine: true,
      isCircle: true,
      when: { businessFunction: { in: ['6'] } }
    }],
    ['安装高度', 'installHigh', {
      placeholder: '请输入安装高度',
      suffix: '米',
      isRequired: deviceSource ? deviceSource === 0 : true,
      maxLength: 3,
      isRow: true,
      itemProps: { rules: [validatorHigt] },
      when: { type: '1', cameraType: '5' }
    }
    ],
    ['覆盖半径', 'coverRaduis', {
      placeholder: '请输入覆盖半径',
      suffix: '米',
      isRequired: deviceSource ? deviceSource === 0 : true,
      isRow: true,
      when: { type: '1' }
    }],
    ['覆盖半径', 'coverRaduis1', {
      placeholder: '请输入覆盖半径',
      suffix: '米',
      isRequired: deviceSource ? deviceSource === 0 : true,
      when: { type: '8' }
    }],
    ['水平视角', 'horizontal1', InputType.number, {
      placeholder: '请输入最小视角',
      style: { width: '100%' },
      when: { type: '1' }
    }],
    ['', 'horizontal2', InputType.number, {
      placeholder: '请输入最大视角',
      style: { width: '100%' },
      when: { type: '1' }
    }],
    ['视频联动设备', 'vadioTogetherId', InputType.selectRemote, {
      request: getVadioTogetherDeviceData,
      placeholder: '请输入',
      when: { type: '6' }
    }],
    ['GPS编号', 'gpsCode', {
      placeholder: '请输入GPS编号',
      when: { type: '1', cameraType: 10 }
    }],
    ['联动范围', 'graph', InputType.component, {
      component: DramAreaInForm,
      inputProps: {
        placeholder: '请选择区域',
      },
      isNotLine: true,
      title: '地图设定',
      when: { type: '1' }
    }],
    ['备注', 'comment', InputType.textArea, {
      placeholder: '请输入备注',
      isRow: true,
    }],
    // 通道信息----------------------------------------------
    ['', '', InputType.component, {
      component: TitleAdd,
      titles: '通道信息',
      subTitle: '(注：只有一个通道可以不填，多个通道需按顺序录入)',
      isRow: true,
      when: { type: '1' }
    }],
    ['采集范围', 'graph', InputType.component, {
      component: MapUseArea,
      inputProps: {
        placeholder: '请选择区域',
      },
      title: '地图设定',
      when: { type: '5' }
    }],
    ['过滤静态目标范围', 'areaRelation', InputType.component, {
      component: AreaRelation,
      inputProps: {
        placeholder: '请选择区域',
      },
      title: '地图设定',
      when: { type: '5' }
    }],
    ['通道信息', 'deviceChannelList', InputType.component, {
      component: ChannelPanel,
      isRow: true,
      when: { type: '1' }
    }],
    // 位置信息----------------------------------------------
    ['', '', InputType.component, {
      component: TitleAdd,
      titles: '位置信息',
      isRow: true,
      when: { '!==': { type: '1', cameraType: 10 } }
    }],
    ['站点类型', 'siteType', InputType.radio,
      {
        dict: [
          { value: 1, name: "固定站点" },
          { value: 2, name: "移动站点" },
        ],
        when: { '!==': { type: '1', cameraType: 10 } }
      }],
    ['站点名称', 'siteId', InputType.selectRemote, {
      request: getStateListDatas,
      placeholder: '请输入站点名称',
      when: { siteType: 1, '!==': { type: '1', cameraType: 10 } }
    }],
    ['站点名称', 'siteIds', InputType.selectRemote, {
      request: getStateListDatastwo,
      placeholder: '请输入站点名称',
      when: { siteType: 2, '!==': { type: '1', cameraType: 10 } }
    }],
    ['杆体编号', 'shaftCode', {
      placeholder: '请输入编号',
      maxLength: 20,
      when: { siteType: 1, '!==': { type: '1', cameraType: 10 } }
    }],
    ['设备地址', 'addr', {
      placeholder: '请输入地址',
      maxLength: 200,
      when: { siteType: 1, '!==': { type: '1', cameraType: 10 } }
    }],
    ['经纬度', 'AreaMap', InputType.component, {
      component: SelectLatLng,
      tips: "请标注场所范围",
      isRow: true,
      when: { siteType: 1, '!==': { type: '1', cameraType: 10 } }
    }],
    // 参数信息----------------------------------------------
    ['', '', InputType.component, {
      component: TitleAdd,
      titles: '参数配置',
      isRow: true,
      when: { type: '5' }
    }],
    ['场景模式', 'sceneMode', InputType.radioRemote,
      {
        remote: async () => getDictDataByType("device_scene_mode"),
        when: { type: '5' },
        isRow: true,
      }],
    ['增益', 'gain', InputType.component, {
      component: SceneModeConfig,
      when: { type: '5' }
    }],
    ['雨雪', 'rain', InputType.component, {
      component: SceneModeConfig,
      when: { type: '5' }
    }],
    ['海浪', 'sea', InputType.component, {
      component: SceneModeConfig,
      when: { type: '5' },
      isNotShowAuto: true
    }],
  ], [deviceSource])


  const handleFinish = useCallback(
    async (data: any) => {
      let formData = { ...data }

      // 校验通道编码 一个设备里的通道编码不能相同
      if (formData?.deviceChannelList?.length > 1 && _.uniqBy(formData.deviceChannelList, 'channelNo').length !== formData.deviceChannelList.length) {
        message.error('一个设备里的通道编码不能相同')
        return;
      }

      if (formData['AreaMap']) {
        formData['longitude'] = formData['AreaMap'][0]['lng']
        formData['latitude'] = formData['AreaMap'][0]['lat']
      }

      if (formData['businessFunction'] instanceof Array) {
        formData['businessFunction'] = formData['businessFunction'].join(',')
      }

      if (formData['sp']) {
        formData['horizontal1'] = formData['sp']
      }

      if (formData['siteIds']) {
        formData['siteId'] = formData['siteIds']
      }

      if (formData['coverRaduis1']) {
        formData['coverRaduis'] = formData['coverRaduis1']
      }

      id && (formData.id = id);
      await addDeviceDataList(formData)

      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [id, onSuccess, onClosePopup],
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        inputs={formInputs}
        formType={type}
        formProps={formProps}
        initData={initData}
        options={options}
        onClose={onClosePopup}
        getRequest={editInfoDeviceDataList}
        onAsyncFinish={handleFinish}
      />
    </article>
  );
}

export default DeviceDetail;
