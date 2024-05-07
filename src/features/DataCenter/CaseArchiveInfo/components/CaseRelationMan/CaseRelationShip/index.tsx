import React, { useCallback, useEffect, useState } from "react";
import styles from './index.module.sass'
import { Checkbox, Form, message, Space } from 'antd'
import ImageSimple from "hooks/basis/ImageSimple";
import { InputType } from "hooks/flexibility/FormPanel";
import XcRadios from "../../../../../../component/XcRadios";
import { nodeLevelDict, searchTimeRangeDict } from "../../../../../../helper/dictionary";
import XcEchartsNode from "../../../../../../component/XcEchartsNode";
import Title from "../../../../../../component/Title";
import { defaultImgPeople } from "helper/common";
import { qureyCaseSuspectsList, getLegalCaseRelation } from "server/dataCenter/caseArchive";
import FormInterface from "hooks/integrity/FormInterface";

interface Props {
  /**选中的案件 */
  caseItem?: any,
  active?: any
}

const formInputs = [
  ['每层条数', 'count', InputType.select, {
    dict: nodeLevelDict,
    placeholder: '请选择',
    style: { width: '100px' }
  }],
  ['数据类型', 'type', InputType.component, {
    component: XcRadios,
    isRow: true,
    option: {
      data: [
        { name: '人脸', value: "1" },
        // {name: '侦码', value: "2"},
        { name: '车牌', value: "3" },
      ]
    }
  }],
  ['查询时段', 'time', InputType.select, {
    dict: searchTimeRangeDict,
    placeholder: '请选择',
    style: { width: '100px' }
  }],

]

const initData = {
  count: 5,
  type: '1',
  time: 0
}

//关系图谱
const CaseRelationShip: React.FC<Props> = ({ caseItem, active }) => {

  const [form] = Form.useForm();

  const [list, setList] = useState<any>([])
  const [selectId, setSelectId] = useState<number[]>([])
  const [relationData, setRelationData] = useState<any>()

  // 调用接口获取关系图谱数据
  const handleRelationList = useCallback(async (value: any, suspectIds: number[]) => {
    const vo = await getLegalCaseRelation({
      ...value,
      caseId: caseItem.id,
      suspectIds
    })
    setRelationData(vo)
  }, [caseItem.id])

  const getCaseManList = useCallback(async (caseId: string, count: number) => {
    const vo = await qureyCaseSuspectsList({ pageNumber: -1, pageSize: -1 }, { caseId })
    const data = vo.data || []
    setList(data)
    // 按默认值取前n个选中值 列表不足n时取所有
    setSelectId(() => {
      const idList = data?.filter((item: any, index: number) => index < count).map((item: any) => item.id)
      // 初始默认查询
      handleRelationList(initData, idList)
      return idList
    })
  }, [handleRelationList])

  useEffect(() => {
    caseItem.id && getCaseManList(caseItem.id, initData.count)
  }, [caseItem.id, getCaseManList])

  // 点击勾选人员
  const handelChangePepole = useCallback((data: any) => {
    const count = form.getFieldValue('count')
    if (data.length > count) {
      message.warning(`勾选数量不能超过${count}个`)
      return
    }
    setSelectId(data)
  }, [form])

  // 点击筛选
  async function handleFinish(value?: any) {
    if (!selectId?.length) {
      message.warning('请选择涉案人员')
      return
    }

    handleRelationList(value, selectId)
  }

  return <article className={styles.wrapper}>
    <div className={styles.left}>
      <p className={styles.leftTitle}>
        <Title title={'选择人员'} />
      </p>
      <div className={styles.checkbox}>
        <Checkbox.Group style={{ width: '100%' }} onChange={handelChangePepole} value={selectId}>
          <Space size={10} direction={"vertical"} className={styles.leftPepole}>
            {list.map((item: any) => {
              return <section key={item.id}>
                <Checkbox value={item.id} checked={item.is}><ImageSimple src={item.facePath} width={60} height={60} defaultSrc={defaultImgPeople} />&emsp;{item.name}</Checkbox>
              </section>
            })
            }
          </Space>
        </Checkbox.Group>
      </div>

    </div>
    <div className={styles.right}>
      <div className={styles.condition}>
        <FormInterface
          form={form}
          inputs={formInputs}
          onAsyncFinish={handleFinish}
          formProps={{
            layout: "inline",
          }}
          initData={initData}
          options={{
            isNotShowFooter: true,
            isShowItemButton: true,
            isShowReset: false,
            submitText: '筛选'
          }} />
        <div className={styles.boxEchartsNode}>
          <XcEchartsNode data={relationData} />
        </div>
      </div>
    </div>
  </article>
}

export default CaseRelationShip
