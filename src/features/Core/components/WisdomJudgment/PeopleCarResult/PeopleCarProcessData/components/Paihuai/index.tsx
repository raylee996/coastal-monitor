import React, {useEffect, useState} from "react";
import styles from "../../index.module.sass";
import {InputType} from "hooks/flexibility/FormPanel";
import {
  exportProcessDataAsync,
  getProcessDataListAsync,
  getTrackData
} from "../../../../../../../../server/core/wisdomJudgment";
import TableInterface from "hooks/integrity/TableInterface";
import {Button} from "antd";
import PeopleCarProcessTrail from "../../../PeopleCarProcessTrail";
import ArchiveInfo from "../../../../../../../DataCenter/components/ArchiveInfo";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import Title from "../../../../../../../../component/Title";

interface Props {
  eventId: any
  eventType: any
  extraParams: any
}

//徘徊分析
const Paihuai: React.FC<Props> = ({eventId, eventType, extraParams}) => {
  const [activeRowId, setActiveRowId] = useState<any>('');
  const [trackData, setTrackData] = useState<any>();
  const [trackTime, setTrackTime] = useState<any>(null);
  const [obj, setObj] = useState<any>(null);

  //轨迹详情
  const [trackDetail, setTrackDetail] = useState<any>([]);

  const columns = [
    ['数据类型', 'codeTypeName'],
    ['数据内容', 'tagCode'],
    ['最后出现时间', 'lastTime'],
    ['最后出现点位', 'lastAddress'],
    ['徘徊点位数', 'pointCount'],
    ['出现次数', 'allTimes'],
    ['操作', '', {
      itemProps: {
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={()=>{
                popup(<ArchiveInfo type={Number(record.archiveType)} id={record.archiveId} />,
                  {title:'档案',size:"fullscreen"})
              }}>档案</Button>
            </>
          )
        }
      }
    }],
  ]
  const inputs: any[] = [
    ['数据内容', 'tagCode', {
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
  //获取轨迹信息
  useEffect(() => {
    async function main() {
      if (obj === null) {
        return
      }
      let time = trackTime ? trackTime : null
      getTrackData({pageSize: 1000000, pageNumber: 1}, {
        obj: {
          targetType: obj.targetType,
          targetValue: obj.targetValue
        },
        time
      }).then(res => {
        setTrackData(res.trackData)
      })
    }

    main()
  }, [obj, trackTime]);

  //刚加载页面，需要选中表格第一行
  useEffect(() => {
    async function main() {
      let vo: any = await getProcessDataListAsync({pageSize: 5, pageNumber: 1}, {
        eventId,
        eventType,
        objType:2
      })
      if (vo.data.length>0){
        getTableItemTrack(vo.data[0])
        setActiveRowId(vo.data[0].id)
      }
    }
    if (eventType && eventId) {
      main();
    }
  }, [eventId, eventType]);

  //获取表格单条数据的轨迹
  function getTableItemTrack(record: any) {
    if (_.isNil(record)){
      return
    }
    setObj({
      targetType: record.codeType,
      targetValue: record.tagCode
    })
    //前端自我拼接碰撞详情列表
    let arr = [];
    //pointTimes长成这样： pointTimes: 3_测试地点,4_Test
    let tempArr = record.pointTimes.split(',')
    for (let i = 0; i < tempArr.length; i++) {
      arr.push({
        id: record.id,
        dataContent: record.tagCode,
        pointAddress: tempArr[i].split('_')[1],
        pointCount: tempArr[i].split('_')[0]
      })
    }
    setTrackDetail(arr)
  }

  return <>
    <div className={styles.bottom}>
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
            <Button type={"primary"} className={styles.tableActionBtn} onClick={()=>exportProcessDataAsync({...extraParams})}>导出</Button>
            <Button type={"primary"} className={styles.tableActionBtn}>布控</Button>
            <Button type={"primary"} className={styles.tableActionBtn}>线索管理</Button>
            <Button type={"primary"} className={styles.tableActionBtn}>历史轨迹</Button>
            <Button type={"primary"} className={styles.tableActionBtn}>智能研判</Button>
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

      {/*轨迹信息*/}
      <div className={styles.mapTrail}>
        <Title title={'轨迹信息'}/>
        <PeopleCarProcessTrail trackData={trackData} setTrackTime={setTrackTime}/>
      </div>

      {/*轨迹详情*/}
      <div className={styles.trailDetail}>
        <Title title={'徘徊详情'}/>
        <ul>
          {
            trackDetail && trackDetail.map((item: any) => {
              return <li key={item.id}>
                <div>数据内容：{ item.dataContent }</div>
                <div>点位：{ item.pointAddress }</div>
                <div>出现次数：{ item.pointCount }</div>
              </li>
            })
          }
        </ul>
      </div>
    </div>
  </>
}

export default Paihuai
