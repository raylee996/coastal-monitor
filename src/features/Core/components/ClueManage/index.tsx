import React, { useEffect, useRef, useState } from "react";
import TableInterface from "hooks/integrity/TableInterface";
import styles from './index.module.sass'
import { InputType } from "hooks/flexibility/FormPanel";
import { clueContentDict, clueType } from "../../../../helper/dictionary";
import { delClueAsync, getClueListAsync } from "../../../../server/core/clue";
import { Button, message, Popconfirm, Tag, Image } from "antd";
import popup from "hooks/basis/Popup";
import ClueAdd from "./ClueAdd";
import _ from "lodash";
import XcEmpty from "../../../../component/XcEmpty";

interface Props {
  onChange?: Function

  onClosePopup?: Function

  //  默认加入的线索
  defaultChoosenClue?: any
  // 默认查询线索类型,人车:1/船舶:2
  objType?: number
  // 是否显示加入线索的功能
  isNotShowAddClue?: Boolean

}
//线索管理
const ClueManage: React.FC<Props> = ({
  onChange,
  onClosePopup,
  defaultChoosenClue,
  objType,
  isNotShowAddClue
}) => {
  console.debug('ClueManage')
  const columns = [
    ['线索名称', 'name'],
    ['线索类型', 'typeName'],
    ['线索内容', 'parseContent', {
      itemProps: {
        width: 600,
        render: (list: any) => {
          if (list && list.length > 0) {
            return <>
              {list.map((item: any) => {
                let key = item.split('*')[0]
                let value = item.split('*').slice(1)
                let values = value[0].split(',')
                return <>
                  <div>
                    {key.includes('人脸') && <>
                      <span className={styles.tableKeyTag}>{key}: </span>
                      {values && values.map((i: any) => {
                        return <span key={i} style={{ margin: '2px' }}>
                          <Image width={60} height={60} src={i} />
                        </span>
                      })}
                    </>}
                    {!key.includes('人脸') && <>
                      <span className={styles.tableKeyTag}>{key}: </span>
                      {values && values.map((i: any) => {
                        return <span key={i}>{i},</span>
                      })}
                    </>}
                  </div>
                </>
              })}
            </>
          } else {
            return;
          }
        }
      }
    }],
    ['更新时间', 'createTime'],
    ['更新人', 'createBy'],
    ['操作', '', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          return (
            <>
              {!isNotShowAddClue && <Button type={"link"} onClick={() => addToClue(record)}>加入线索</Button>}
              <Button type={"link"} onClick={() => showEditClue(record)}>编辑</Button>
              <Popconfirm title="确定要删除吗?" onConfirm={() => delClue(record)}>
                <Button type={"link"}>删除</Button>
              </Popconfirm>
            </>
          )
        }
      }
    }],
  ]
  const inputs = [
    ['线索名称', 'name', { placeholder: '请输入线索名称' }],
    ['线索内容', 'content', {
      placeholder: '请输入AIS、雷达、车牌搜索',
      style: {
        width: '200px'
      }
    }],
    ['线索类型', 'type', InputType.select, {
      dict: clueType,
      placeholder: '请输入线索类型',
      style: {
        width: '200px'
      }
    }],
  ]
  const tableRef = useRef<any>();
  const [choosenClue, setChoosenClue] = useState<any>([]);

  useEffect(() => {
    if (defaultChoosenClue) {
      setChoosenClue(defaultChoosenClue)
    }
  }, [defaultChoosenClue]);

  function delClue(record: any) {
    delClueAsync(record.id).then(() => {
      message.success('删除成功')
      refreshTable();
    })
  }

  //加入线索
  function addToClue(record: any) {
    //加入线索之前，判断线索是否为空
    let recordContent = JSON.parse(record.content)
    if (recordContent.length === 1 && (!recordContent[0].archiveKind && !recordContent[0].archiveIds)) {
      message.warning('线索内容为空')
      return []
    } else if (recordContent.length === 1 && (
      recordContent[0].archiveKind &&
      recordContent[0].archiveKind.length === 1 &&
      recordContent[0].archiveKind.includes(9) &&
      !recordContent[0].archiveIds)) {
      //  archiveKind 为单独一个自定义【9】，并且为选择自定义档案,此时线索内容为空。
      message.warning('线索内容为空')
      return []
    }
    setChoosenClue((val: any) => {
      //检查数组每一项进行去重
      let arr: any = _.uniqWith(val.concat(...(JSON.parse(record.content))), _.isEqual);
      let result = [];
      if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          result.push(arr[i])
        }
      }
      return result
    })
  }

  //确定
  function confirmAdd() {
    onChange && onChange(choosenClue)
    onClosePopup && onClosePopup();
  }
  //取消
  function confirmCancel() {
    onClosePopup && onClosePopup();
  }

  //清空
  function clearClue() {
    setChoosenClue([])
  }

  //刷新表格数据
  function refreshTable() {
    tableRef.current && tableRef.current.onRefresh()
  }

  //新增
  function showAddClue() {
    popup(<ClueAdd refreshTable={refreshTable} />, { size: 'middle', title: '新增线索' })
  }

  //编辑
  function showEditClue(record: any) {
    popup(<ClueAdd refreshTable={refreshTable} defaultData={record} />, { size: 'middle', title: '编辑线索' })
  }

  return <div className={styles.wrapper}>
    <div style={{ height: '550px' }}>
      <TableInterface
        ref={tableRef}
        queryInputs={inputs}
        queryInit={{
          type: objType ? (objType === 1 ? 1 : 2) : ''
        }}
        request={getClueListAsync}
        paginationProps={{
          showSizeChanger: false,
          showTotal: (total: number) => {
            return `共 ${total} 条`
          }
        }}
        tools={[<>
          <Button type={"primary"} onClick={showAddClue}>新增</Button>
        </>]}
        columns={columns} />
    </div>


    {/*已选择的线索*/}
    {!isNotShowAddClue && <div>
      <div className={styles.chooseClueTitle}>
        已选择的线索
        <Button type={"primary"} size={"small"} onClick={clearClue} style={{ marginLeft: '20px' }}>清空</Button>
      </div>
      <div className={styles.chooseClueInfo}>
        {
          clueContentDict.map((item: any) => {
            return <ClueTags choosenClue={choosenClue} key={item.value} type={item.value} setChoosenClue={setChoosenClue} />
          })
        }
        {choosenClue.length === 0 && <XcEmpty />}
      </div>
      <div className={styles.chooseClueConfirm}>
        <Button type={"default"} onClick={confirmCancel} style={{ marginRight: '10px' }}>取消</Button>
        <Button type={"primary"} onClick={confirmAdd}>确定</Button>
      </div>
    </div>}

  </div>
}

interface ClueTagsProps {
  choosenClue: any,
  type: any,
  setChoosenClue: Function
}

const ClueTags: React.FC<ClueTagsProps> = ({ choosenClue, type, setChoosenClue }) => {

  const filteredClueByType = filterClueByType(choosenClue, type)

  //type:用于区分删除船舶档案，人员档案，车辆档案。
  function handleClose(val: any, e: any, hasArchive: boolean, archiveType: any) {
    e.preventDefault()
    let newList = JSON.parse(JSON.stringify(choosenClue))
    //无自定义档案
    if (archiveType === type) {
      _.remove(newList, function (x: any) {
        return x.codeValue === val && x.codeType === archiveType
      })
    } else {
      //有档案
      for (let i = 0; i < newList.length; i++) {
        //删除船舶自定义档案
        if (archiveType === 'ship' && newList[i].archiveType === 3 && newList[i].archiveIds && newList[i].archiveIds.length > 0 && newList[i].archiveIds.includes(val)) {
          _.remove(newList[i].archiveIds, function (x: any) {
            return x === val
          })
          break;
        }
        //删除人员自定义档案
        if (archiveType === 'man' && newList[i].archiveType === 0 && newList[i].archiveIds && newList[i].archiveIds.length > 0 && newList[i].archiveIds.includes(val)) {
          _.remove(newList[i].archiveIds, function (x: any) {
            return x === val
          })
          break;
        }
        //删除车辆自定义档案
        if (archiveType === 'car' && newList[i].archiveType === 1 && newList[i].archiveIds && newList[i].archiveIds.length > 0 && newList[i].archiveIds.includes(val)) {
          _.remove(newList[i].archiveIds, function (x: any) {
            return x === val
          })
          break;
        }

        // 删除船舶，重点、关注、一般
        if ((val.toString().includes('重点')) && newList[i].archiveType === 3 && archiveType === 'ship') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 2
          })
        } else if (val.toString().includes('关注') && newList[i].archiveType === 3 && archiveType === 'ship') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 3
          })
        } else if (val.toString().includes('一般') && newList[i].archiveType === 3 && archiveType === 'ship') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 4
          })
        }
        // 删除人员，重点、关注、一般
        if ((val.toString().includes('重点')) && newList[i].archiveType === 0 && archiveType === 'man') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 2
          })
        } else if (val.toString().includes('关注') && newList[i].archiveType === 0 && archiveType === 'man') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 3
          })
        } else if (val.toString().includes('一般') && newList[i].archiveType === 0 && archiveType === 'man') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 4
          })
        }
        // 删除车辆，重点、关注、一般
        if ((val.toString().includes('重点')) && newList[i].archiveType === 1 && archiveType === 'car') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 2
          })
        } else if (val.toString().includes('关注') && newList[i].archiveType === 1 && archiveType === 'car') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 3
          })
        } else if (val.toString().includes('一般') && newList[i].archiveType === 1 && archiveType === 'car') {
          _.remove(newList[i].archiveKind, function (x: any) {
            return x === 4
          })
        }
      }
    }


    //解决存在值，但是没有数据的情况
    /**
      1、
     archiveIds:[]
     archiveKind:[9]
     archiveType:1
     2、
     * archiveType:1
     * archiveKind:undefined
     * archiveIds:undefined
     * */
    _.remove(newList, function (item: any) {
      return (item.archiveKind &&
        item.archiveKind &&
        item.archiveKind.length === 1 &&
        item.archiveKind.includes(9) &&
        item.archiveIds &&
        item.archiveIds.length === 0) ||
        (item.archiveType && !item.archiveKind && item.archiveIds)
    });

    setChoosenClue(newList)
  }

  return <>
    {/*无档案*/}
    {filteredClueByType.arr.length > 0 && <div className={styles.clueInfoItem}>
      {clueContentDict.map((item: any) => {
        return <span key={item.value}>{type === item.value &&
          <span className={styles.clueInfoTitle}>{item.name}：</span>}</span>
      })}
      {filteredClueByType.arr.map((item: any, index: number) => {
        if (type === 0) {
          return <Tag style={{ marginBottom: '6px' }} key={index} closable onClose={(e) => {
            handleClose(item.codeValue, e, false, item.codeType)
          }}>
            <Image src={item.imageUrl} width={60} height={60} />
          </Tag>
        }
        return <Tag style={{ marginBottom: '6px' }} key={index} closable onClose={(e) => {
          handleClose(item.codeValue, e, false, item.codeType)
        }}>{item.codeValue}</Tag>
      })}
    </div>}
    {/*有船舶档案*/}
    {filteredClueByType.ship.arr.length > 0 && type === 9 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>船舶档案：</span>
      {filteredClueByType.ship.arr.map((item: any, index: number) => {
        return <Tag style={{ marginBottom: '6px' }} key={index} closable onClose={(e) => {
          handleClose(item, e, true, 'ship')
        }}>{item}</Tag>
      })}
    </div>
    }
    {/*有车辆档案*/}
    {filteredClueByType.car.arr.length > 0 && type === 10 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>车辆档案：</span>
      {filteredClueByType.car.arr.map((item: any, index: number) => {
        return <Tag style={{ marginBottom: '6px' }} key={index} closable onClose={(e) => {
          handleClose(item, e, true, 'car')
        }}>{item}</Tag>
      })}
    </div>
    }
    {/*有人员档案*/}
    {filteredClueByType.man.arr.length > 0 && type === 11 && <div className={styles.clueInfoItem}>
      <span className={styles.clueInfoTitle}>人员档案：</span>
      {filteredClueByType.man.arr.map((item: any, index: number) => {
        return <Tag style={{ marginBottom: '6px' }} key={index} closable onClose={(e) => {
          handleClose(item, e, true, 'man')
        }}>{item}</Tag>
      })}
    </div>
    }
  </>
}

function filterClueByType(contentArr: any, type: number) {
  let obj: any = {
    arr: [],
    ship: {
      arr: []
    },
    man: {
      arr: []
    },
    car: {
      arr: []
    }
  };
  if (contentArr.length > 0) {
    contentArr.forEach((item: any) => {
      //无档案
      if (item.codeType === type) {
        obj.arr.push(item)
      } else {
        //有档案（船舶，车辆，人员档案）
        if (item.archiveType === 3) {
          //船舶档案
          obj.ship.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.ship.arr.push('重点船舶')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.ship.arr.push('关注船舶')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.ship.arr.push('一般船舶')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.ship.arr.push(...item.archiveIds)
          }
          obj.ship.arr = _.uniq(obj.ship.arr)
        } else if (item.archiveType === 0) {
          //人员档案
          obj.man.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.man.arr.push('重点人员')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.man.arr.push('关注人员')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.man.arr.push('一般人员')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.man.arr.push(...item.archiveIds)
          }
          obj.man.arr = _.uniq(obj.man.arr)
        } else if (item.archiveType === 1) {
          //车辆档案
          obj.man.info = item
          if (item.archiveKind && item.archiveKind.includes(2)) {
            obj.car.arr.push('重点车辆')
          }
          if (item.archiveKind && item.archiveKind.includes(3)) {
            obj.car.arr.push('关注车辆')
          }
          if (item.archiveKind && item.archiveKind.includes(4)) {
            obj.car.arr.push('一般车辆')
          }
          if (item.archiveIds && item.archiveIds.length > 0) {
            obj.car.arr.push(...item.archiveIds)
          }
          obj.car.arr = _.uniq(obj.car.arr)
        }
      }
    })
  }
  return obj
}

export default ClueManage
