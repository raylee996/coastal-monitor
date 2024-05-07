import { Button, Space, Image, FormInstance, message } from "antd"
import dayjs from "dayjs"
import { YMDHms } from "helper"
import Map2D, { MapTileType } from "helper/Map2D"
import _ from "lodash"
import { useCallback, useEffect, useRef, useState } from "react"
import { getModelDetailAsync } from "server/core/model"
import PlanTopPreview from "./components/PlanTopPreview"
import styles from './index.module.sass'
import PlanConfigForm from "./PlanConfigForm"

import HighIcon from 'images/shipList/lingdang_high.png'
import MiddleIcon from 'images/shipList/lingdang_middle.png'
import LowIcon from 'images/shipList/lingdang_low.png'
import { addPlanAsync, editPlanAsync } from "server/core/planManagement"
import { planGetAllControlList } from "server/core/planManagement"

interface Props {
    // 基本信息
    basicInfo: any
    // 预案id
    planId?: any
    // 上一步
    setStep?: (step: string) => void
    // 关闭
    onClosePopup?: () => void
}

let formInstanceList: any[] = []

// 预案配置
const PlanConfig: React.FC<Props> = ({
    basicInfo,
    setStep,
    onClosePopup,
    planId
}) => {
    console.debug('PlanConfig')
    const mapRef = useRef<HTMLDivElement>(null)
    const [map2d, setMap2d] = useState<Map2D>();

    // 预案form表单
    const [nodeList, setNodeList] = useState<any>()

    // 初始化地图实例
    useEffect(() => {
        let _map2d: Map2D
        if (mapRef.current) {
            _map2d = new Map2D(mapRef.current, MapTileType.satellite)
            setMap2d(_map2d)
        }
        return () => {
            _map2d && _map2d.remove()
        }
    }, [])



    // 获取需要配置表单的节点数据
    useEffect(() => {
        async function main(monitorType: string) {
            switch (monitorType) {
                // 船舶布控
                case '0104':
                    // alarmCondition值
                    // 0 1 2 进出区域,对应eventType: 06
                    // 3 出现,对应eventType：27
                    let vo = await planGetAllControlList()
                    if (vo) {
                        let res = vo.find((item: any) => item.id === basicInfo.shipControlName)
                        res && setNodeList([{
                            eventName: res.shipConditionJson.alarmCondition === '3' ? '出现' : '进出区域',
                            eventType: res.shipConditionJson.alarmCondition === '3' ? '27' : '06',
                            id: _.uniqueId(),
                            riskLevel: '3',
                            formList: [{
                                itemId: new Date().getTime()
                            }]
                        }])
                    }
                    break;
                // 视频告警
                case '05':
                    setNodeList([{
                        eventName: '进出区域',
                        eventType: '06',
                        riskLevel: '3',
                        id: _.uniqueId(),
                        formList: [{
                            itemId: new Date().getTime()
                        }]
                    }, {
                        eventName: '越线',
                        eventType: '04',
                        riskLevel: '3',
                        id: _.uniqueId(),
                        formList: [{
                            itemId: new Date().getTime()
                        }]
                    }])
                    break;
                // 黑名单
                case '06':
                    setNodeList([{
                        eventName: '出现',
                        eventType: '27',
                        riskLevel: '3',
                        id: _.uniqueId(),
                        formList: [{
                            itemId: new Date().getTime()
                        }]
                    }])
                    break;
                // 场所布控
                case '04':
                    setNodeList([{
                        eventName: '出现',
                        eventType: '27',
                        riskLevel: '3',
                        id: _.uniqueId(),
                        formList: [{
                            itemId: new Date().getTime()
                        }]
                    }])
                    break;
                // 人车布控
                case '0101':
                    setNodeList([{
                        eventName: '出现',
                        eventType: '27',
                        riskLevel: '3',
                        id: _.uniqueId(),
                        formList: [{
                            itemId: new Date().getTime()
                        }]
                    }])
                    break
                // 智慧建模
                case '03':
                    //获取详情
                    getModelDetailAsync(basicInfo.modelId).then(res => {
                        let graphNodes = JSON.parse(res.modelJson).eventParams
                        let planFormListArr = graphNodes.filter((item: any) => item.isWarn).map((item: any) => {
                            return {
                                id: item.id || _.uniqueId(),
                                eventName: item.eventName,
                                eventId: item.eventId || '',
                                eventType: item.eventType,
                                riskLevel: item.riskLevel || '3',
                                formList: [{
                                    itemId: new Date().getTime()
                                }]
                            }
                        })
                        setNodeList(planFormListArr)
                    })
                    break;
                default:
                    break;
            }

        }
        if (planId) {
            // 编辑
            let nodeList = basicInfo.planSettingJsons.map((item: any) => {
                return {
                    eventId: item.eventId,
                    eventType: item.eventType,
                    eventName: item.eventName,
                    riskLevel: item.riskLevel || '3',
                    formList: item.planItemJsons
                }
            })
            setNodeList(nodeList)
        } else {
            // 新增
            if (basicInfo && basicInfo.monitorType) {
                main(basicInfo.monitorType)
            }
        }

    }, [basicInfo, planId])

    // 上一步
    function handlePreStep() {
        setStep && setStep('1')
    }
    // 增加预案
    function handleAdd(index: number) {
        let newDataList = JSON.parse(JSON.stringify(nodeList))

        let id = new Date().getTime()
        // 当前需要增加的预案数据
        let currentData: any = {
            isNewList: true,
            itemId: id
        }
        newDataList[index].formList.push(currentData)
        setNodeList(newDataList)

        setTimeout(() => {
            let ele = document.getElementById(`${id}`)
            ele?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'start'
            })
        }, 500)

    }
    // 删除预案
    function handleDel(index: number, idx: number) {
        //删除相关节点
        let newNodeList = JSON.parse(JSON.stringify(nodeList))
        newNodeList[index].formList.splice(idx, 1)
        setNodeList(newNodeList)
        // 删除相关form实例
        let newFormInstanceList = JSON.parse(JSON.stringify(formInstanceList))
        newFormInstanceList[index].formList.splice(idx, 1)
        formInstanceList = newFormInstanceList
    }

    // 获取表单实例组
    function handleGetFormInstance(form: FormInstance, index: number, idx: number) {
        if (formInstanceList[index]) {
            if (formInstanceList[index].formList[idx]) {
                formInstanceList[index].formList[idx] = form
            } else {
                formInstanceList[index].formList.push(form)
            }
            formInstanceList[index].formList[idx] = form
        } else {
            formInstanceList.push({ formList: [form] })
        }
    }

    // 确定
    async function handleSubmit() {
        let planSettingJsons: any = []
        for (let i = 0; i < nodeList.length; i++) {
            planSettingJsons[i] = {
                eventId: nodeList[i].eventId,
                eventType: nodeList[i].eventType,
                eventName: nodeList[i].eventName,
                riskLevel: nodeList[i].riskLevel || '3',
                planItemJsons: []
            }
            for (let j = 0; j < nodeList[i].formList.length; j++) {
                let formData = formInstanceList[i].formList[j].getFieldsValue()
                // 广播内容转换。
                if (formData.broadCastContent) {
                    formData.itcType = formData.broadCastContent.itcType
                    formData.trumpetContent = formData.broadCastContent.trumpetContent
                }
                // 起始时间转换
                if (formData.time) {
                    formData.beginTime = dayjs(formData.time[0]).format(YMDHms)
                    formData.endTime = dayjs(formData.time[1]).format(YMDHms)
                }
                // 区域需要格式化一下 
                if (formData.area) {
                    formData.placeType = formData.area?.placeType
                    formData.placeId = formData.area?.placeId
                    if (formData.area?.graph) {
                        let graph = formData.area?.graph.map((item: any) => item.graph)
                        formData.graph = graph
                    }
                }
                planSettingJsons[i].planItemJsons.push(formData)
            }
        }

        let otherInfo = JSON.stringify({
            ...basicInfo,
            planSettingJsons,
        })
        let formData = {
            ...basicInfo,
            planSettingJsons,
            otherInfo
        }
        let res: any
        if (planId) {
            // 编辑
            formData.id = planId
            res = await editPlanAsync(formData)
        } else {
            // 新增
            res = await addPlanAsync(formData)
        }
        if (res.data.code === 200) {
            onClosePopup && onClosePopup()
            message.success(res.data.msg || '操作成功')
        } else {
            message.error(res.data.msg || '操作失败')
        }
    }

    const getMap2d = useCallback(
        () => {
            return map2d
        },
        [map2d],
    )

    // 获取模型节点的eventId
    function handleGetEventId(eventId: string) {
        let list = _.cloneDeep(nodeList)
        let newList = list.map((item: any) => {
            return {
                ...item,
                isSelectedNode: item.eventId === eventId ? true : false
            }
        })
        setNodeList(newList)
    }


    return <article className={styles.wrapper}>
        <div ref={mapRef} className={styles.map}></div>
        {/* 配置面板 */}
        <div className={styles.configPane}>
            {/* 顶部的预览 */}
            <div className={styles.preview}>
                <PlanTopPreview basicInfo={basicInfo} mapObj={map2d} getModelEventId={handleGetEventId} />
            </div>
            {/* Form 配置 */}
            <div className={styles.config} id='config'>
                {
                    nodeList && nodeList.map((item: any, index: number) =>
                        <div className={item.isSelectedNode ? styles.activeItem : ''}>
                            {item.formList && item.formList.map((i: any, idx: number) =>
                                <div className={styles.itemForm} key={i.itemId} id={i.itemId}>
                                    <div className={styles.itemFormTitle} >
                                        {!i.isNewList && <div className={styles.titleLeft}>
                                            {item.riskLevel === '1' && <Image src={HighIcon} width='12px' />}
                                            {item.riskLevel === '2' && <Image src={MiddleIcon} width='12px' />}
                                            {item.riskLevel === '3' && <Image src={LowIcon} width='12px' />}
                                            <span>{item.eventName} ( {`预案${idx + 1}`} )</span>
                                        </div>}
                                        {i.isNewList && <span>{item.eventName} ( {`预案${idx + 1}`} )</span>}

                                        {!i.isNewList && <Button type="link" onClick={() => handleAdd(index)}>增加预案</Button>}
                                        {i.isNewList && <Button type="link" onClick={() => handleDel(index, idx)}>删除预案</Button>}
                                    </div>
                                    {<PlanConfigForm
                                        data={i}
                                        key={i.itemId}
                                        index={index}
                                        idx={idx}
                                        getMap2d={getMap2d}
                                        getFormInstance={handleGetFormInstance}
                                        isNewList={i.isNewList}
                                    />}
                                </div>
                            )}
                        </div>
                    )
                }
            </div>
            {/* 操作按钮 */}
            <div className={styles.bottom}>
                <Space>
                    <Button onClick={handlePreStep} type="default">上一步</Button>
                    <Button onClick={handleSubmit} type='primary'>完成</Button>
                    <Button onClick={handlePreStep} type='default'>演示</Button>
                </Space>
            </div>
        </div>
    </article >
}

export default PlanConfig