
import PersonnelArchiveInfo from 'features/DataCenter/PersonnelArchiveInfo';
import { defaultImgPeople } from 'helper/common';
import ImageSimple from 'hooks/basis/ImageSimple';
import popup from 'hooks/basis/Popup';
import { ActionType, ColType } from 'hooks/flexibility/TablePanel';
import TableInterface from 'hooks/integrity/TableInterface';
import React, { useRef } from 'react';
import { doDelShipSailor, getShipSailorList } from 'server/ship';
import ShipPersonDetail from './components/ShipPersonDetail';
import styles from "./index.module.sass";

interface PropsShipPerson {
  id: any
  shipCreateTime?: any
}

const ShipPerson: React.FC<PropsShipPerson> = ({ id, shipCreateTime }) => {
  console.debug('ShipPerson')
  const tableRef = useRef<any>(null)

  //数据定义
  const columns = [
    ['头像', 'imgPath', ColType.image,{
      itemProps: {
        width: '80px',
        render: (text: any, record: any) => {
          return (
            <>
               <ImageSimple src={record.imgPath} width={'60px'} height={'60px'} defaultSrc={defaultImgPeople} />
            </>
          )
        }
      }
    }],
    ['姓名', 'name',{ itemProps: { width: '100px' } }],
    ['性别', 'sexName',{ itemProps: { width: '100px' } }],
    ['手机号', 'phone',ColType.tooltip,{ itemProps: { width: '130px' } }],
    ['身份证号', 'identityCard',ColType.tooltip,{ itemProps: { width: '150px' } }],
    ['职位', 'position',ColType.tooltip,{ itemProps: { width: '150px' } }],
    ['证书等级', 'certificateLevel',ColType.tooltip,{ itemProps: { width: '150px' } }],
    ['在职状态', 'statusName',ColType.tooltip,{ itemProps: { width: '140px' } }],
    ['更新日期', 'updateTime',ColType.tooltip,{ itemProps: { width: '130px' } }],
    ['涉案数量', 'caseNum',ColType.tooltip,{ itemProps: { width: '100px' } }],
    ['案件类型', 'caseLabelNames',ColType.tooltip,{ itemProps: { width: '150px' } }],
    [
      ['编辑', (record: any) => {
        popup(<ShipPersonDetail shipId={id} shipCreateTime={shipCreateTime} id={record.id} onFinish={handleFinishEdit} />, { title: '编辑船员', size: "middle" })
      }],
      ['人员档案', (record: any) => {
        //查看-船员信息人员档案
        popup(<PersonnelArchiveInfo id={record.personId} />, { title: '个人档案详情', size: "fullscreen" })
      }],
      ['删除', async (record: any) => {
        //删除-船员信息人员档案
        const vo = await doDelShipSailor(record.id)
        if (vo === 1 || vo.code === 200 || vo.includes('成功')) {
          handleFinishEdit()
        }
      }, ActionType.confirm]
    ]
  ]

  const toolsRight: any = [['新增', {
    onClick: () => {
      popup(<ShipPersonDetail shipId={id} shipCreateTime={shipCreateTime} onFinish={handleFinishEdit} />, { title: '新增船员', size: "middle" })
    },
    type: 'primary',
  }]]

  const queryInputs = [
    ['船员', 'searchValue', {
      placeholder: '请输入姓名/手机号搜索',
      allowClear: true
    }
    ]
  ]


  function handleFinishEdit() {
    tableRef.current.onRefresh()
  }

  return (
    <div className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        extraParams={{ shipId: id }}
        columns={columns}
        queryInputs={queryInputs}
        toolsRight={toolsRight}
        request={getShipSailorList}
      />
    </div>
  )
}

export default ShipPerson
