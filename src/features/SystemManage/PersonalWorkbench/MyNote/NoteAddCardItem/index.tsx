import { TableCardProps } from "hooks/flexibility/CardPanel";
import styles from "./index.module.sass";
import { Button } from 'antd'
import { deleteMyNoteItems } from "server/system";
import NoteAdd from "../NoteAdd";
// import popup from "hooks/basis/Popup";
import SearchNotes from '../searchNotes'
import { useNavigate } from "react-router-dom";
import windowstill from "hooks/basis/Windowstill";
import WisdomJudgment from "features/Core/components/WisdomJudgment";
import WindowDelet from "component/WindowDelet";
import { useCallback, useMemo } from "react";
import popupmini from "component/PopupMini";
import OverallSituation from "features/Core/components/WisdomSearch/OverallSituation";
import popupUI from "component/PopupUI";
import JessibucaProHistoryMonitor from "features/DataCenter/TotalDataMange/CollectionData/SourceData/VideoData/components/JessibucaProHistoryMonitor";


const NoteAddCardItem: React.FC<TableCardProps<any>> = ({ index, data, onRefresh }) => {
  console.debug('NoteAddCardItem')


  const navigate = useNavigate();


  const noteContent = useMemo(() => {
    if (data.noteType === 4) {
      return JSON.parse(data.noteContent)
    } else {
      return {}
    }
  }, [data])


  const deleteNote = useCallback(
    () => {
      popupmini(<WindowDelet title={'确定删除标签吗？'} request={deleteMyNoteItems} id={{ id: data.id }} onSuccess={() => {
        onRefresh && onRefresh()
      }} />, { title: '删除提示', size: 'auto' })
    },
    [data, onRefresh],
  )

  const editNote = useCallback(
    () => {
      popupmini(<NoteAdd id={data.id} noteType={0} labelName={data.noteTypeId} noteContent={data.noteContent} onSuccess={() => {
        onRefresh && onRefresh()
      }} />, { title: '编辑便签', size: "auto" })
    },
    [data, onRefresh],
  )

  const handleButton = useCallback(
    () => {
      navigate('/core')
      if (data.noteType === 3) {
        const noteContent = JSON.parse(data.noteContent)
        windowstill(<OverallSituation
          value={noteContent.searchData.type}
          params={noteContent.searchData.queryParams}
        />, {
          title: '智搜',
          key: '分类智搜页面',
          width: '1880px',
          height: '840px',
          offset: [20, 70]
        })
      } else {
        const clueInfo: any = []
        windowstill(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['04'] }} />, { title: '智能研判', key: 'WisdomJudgment', width: '1880px', height: '840px', offset: [20, 70] })
      }
    },
    [data, navigate],
  )

  const handleSearchNotes = useCallback(
    () => {
      popupmini(<SearchNotes labelName={data.noteTypeIdName} noteContent={data.noteContent} times={data.createTime} />, { title: '查看便签', size: "auto" })
    },
    [data],
  )

  const handleHistoryMonitor = useCallback(
    () => {
      const timeRange = [noteContent.sTime, noteContent.eTime]
      popupUI(<JessibucaProHistoryMonitor code={noteContent.info?.deviceCode} timeRange={timeRange} />, { title: "历史视频", size: 'large' })
    },
    [noteContent],
  )



  return (
    <article className={`${styles.wrapper} ${(index + 1) % 5 === 0 ? styles.padding_right : ''}`}>
      {data.noteType === 0 &&
        <div>
          <div className={styles.title}>新增便签</div>
          <div className={styles.contents}>
            <p>分类：<span>{data.noteTypeIdName}</span></p>
            <p className={styles.heightBox}>内容：<span title={data.noteContent}>{data.noteContent}</span></p>
            <p>操作时间：<span>{data.createTime}</span></p>
          </div>
          <Button style={{ marginLeft: '10px' }} onClick={deleteNote}>删除</Button>
          <Button style={{ marginLeft: '10px' }} type={"primary"} onClick={editNote}>编辑</Button>
          <Button style={{ marginLeft: '10px' }} onClick={handleSearchNotes}>查看</Button>
        </div>
      }
      {data.noteType === 4 &&
        <div>
          <div className={styles.title}>历史视频</div>
          <div className={styles.contents}>
            <p>分类：<span>{data.noteTypeIdName}</span></p>
            <p>时间段：<span>{noteContent.sTime}-{noteContent.eTime}</span></p>
            <p>站点：<span>{noteContent.info.deviceName}</span></p>
            <p>操作时间：<span>{data.createTime}</span></p>
            <p>备注：<span>{data.noteDesc}</span></p>
          </div>
          <Button style={{ marginLeft: '10px' }} onClick={deleteNote}>删除</Button>
          <Button style={{ marginLeft: '10px' }} type="primary" onClick={handleHistoryMonitor}>查看</Button>
        </div>
      }
      {data.noteType !== 0 && data.noteType !== 4 &&
        <div>
          <div className={styles.title}>{data.noteTypeIdName}</div>
          <div className={styles.contents}>
            <p>分类：<span>{data.noteTypeIdName}</span></p>
            {data.noteType !== 3 && <p>任务名称：<span>{data.taskName}</span></p>}
            {data.noteType !== 3 && <p>模型：<span>{data.modelName}</span></p>}
            {data.noteType === 3 && <p>数据类型：<span>{data.taskName}</span></p>}
            <p>结果数量：<span>{data.resultNum}</span></p>
            <p>操作时间：<span>{data.createTime}</span></p>
            <p>备注：<span>{data.noteDesc}</span></p>
          </div>
          <Button style={{ marginLeft: '10px' }} onClick={deleteNote}>删除</Button>
          <Button style={{ marginLeft: '10px' }} type={"primary"} onClick={handleButton}>查看</Button>
        </div>
      }
    </article>
  )
}

export default NoteAddCardItem
