import React, { useEffect, useState } from "react";
import styles from './index.module.sass'
import PlanBasic from "../PlanBasic";
import PlanShow from "../PlanShow";
import PlanSettings from "../PlanSettings";

interface Props {
  onClosePopup?: Function
  //编辑需要的数据
  record?: any
  // 模型Id
  modelId?: string | number
}
//新增预案
const PlanAdd: React.FC<Props> = ({ onClosePopup, record, modelId }) => {
  const [active, setActive] = useState(0);
  const [basicInfo, setBasicInfo] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  //配置预案中的节点数据
  const [nodes, setNodes] = useState([]);

  // 配置完成后返回的id
  const [dataId, setDataId] = useState<any>(null)

  //编辑时需要赋初始值
  useEffect(() => {
    if (record) {
      setBasicInfo(record)
    }
  }, [record]);

  // 从智慧建模跳转至预案管理，需要传递modelId
  useEffect(() => {
    if (modelId) {
      setBasicInfo({
        modelId
      })
    }
  }, [modelId])


  //激活选中的大圆点
  // function handleClick(val:number){
  //   //选择配置预案前，需要表单校验通过
  //   if(basicInfo===null){
  //     message.error('请先填写必填项')
  //     return
  //   }
  //   if (!basicInfo.name || !basicInfo.modelId){
  //     message.error('请先填写必填项')
  //     return
  //   }
  //   setActive(val)
  // }
  return <div className={styles.wrapper}>
    {/*顶部三个大圆点步骤*/}
    <div className={styles.topSteps}>
      <div className={`${styles.circle} ${active === 0 ? styles.active : ''}`}>
        基本信息
        <span className='icon iconfont icon-fanye' />
      </div>
      <div className={`${styles.circle} ${active === 1 ? styles.active : ''}`}>
        配置预案
        <span className='icon iconfont icon-fanye' />
      </div>
      <div className={`${styles.circle} ${active === 2 ? styles.active : ''}`}>预案演示</div>
    </div>

    {/*基本信息*/}
    {active === 0 && <PlanBasic
      onClosePopup={onClosePopup}
      nextStep={setActive}
      setBasicInfo={setBasicInfo}
      basicInfo={basicInfo}
      graphData={graphData}
      setGraphData={setGraphData}
      setNodes={setNodes}
    />}
    {/*配置预案*/}
    {active === 1 && <PlanSettings
      onClosePopup={onClosePopup}
      totalItem={nodes}
      basicInfo={basicInfo}
      graphData={graphData}
      nextStep={setActive}
      setDataId={setDataId}
    />}
    {/*预案演示*/}
    {active === 2 && <PlanShow
      onClosePopup={onClosePopup}
      totalItem={nodes}
      id={dataId} />}
  </div>
}

export default PlanAdd
