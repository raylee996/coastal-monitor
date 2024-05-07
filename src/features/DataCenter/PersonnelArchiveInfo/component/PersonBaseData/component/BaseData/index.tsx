import { Button, Collapse } from "antd";
import DataDescriptions from "features/DataCenter/components/DataDescriptions";
import PersonnelArchiveDetail from "features/DataCenter/PersonnelArchiveDetail";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useState } from "react";
import { doGetPersonCaseList, doGetPersonInfo } from "server/personnel";
import styles from "./index.module.sass";
import "../../../../../dataCenter.sass"
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import common from "helper/common";

const { Panel } = Collapse;

interface IBaseData {
  id: any
}

export interface IBaseInfo {
  label?: any
  value?: any
}

const BaseData: React.FC<IBaseData> = (props) => {
  console.debug('BaseData')
  const { id } = props
  const [baseInfo, setBaseInfo] = useState<IBaseInfo[]>([{ label: '', value: "" }])
  const [baseDetailInfo, setBaseDetailInfo] = useState<IBaseInfo[]>([{ label: '', value: "" }])
  const [isShowDetail, setIsShowDetail] = useState(false)

  // 涉案信息
  const caseColumns = [
    ['案件编号', 'caseNo', { itemProps: { ellipsis: true } }],
    ['案件名称', 'caseName', { itemProps: { ellipsis: true } }],
    ['发案时间', 'happenTimeStart', { itemProps: { ellipsis: true } }],
    ['涉案地详址', 'happenAddress', { itemProps: { ellipsis: true } }],
    ['立案单位', 'registerUnit', { itemProps: { ellipsis: true } }],
    ['案件描述', 'caseDescr', { itemProps: { ellipsis: true } }],
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

  // 南山边海防没有拟合档案-隐藏
  // 拟合档案
  // const matchingColumns = [
  //     ['数据类型', 'caseNo', { itemProps: { ellipsis: true } }],
  //     ['内容', 'enName', { itemProps: { ellipsis: true } }],
  //     ['入档日期', 'cnName', { itemProps: { ellipsis: true } }],
  //     ['最近拟合日期', 'cnName', { itemProps: { ellipsis: true } }],
  //     [
  //         ['查看档案', (record: any) => {
  //             // 跳转查看档案详情页                
  //             if (!common.isNull(record.id)) {
  //                 popup(<CaseArchiveInfo caseItem={{ id: record.id }} />, { title: '案件详情', size: "fullscreen" })
  //             }else{
  //                 common.showMessage({msg:'档案ID不存在',type:'error'})
  //             }
  //         }]
  //     ]
  // ]

  // 获取个人信息
  const getPersonInfoData = useCallback(async () => {
    const vo = await doGetPersonInfo({ id })

    setBaseInfo([{
      label: '姓名',
      value: vo.name
    },
    {
      label: '性别',
      value: vo.genderName
    },
    {
      label: '身份证',
      value: vo.idcard
    },
    {
      label: '民族',
      value: vo.nationCodeName
    },
    {
      label: '出生日期',
      value: vo.birthDay
    },
    {
      label: '家庭住址',
      value: vo.address
    },
    {
      label: '籍贯',
      value: vo.nativeName
    },
    {
      label: '工作单位',
      value: vo.workPlate
    },
    {
      label: '人员分类',
      value: vo.personTypeName
    },
    {
      label: '标签',
      value: vo.labelNames
    }
    ])

    setBaseDetailInfo([
      {
        label: '曾用名',
        value: vo.formerName
      },
      {
        label: '文化程度',
        value: vo.educationalLevel
      },
      {
        label: '职业',
        value: vo.profession
      },
      {
        label: '户籍类型',
        value: vo.censusType
      },
      {
        label: '户籍编号',
        value: vo.censusCode
      },
      {
        label: '户籍性质',
        value: vo.censusNature
      },
      {
        label: '与户主关系',
        value: vo.kinship
      },
      {
        label: '出生国家',
        value: vo.birthCountry
      },
      {
        label: '变更日期',
        value: vo.changeDate
      },
      {
        label: '出生地详址',
        value: vo.birthplace
      },
      {
        label: '手机号',
        value: vo.phone
      },
      /*  {
           label: 'IMSI',
           value: vo.imsi
       },
       {
           label: 'IMEI',
           value: vo.imei
       },
       {
           label: 'MAC',
           value: vo.mac
       }, */
      {
        label: '手机品牌',
        value: vo.mobileBrand
      },
      {
        label: '车牌',
        value: vo.licensePlate
      },
      {
        label: '船名',
        value: vo.shipCnName
      },
    ])
  }, [id])

  useEffect(() => {
    getPersonInfoData()
  }, [getPersonInfoData])

  const handleEdit = (e: any) => {
    e.stopPropagation();
    popup(<PersonnelArchiveDetail id={id} type={UseType.edit} onFinish={() => {
      getPersonInfoData()
    }} />, { title: '编辑个人档案', size: "large" })
  }

  const onChange = (key: string | string[]) => {
    console.log(key);
    setIsShowDetail(!(key.length === 0))
  };


  return (
    <article className={styles.wapper}>
      <div className={styles.boxData}>
        <DataDescriptions bordered data={baseInfo} customClass='dc-data-desc' />
      </div>

      <div className={styles.boxData}>
        <Collapse className={styles.boxData} onChange={onChange}>
          <Panel header={
            <div className={styles.panelTitle}>
              详细信息 <span className={`iconfont icon-xiala1 titleIcon1`} style={isShowDetail ? { transform: 'translate(-8px, -2px) rotate(180deg)' } : {}}></span>
              <Button onClick={handleEdit}>编辑</Button>
            </div>} key="baseinfo_0" showArrow={false}>
            <DataDescriptions bordered data={baseDetailInfo} customClass='dc-data-desc' />
          </Panel>
        </Collapse>

      </div>



      <div className={styles.boxData}>
        <div className={styles.boxTitle}>涉案信息</div>
        <div className={styles.boxContent}>
          <TableInterface
            extraParams={{ personId: id }}
            columns={caseColumns}
            request={doGetPersonCaseList}
          />
        </div>
      </div>

      {/* 南山没有拟合档案 */}
      {/* <div className={styles.boxData}>
                <div className={styles.boxTitle}>拟合档案</div>
                <div className={styles.boxContent}>
                    <TableInterface
                        extraParams={{ personId: id }}
                        columns={matchingColumns}
                        request={doGetPersonCaseList}
                    />
                </div>
            </div> */}
    </article>
  )
}

export default BaseData
