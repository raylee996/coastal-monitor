
import { Button, Collapse } from 'antd';
import CaseArchiveInfo from 'features/DataCenter/CaseArchiveInfo';
import DataDescriptions from 'features/DataCenter/components/DataDescriptions';
import ShipArchiveDetail from 'features/DataCenter/ShipArchiveDetail';
import common from 'helper/common';
import matching, { shipTypeDict } from 'helper/dictionary';
import popup from 'hooks/basis/Popup';
import { UseType } from 'hooks/flexibility/FormPanel';
import TableInterface from 'hooks/integrity/TableInterface';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getShipBaseInfo, getShipCaseList } from 'server/ship';
import styles from "./index.module.sass";


const { Panel } = Collapse;

interface PropsShipBaseInformation {
  id: any
  /** 船舶数据类型 1-AIS 2-雷达 */
  dataType?: number
  /** 船舶档案数据 */
  shipData?: any
  /** 时间戳来标识是否更新信息，用于更新左侧的船舶信息 */
  editFlag?: (val: number) => void
}
const ShipBaseInformation: React.FC<PropsShipBaseInformation> = ({ id, dataType, shipData, editFlag }) => {
  console.debug('ShipBaseInformation')

  // shipInfo数据
  const [shipInfo, setShipInfo] = useState<any>({});
  const [isShowDetail, setIsShowDetail] = useState(false)

  const handleGetShipBaseInfo = useCallback<any>(() => {
    async function main() {
      const vo: any = await getShipBaseInfo({ id, dataType })
      if (vo) {
        setShipInfo(vo)
        let time = new Date().getTime()
        editFlag && editFlag(time)
      }
    }
    id && main()
  }, [dataType, id, editFlag])


  // 页面初始化
  useEffect(() => {
    if (shipData) {
      // 查看船舶，船舶分类需要转换
      matching([shipData], shipTypeDict, "focusType");
      setShipInfo(shipData)
    } else {
      handleGetShipBaseInfo()
    }
  }, [handleGetShipBaseInfo, shipData])


  // 船舶信息-基本信息表格
  const shipBaseData = [
    {
      name: '中文船名',
      value: shipInfo.cnName
    },
    {
      name: 'MMSI',
      value: shipInfo.mmsi
    },
    {
      name: '船舶类型',
      value: shipInfo.shipTypeName
    },
    {
      name: '作业类型',
      value: shipInfo.jobTypeName
    },
    {
      name: '英文船名',
      value: shipInfo.enName
    },
    {
      name: '船舶分类',
      value: shipInfo.focusTypeName
    },
    {
      name: '呼号',
      value: shipInfo.callSign
    },
    {
      name: 'IMO',
      value: shipInfo.imo
    },
    {
      name: '船长',
      value: shipInfo.shipLong ? (shipInfo.shipLong + ' 米') : '--'
    },
    {
      name: '船宽',
      value: shipInfo.shipWide ? (shipInfo.shipWide + ' 米') : '--'
    },
    {
      name: '吃水',
      value: shipInfo.draftDepth ? (shipInfo.draftDepth + ' 米') : '--'
    },
    {
      name: '关注来源',
      value: shipInfo.focusSrc ? Number(shipInfo.focusSrc) === 1 ? '手动关注' : Number(shipInfo.focusSrc) === 2 ? '自动关注' : '重点目标关联关注' : '--'
    }
  ]

  // 详细信息
  const shipaseDataDetail = [
    {
      name: '船主',
      value: shipInfo.shipowner
    },
    {
      name: '船主证件号码',
      value: shipInfo.shipownerIdcard
    },
    {
      name: '船主电话',
      value: shipInfo.shipownerPhone
    },
    {
      name: '船主负责人',
      value: shipInfo.principal
    },
    {
      name: '负责人证件号码',
      value: shipInfo.principalIdcard
    },
    {
      name: '负责人电话',
      value: shipInfo.principalPhone
    },
    {
      name: '备案派出所',
      value: shipInfo.recordPoliceOffice
    },
    {
      name: '所属分局',
      value: shipInfo.branch
    },
    {
      name: '船舶管理公司',
      value: shipInfo.mtgCompany
    },
    {
      name: '船舶经营公司',
      value: shipInfo.cobCompany
    },
    {
      name: '船舶DOC公司',
      value: shipInfo.docCompany
    },
    {
      name: '船舶注册公司',
      value: shipInfo.regCompany
    },
    {
      name: '技术管理公司',
      value: shipInfo.techCompany
    },
    {
      name: '总吨',
      value: shipInfo.grossTonnage
    },
    {
      name: '船籍',
      value: shipInfo.registry
    },
    {
      name: '造船厂',
      value: shipInfo.shipyard
    },
    {
      name: '净吨',
      value: shipInfo.netTonnage
    },
    {
      name: '船籍港',
      value: shipInfo.registryPort
    },
    {
      name: '造船地点',
      value: shipInfo.buildSite
    },
    {
      name: '载重吨',
      value: shipInfo.deadWeight
    },
    {
      name: '船级社',
      value: shipInfo.classificationSociety
    },
    {
      name: '造船日期',
      value: shipInfo.buildDate
    },
    {
      name: '排水量',
      value: shipInfo.displacement
    },
    {
      name: '经济航速',
      value: shipInfo.economicSpeed
    },

    {
      name: '最大船速',
      value: shipInfo.maximumSpeed
    }
  ]

  // 涉案信息
  const caseColumns = [
    ['案件编号', 'caseNo'],
    ['案件名称', 'caseName'],
    ['涉案时间', 'happenTimeStart'],
    ['涉案地点', 'happenAddress'],
    ['接警单位', 'registerUnit'],
    ['案件描述', 'caseDescr'],
    ['涉案对象', 'involvedPersonName',
      {
        itemProps: {
          ellipsis: true
        }
      }
    ],

    [
      ['查看档案', (record: any) => {
        // 跳转查看档案详情页
        if (!common.isNull(record.id)) {
          popup(<CaseArchiveInfo caseItem={{ id: record.id }} />, { title: '案件详情', size: "fullscreen" })
        } else {
          common.showMessage({ msg: '档案ID不存在', type: 'error' })
        }
      }]
    ]
  ]


  const onChange = (key: string | string[]) => {
    // console.log(key);
    setIsShowDetail(!(key.length === 0))
  };

  // 打开编辑信息
  function handleEdit(e: any) {
    // 阻止冒泡
    e.stopPropagation();
    let shipInfoData = JSON.parse(JSON.stringify(shipInfo))
    _.unset(shipInfoData, 'id')
    popup(<ShipArchiveDetail shipInfoData={shipInfoData} isSelect={true} type={UseType.edit} id={id} dataType={dataType} onFinish={handleGetShipBaseInfo} />, { title: '编辑船舶档案', size: "fullscreen" })
  }


  const extraParams = useMemo(() => ({
    shipId: id
  }), [id])


  return (
    <div className={styles.wrapper}>
      <div className={styles.boxData}>
        <DataDescriptions bordered data={shipBaseData} valise={{ name: 'name', value: 'value' }} customClass='dc-data-desc' />
      </div>

      <Collapse className={styles.boxData} onChange={onChange}>
        <Panel header={
          <div className={styles.panelTitle}>
            详细信息 <span className={`iconfont icon-xiala1 titleIcon1`} style={isShowDetail ? { transform: 'translate(-8px, -2px) rotate(180deg)' } : {}}></span>
            <Button onClick={handleEdit}>编辑</Button>
          </div>} key="baseinfo_0" showArrow={false}>
          <DataDescriptions bordered customClass='dc-data-desc' data={shipaseDataDetail} valise={{ name: 'name', value: 'value' }} />
        </Panel>

      </Collapse>

      <div className={styles.boxData}>
        <div className={styles.boxTitle}>涉案信息</div>
        <div className={styles.boxContent}>
          <TableInterface
            columns={caseColumns}
            extraParams={extraParams}
            request={getShipCaseList}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipBaseInformation
