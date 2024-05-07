import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, message, Tooltip, Spin } from 'antd';
import styles from "./index.module.sass";
import XcEmpty from "component/XcEmpty";
import { deletePlaceLabelById, doAddLabel, getLabelTable } from "server/label";
import { CloseOutlined } from "@ant-design/icons";
import common from "helper/common";
// import popup from "hooks/basis/Popup";
import LabelEdit from "./components/LabelEdit";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";
// import "../../features/DataCenter/dataCenter.sass"

// const { confirm } = Modal;


interface ILabelManage {
  changePagination?: Function,
  total?: number,
  pageSize?: number,
  currentPage?: number
  option?: any
  /**标签类型 1人员档案 2车辆档案 3手机档案 4船舶档案 5雷达目标 6船舶布控 7建模风险类别 8案件类别 9场所类型 10人员布控 11便签类别 */
  type?: any
  /**显示的自定义标签名 */
  typeName?: any
  /**是否显示系统标签 */
  hasSystem?: boolean
  hasTypeName?: boolean
}

const LabelManage: React.FC<ILabelManage> = ({ option, changePagination, total, pageSize, currentPage, type, typeName, hasSystem, hasTypeName }) => {
  console.debug('LabelManage')

  // 数据定义
  const showAdd = option && option.showAdd ? option.showAdd : true
  // 新增框
  const [insertValue, setInsertValue] = useState('');

  const [loading, setLoading] = useState(true)
  // label数据
  const [labelData, setLabelData] = useState([]);


  const handleGetData = useCallback<any>(() => {
    async function main() {

      setLoading(true)
      const vo: any = await getLabelTable({ type })
      setLabelData(vo.data)

      setLoading(false)
    }
    main()
  }, [type])


  // 初始化数据
  useEffect(() => {
    handleGetData()
  }, [handleGetData]);


  // 业务处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)

    setInsertValue(e.target.value);
  };

  // const handleInputConfirm = () => {
  //   setInsertValue('');
  // };


  function handleOnDel(item: any, moduleTitle?: any) {
    popupUI(<WindowDelet
      title={'确定删除重点场所吗？'}
      request={deletePlaceLabelById}
      id={item.id}
      onSuccess={() => {
        handleGetData()
      }} />, {
      title: '删除提示',
      size: 'auto'
    })
    //删除tag
    // confirm({
    //   //title: `是否确定删除[${moduleTitle}]标签项[${item.labelName === undefined ? '' : item.labelName}]?`,
    //   // icon: <ExclamationCircleOutlined />,
    //   content: <div style={{color:"#00f0fe",fontSize:'16px'}}>是否确定删除 "{moduleTitle}" 标签项 "{item.labelName === undefined ? '' : item.labelName}" ?</div>,
    //   onOk() {
    //     //删除标签
    //     handleDelLabel(item)
    //   },
    //   onCancel() {
    //   },
    // });
  };

  // 删除标签
  // async function handleDelLabel(item: any) {
  //   const vo = await doDelLabel({
  //     id: item.id,//标签名
  //   })

  //   if (vo.code === 200) {
  //     //获取列表数据
  //     handleGetData()
  //     message.success('删除成功')
  //   }
  // }

  /**新增 */
  async function handleAddLabel(item?: any) {
    if (insertValue === '') {
      common.showMessage({ msg: '标签名不能为空', type: 'warning' })
      return
    }

    const result = await doAddLabel({
      labelName: common.trimString(insertValue),//标签名
      type,//标签类型 1人员档案 2车辆档案 3手机档案 4船舶档案 5雷达目标 6船舶布控 7建模风险类别 8案件类别 9场所类型 10人员布控 11便签类别
    })
    if (result.data.code === 200) {
      setInsertValue("")
      handleGetData()
      message.success('新增成功')
    } else if (result.data.code === 500) {
      if (typeName) {
        message.error('存在同名' + typeName)
      } else {
        message.error(result.data.msg)
      }
    } else {
      message.error(result.data.msg)
    }
  }

  function handleEditFinish() {
    handleGetData()
  }

  // 编辑标签
  function handleChange(item?: any) {
    popupUI(<LabelEdit item={item} type={type} onFinish={handleEditFinish} />, { title: hasTypeName ? '编辑分类' : '编辑标签', size: "auto" })
  }

  return (
    <div className={styles.wrapper}>
      {
        loading && <div className={styles.loading}>
          <Spin size="large" tip="Loading..." />
        </div>
      }


      {/* 是否显示新增 */}
      {
        showAdd ? (<div className={styles.xcRow}>
          <div className={styles.title}>{hasTypeName ? '新增分类：' : '新增标签：'}</div>
          <div className={styles.content}>
            <Input
              type="text"
              value={insertValue}
              maxLength={20}
              showCount
              onChange={handleInputChange}
              // onPressEnter={handleInputConfirm}
              allowClear
            />
          </div>
          <Button className={styles.btn} type="primary" onClick={() => { handleAddLabel() }}>新增</Button>
        </div>
        ) : <></>
      }

      {
        hasSystem && <div className={styles.tagsPanel}>
          <div className={styles.panelTitle}>系统标签</div>
          <div className={styles.panelContent}>
            <div className={styles.tagsList}>
              {
                labelData && labelData.length !== 0 ?
                  labelData.map((item: any, index: number) => (
                    item.isAuto === '1' ?
                      <>
                        <Tooltip placement="bottom" title={item['labelName']} color={'#1a61af'}>
                          <div
                            className={styles.tagItem}
                            key={'label_costom_tag_' + index}
                          >
                            <div
                              className={styles.txt}
                            >
                              {item['labelName']}
                            </div>
                            <div
                              className={styles.btn}
                              onClick={(e) => {
                                e.preventDefault()
                                handleOnDel(item, '自定义标签')
                              }} >
                            </div>
                          </div>
                        </Tooltip>
                      </>
                      :
                      null
                  ))
                  : <XcEmpty></XcEmpty>
              }
            </div>
          </div>
        </div>
      }

      <div className={styles.tagsPanel}>
        {hasSystem && <div className={styles.panelTitle} >{typeName ? typeName : '自定义标签'}</div>}
        <div className={styles.panelContent}>
          <div className={styles.tagsList}>
            {
              labelData && labelData.length !== 0 ?
                labelData.map((item: any, index: number) => (
                  item.isAuto === '0' ?
                    <>
                      <Tooltip placement="bottom" title={item['labelName']} color={'#1a61af'}>
                        <div
                          className={styles.tagItem}
                          key={'label_costom_tag_' + index}
                        >
                          <div
                            className={styles.txt}

                            onClick={() => {
                              // 打开编辑标签
                              handleChange(item)
                            }}>
                            {item['labelName']}
                          </div>
                          <div
                            className={styles.btn}
                            onClick={(e) => {
                              e.preventDefault()
                              handleOnDel(item, '自定义标签')
                            }} >
                            <CloseOutlined style={{ fontSize: '12px' }} />
                          </div>
                        </div>
                      </Tooltip>

                    </>
                    : null
                ))
                : <XcEmpty></XcEmpty>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// 组件属性默认值
LabelManage.defaultProps = {
  hasSystem: false
}
export default LabelManage