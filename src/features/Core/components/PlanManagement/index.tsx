import { Button, Popconfirm, TableProps } from 'antd'
import { PaginationProps } from 'antd/lib/pagination';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import LabelManage from 'component/LabelManage';
import popup from 'hooks/basis/Popup';
import { InputType } from 'hooks/flexibility/FormPanel';
import TableInterface from 'hooks/integrity/TableInterface'
import { useCallback, useMemo, useRef, useState } from 'react';
import { delPlanAsync, getPlanListAsync } from 'server/core/planManage';
import { getLabelTable } from 'server/label';
import { selectValue, setSituationalAnalysis } from 'slice/coreMapSlice';
import styles from './index.module.sass'
import PlanAdd from './PlanAdd';
import { useEffect } from 'react'
import { getDictDataByType } from 'server/system';
import { createPlanManagementMap } from 'helper/map/planManagement';
import WarnMapInfo from '../WarnMapInfo';
import PlanManagementPopup from '../SituationalAnalysis/components/PlanManagementPopup';
import SvgPic from 'component/SvgaPic'


const paginationProps: PaginationProps = {
    showQuickJumper: true,
    showTotal: (total: number) => {
        return `共 ${total} 条`
    }
}

const tableProps: TableProps<any> = {
    size: 'small',
    rowSelection: {
        type: 'checkbox',
        preserveSelectedRowKeys: true
    }
}

interface Props {
    /** 关闭弹窗 */
    onClosePopup?: Function
}


const shipLatLng = [22.465215, 113.922815]

const latLngList = [{
    latLng: [22.473144, 113.912172],
    cameraScope: 100,
    typeId: ['1', '2', '3']
}, {
    latLng: [22.481709, 113.922643],
    cameraScope: 100,
    typeId: ['1', '2', '3']
}, {
    latLng: [22.484565, 113.938779],
    cameraScope: 100,
    typeId: ['1', '2', '3']
}]

const historyLatLngList: [number, number][] = [
    [22.433482, 113.893976],
    [22.442922, 113.915863],
    [22.454663, 113.924875],
    [22.460453, 113.927021]
]

const planDestinationSvga = require('images/core/planManagement/plan_destination.svga')


const PlanManagement: React.FC<Props> = ({ onClosePopup }) => {
    console.debug('PlanManagement')

    const tableRef = useRef<any>();
    const dispatch = useAppDispatch()

    const { map2d } = useAppSelector(selectValue)

    const [showMapTest, setShowMapTest] = useState<boolean>(false)

    useEffect(() => {
        dispatch(setSituationalAnalysis(false))
        return () => {
            dispatch(setSituationalAnalysis(true))
        }
    }, [dispatch])

    // 预警目标自动研判
    const handleOpenTest = useCallback(() => {
        setShowMapTest(true)
        onClosePopup && onClosePopup()
        // windowUI(<ContingencyPlanShow />, { title: '预警目标自动研判', key: 'ContingencyPlanShow', width: 400, height: 730, offset: [undefined, 145, 60] })
    }, [onClosePopup])

    // 表头
    const columns = useMemo(() => [
        ['预案名称', 'name'],
        ['预案类型', 'planTypeName'],
        ['业务功能', 'monitorTypeName'],
        ['业务详情', 'modelName'],
        ['目的', 'purpose'],
        ['指挥长', 'commanderName'],
        ['副指挥长', 'deputyCommanderName'],
        ['操作人', 'createByName'],
        ['操作时间', 'createTime'],
        ['操作', '', {
            itemProps: {
                width: '120px',
                render: (text: any, record: any) => {
                    return (
                        <>
                            <Button type={"link"} onClick={handleOpenTest}>演示</Button>
                            <Button type={"link"} onClick={() => handleOpenPlanEdit(record)}>编辑</Button>
                            <Popconfirm title="确定要删除吗?" onConfirm={() => {
                                delPlanList(record.id)
                            }}>
                                <Button type={"link"}>删除</Button>
                            </Popconfirm>
                        </>
                    )
                }
            }
        }],
    ], [handleOpenTest])

    // 搜索条件
    const inputs = useMemo(() => [
        ['预案名称', 'name', { placeholder: '请输入预案名称' }],
        ['预案类型', 'planTypeId', InputType.selectRemote, {
            request: async () => {
                let vo = await getLabelTable({ type: 12 })
                return vo.data.map((item: any) => {
                    return {
                        name: item.labelName,
                        value: item.id
                    }
                })
            },
            placeholder: '请选择预案类型',
            style: {
                width: '160px'
            }
        }],
        ['业务功能', 'monitorType', InputType.selectRemote, {
            request: () => getDictDataByType("monitor_type"),
            placeholder: '请选择业务功能',
            style: {
                width: '160px'
            }
        }]
    ], [])

    const toolsHeader = useMemo(() => [<>
        <Button type={"primary"} onClick={showCaseManage} className={styles.toolsBtn}>预案类型</Button>
        <Button type={"default"} onClick={handleOpenPlanAdd}>新增预案</Button>
    </>], [])

    // 放入页面调试演示效果，等待后端接口实现后对接
    useEffect(() => {
        if (!showMapTest || !map2d) return
        const layer = createPlanManagementMap(
            shipLatLng,
            latLngList,
            (data: any) => {
                const { index } = data || {}
                return <SvgPic pic={planDestinationSvga} svagid={`planDestinationSvga${index}`} option={{ height: '72px', width: '72px', borderRadius: '30px' }} />
            },
            (data: any) => {
                const { index } = data || {}
                return <PlanManagementPopup data={{ index }} />
            },
            <WarnMapInfo text={'粤蛇渔运8888'} textColor={'#fff'} isNotOpenWindow={true} />,
            <WarnMapInfo text={'超速'} textColor={'#fff'} themeColor={'#ffa940'} customIcon={<span className={`iconfont icon-lingdang`} style={{ color: '#ffa940' }}></span>} isNotOpenWindow={true} />,
            undefined,
            map2d,
            historyLatLngList
        )

        return () => {
            layer?.then(func => {
                func && func()
            })
        }
    }, [map2d, onClosePopup, showMapTest])

    /*新增预案*/
    function handleOpenPlanAdd() {
        popup(<PlanAdd />, {
            title: '新增预案',
            size: "fullscreen",
            onCloseCallback: () => {
                tableRef.current.onRefresh()
            }
        })
    }

    /*编辑预案*/
    function handleOpenPlanEdit(record: any) {
        let planData = record?.otherInfo
        popup(<PlanAdd planData={planData} planId={record.id} />, {
            title: '编辑预案',
            size: "fullscreen",
            onCloseCallback: () => {
                tableRef.current.onRefresh()
            }
        })
    }

    //删除预案
    async function delPlanList(id: any) {
        await delPlanAsync(id)
        tableRef.current.onRefresh()
    }

    //预案管理
    function showCaseManage() {
        popup(<LabelManage type={12} hasSystem={false} typeName='预案类型' />, { title: '预案管理', size: 'middle' })
    }


    return <div className={styles.wrapper}>
        <TableInterface
            ref={tableRef}
            queryInputs={inputs}
            request={getPlanListAsync}
            columns={columns}
            paginationProps={paginationProps}
            tableProps={tableProps}
            toolsHeader={toolsHeader}
        />
    </div>
}

export default PlanManagement