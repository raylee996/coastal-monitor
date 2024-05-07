import React, { useEffect, useState } from "react";
import styles from './index.module.sass'
import TableInterface from "hooks/integrity/TableInterface";
import { InputType } from "hooks/flexibility/FormPanel";
import { Button, message } from "antd";
import ShipConditionAdd from "../../JudgmentAdd/components/ShipConditionAdd";
import {
  exportProcessDataAsync,
  getProcessDataListAsync,
  getTrackData
} from "../../../../../../server/core/wisdomJudgment";
import PeopleCarProcessTrail from "../../PeopleCarResult/PeopleCarProcessTrail";
import _ from "lodash";
import TrailDetailTable from "./TrailDetailTable";
import { getTableColumns } from './tableHeader'
import Title from "../../../../../../component/Title";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../DataCenter/components/ArchiveInfo";
import ControlManageTabs from "features/Core/components/Control/ControlManageTabs";
import windowstill from "hooks/basis/Windowstill";
import ClueManage from "features/Core/components/ClueManage";
import WisdomJudgment from "../..";

interface Props {
  record?: any
}
const ShipProcessData: React.FC<Props> = ({ record }) => {
  const [eventType, setEventType] = useState(null);
  const [eventId, setEventId] = useState<any>(null);
  const [activeRowId, setActiveRowId] = useState<any>();

  const [trackData, setTrackData] = useState<any>();
  const [trackTime, setTrackTime] = useState<any>(null);
  const [obj, setObj] = useState<any>(null);

  //轨迹详情列表数据
  const [trailDetailData, setTrailDetailData] = useState<any[]>([]);

  const [columns, setColumn] = useState<any>([
    ['序号', 'index', { itemProps: { width: '60px' } }],
    ['数据类型', 'codeTypeName'],
    ['数据内容', 'dataContent'],
    ['最后出现时间', 'lastTime'],
    ['最后出现经纬度', 'lastAddress'],
    ['未开AIS时长（分钟）', 'duration'],
    ['操作', '', {
      itemProps: {
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={() => {
                if (!record.archiveId) {
                  message.error('暂无档案')
                  return;
                }
                popup(<ArchiveInfo type={Number(record.archiveType)} id={record.archiveId} />,
                  { title: '档案', size: "fullscreen" })
              }}>档案</Button>
            </>
          )
        }
      }
    }],
  ]);
  const inputs: any[] = [
    ['数据内容', 'modelName', {
      placeholder: '请输入关键字',
      itemProps: {},
      allowClear: true
    }],
    ['图片', 'img', InputType.uploadImg, {
      placeholder: '请输入关键字',
      itemProps: {},
      allowClear: true
    }],
  ]
  //获取第一个节点的信息，用于请求列表数据
  const [conditionData, setConditionData] = useState('');
  useEffect(() => {
    setConditionData(record.originalJson)
    let graphData = JSON.parse(record.originalJson)
    let index = _.findIndex(graphData.cells, function (item: any) { return item.shape === 'rect' });
    //设置dbId,eventType
    setEventId(graphData.cells[index].data.dbId)
    setEventType(graphData.cells[index].data.eventType)
  }, [record]);

  //获取轨迹信息
  useEffect(() => {
    async function main() {
      if (obj === null) {
        return
      }
      let time = trackTime ? trackTime : null
      getTrackData({ pageSize: 1000000, pageNumber: 1 }, {
        obj: {
          targetType: obj.targetType,
          targetValue: obj.targetValue
        },
        time
      }).then(res => {
        setTrackData(res.trackData)
        setTrailDetailData(res.data)
      })
    }
    main()
  }, [obj, trackTime]);

  //刚加载页面，需要选中表格第一行
  useEffect(() => {
    async function main() {
      let vo: any = await getProcessDataListAsync({ pageSize: 5, pageNumber: 1 }, {
        eventId,
        eventType,
        objType: 1
      })
      if (vo.total > 0) {
        getTableItemTrack(vo.data[0])
        setActiveRowId(vo.data[0].id)
      }
    }
    if (eventType && eventId) {
      main();
    }
  }, [eventId, eventType]);

  //点击流程图，切换流程图右边不同的列表,表头
  useEffect(() => {
    if (eventType) {
      let column = getTableColumns(eventType)
      setColumn(column)
    }
  }, [eventType]);

  //点击节点获取eventId和eventType
  function handleGetFirstNode(nodeInfo: any) {
    setEventId(nodeInfo.dbId)
    setEventType(nodeInfo.eventType)
  }

  //点击表格获取表格单条数据的轨迹
  function getTableItemTrack(record: any) {
    setObj({
      targetType: record.codeType,
      targetValue: record.tagCode
    })
  }

  let extraParams = (eventId && eventType) ? { eventId, eventType, objType: 1 } : undefined

  return <div className={styles.wrapper}>

    {/*上半部分*/}
    <div className={styles.top}>
      {/*模型*/}
      <div className={styles.graph}>
        <ShipConditionAdd
          showCondition={false}
          data={conditionData}
          isSelectedFirstNode={true}
          selectedNodeInfo={handleGetFirstNode}
        />
      </div>

      {/*列表*/}
      <div className={styles.table}>
        <TableInterface
          extraParams={extraParams}
          queryInputs={inputs}
          columns={columns}
          request={getProcessDataListAsync}
          paginationProps={{
            pageSize: 5,
            showTotal: (total: number) => {
              return `总数 : ${total}`
            }
          }}
          toolsRight={[<>
            <Button type={"primary"} className={styles.tableActionBtn} onClick={() => exportProcessDataAsync({ ...extraParams })}>导出</Button>
            <Button type={"primary"} className={styles.tableActionBtn} onClick={() => { windowstill(<ControlManageTabs />, { title: '布控管理', key: 'ControlManageTabs', width: '1880px', height: '840px', offset: [20, 70] }) }}>布控管理</Button>
            <Button type={"primary"} className={styles.tableActionBtn} onClick={() => { popup(<ClueManage objType={1} isNotShowAddClue={true}/>, { title: '线索管理', size: 'large' }) }}>线索管理</Button>
            <Button type={"primary"} className={styles.tableActionBtn}>历史轨迹</Button>
            <Button type={"primary"} className={styles.tableActionBtn} onClick={() => {
              // let clueInfo = [{ codeType: record.codeType, codeValue: record.codeValue}]
              windowstill(<WisdomJudgment data={{ objType: 1, dataType: ['04','05'] }} />,
                { title: '智能研判', key: '船舶智能研判', width: '1880px', height: '840px', offset: [20, 70] })
            }}
            >智能研判</Button>
          </>]}
          tableProps={{
            onRow: record => {
              return {
                onClick: () => {
                  getTableItemTrack(record)
                  setActiveRowId(record.id)
                }, // 点击行
              }
            },
            rowClassName: (record, index) => `ant-table-row ant-table-row-level-0 ${record.id === activeRowId ? 'ant-table-row-selected' : ''} table-${index % 2 === 0 ? 'even' : 'odd'}`
          }}
        />
      </div>
    </div>

    {/*下半部分*/}
    <div className={styles.bottom}>
      {/*轨迹信息*/}
      <div className={styles.mapTrail}>
        <Title title={'轨迹信息'} />
        <PeopleCarProcessTrail trackData={trackData} setTrackTime={setTrackTime} />
      </div>
      {/*轨迹详情列表*/}
      <div className={styles.trailDetail}>
        <Title title={'轨迹详情'} />
        <TrailDetailTable sourceData={trailDetailData} />
      </div>
    </div>
  </div>
}

export default ShipProcessData
