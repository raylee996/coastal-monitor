import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import common from "helper/common";
import popup from "hooks/basis/Popup";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doAddEditPersonShipSailor, doDelPersonShipSailor, doGetPersonShipSailorList } from "server/personnel";
import PopulationShipDetail from "./component/PopulationShipDetail";
import styles from "./index.module.sass";

/**个人档案 -> 个人信息 -> 人口信息 -> 船舶信息 */
interface IPopulationShipInfo {
  id?: any
}
const PopulationShipInfo: React.FC<IPopulationShipInfo> = (props) => {
  const { id } = props

  const tableRef = useRef<any>(null)


  // 船舶信息
  const columns = [
    ['船名', 'shipCnName'],
    ['MMSI', 'mmsi'],
    ['目标ID', 'targetId', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['雷达批号', 'radarNumber', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['职务', 'position'],
    ['证书等级', 'certificateLevel'],
    ['在职状态', 'statusName'],
    [
      ['船舶档案', (record: any) => {
        // 跳转查看档案详情页 
        if (record.shipId) {
          popup(<ShipArchiveInfo id={record.shipId} dataType={1}/>, { title: '查看船舶档案', size: "fullscreen" })
        }
        else {
          common.showMessage({ msg: '档案ID不存在', type: 'error' })
        }
      }],
      ['编辑', (record: any) => {
        //打开信息编辑窗口
        popup(<PopulationShipDetail
          request={doAddEditPersonShipSailor}
          data={record}
          // formInputs={formInputs} 
          extraParams={{ id: record.id, personId: id, shipId: record.shipId }}
          id={record.id}
          onFinish={refreshTable} />, { title: '编辑', size: "middle" })
      }],
      ['删除', async (record: any) => {
        await doDelPersonShipSailor(record.id)
        refreshTable()
      }, ActionType.confirm]
    ]
  ]

  const toolsRight: any = [
    ['新增', {
      onClick: () => {
        popup(<PopulationShipDetail
          request={doAddEditPersonShipSailor}
          // formInputs={formInputs} 
          initData={{ status: 1 }}
          extraParams={{ personId: id }}
          onFinish={refreshTable}
        />, { title: '新增', size: "middle" })
      },
      type:'primary'
    }]
  ]

  // 刷新列表
  function refreshTable() {
    tableRef.current.onRefresh()
  }


  return (
    <div className={styles.box}>
      <TableInterface
        ref={tableRef}
        columns={columns}
        extraParams={{ personId: id }}
        toolsRight={toolsRight}
        request={doGetPersonShipSailorList}
      />
    </div>
  )
}


export default PopulationShipInfo
