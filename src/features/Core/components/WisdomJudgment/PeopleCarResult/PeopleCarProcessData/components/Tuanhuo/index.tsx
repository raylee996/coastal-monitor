import React, {useEffect, useState} from "react";
import styles from "../../index.module.sass";
import {InputType} from "hooks/flexibility/FormPanel";
import {
  exportProcessDataAsync,
  getProcessDataListAsync,
  getTrackData
} from "../../../../../../../../server/core/wisdomJudgment";
import TableInterface from "hooks/integrity/TableInterface";
import {Button, Image} from "antd";
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

//团伙分析
const Tuanhuo: React.FC<Props> = ({eventId, eventType, extraParams}) => {
  const [activeRowId, setActiveRowId] = useState<any>('');
  const [trackData, setTrackData] = useState<any>();
  const [trackTime, setTrackTime] = useState<any>(null);
  const [obj, setObj] = useState<any>(null);

  const columns = [
    ['分析数据A', 'tagCode'],
    ['团伙数据B', 'memberTagCode'],
    ['A最后出现时间', 'lastTime'],
    ['A最后出现点位', 'lastAddress'],
    ['B最后出现时间', 'memberLastTime'],
    ['B最后出现点位', 'memberLastAddress'],
    ['关联次数', 'allTimes'],
    ['操作', '', {
      itemProps: {
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={() => {
                popup(<ArchiveInfo type={Number(record.archiveType)} id={record.archiveId}/>,
                  {title: '档案', size: "fullscreen"})
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
      if (vo.data.length > 0) {
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
    if (_.isNil(record)) {
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
        <Title title={'关联详情'}/>
        <ul>
          <li className={styles.trailDetailItem}>
            <div>
              <Image
                width={60}
                height={60}
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                fallback="data:image/png;base64,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"
              />
            </div>
            <div>
              <div>车牌号：粤A12345</div>
              <div>时间：2022-11-23 11:24:32</div>
              <div>点位：双流国际卡口</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </>
}

export default Tuanhuo
