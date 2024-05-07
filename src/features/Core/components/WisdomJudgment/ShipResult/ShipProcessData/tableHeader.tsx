import { Button, message } from "antd";
import popup from "hooks/basis/Popup";
import ArchiveInfo from "../../../../../DataCenter/components/ArchiveInfo";
/**
 * 点击流程图节点，切换不同的列表表头
 * */

export function getTableColumns(eventType: any) {
  switch (eventType) {
    //未开ais
    case '01':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
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
      ]
    //超速
    case '02':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['超速时长（分钟）', 'duration'],
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
      ]
    //怠速
    case '03':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['怠速时长（分钟）', 'duration'],
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
      ]
    //越线
    case '04':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['越线次数', 'frequency'],
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
      ]
    //靠岸，暂无
    case '05':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //进出区域
    case '06':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['进出次数', 'frequency'],
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
      ]
    //海面停泊
    case '07':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['停泊时长（分钟）', 'duration'],
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
      ]
    //曾去地，暂无
    case '08':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //船型，暂无
    case '09':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //船籍，暂无
    case '10':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //两船靠泊，暂无
    case '11':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //并行船舶
    case '12':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['并行船舶', 'interactTagContent'],
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
      ]
    //尾随行驶
    case '13':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['尾随船舶', 'interactTagContent'],
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
      ]
    //交集运算
    case '14':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //并集运算
    case '15':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //线索目标
    case '16':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //差集运算
    case '17':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //走走停停
    case '19':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //折返分析
    case '20':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
    //往返分析
    case '21':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
        ['往返次数', ''],
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
      ]
    //历史任务
    case '99':
      return [
        ['序号', 'index', { itemProps: { width: '60px' } }],
        ['目标ID', 'tagCode'],
        ['数据内容', 'dataContent'],
        ['最后出现时间', 'lastTime'],
        ['最后出现经纬度', 'lastAddress'],
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
      ]
  }
}
