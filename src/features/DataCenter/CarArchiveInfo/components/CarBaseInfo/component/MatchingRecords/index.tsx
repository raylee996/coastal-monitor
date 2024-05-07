import { Collapse } from "antd";
import { useCallback, useEffect } from "react";
import MatchingInfoTable from "../MatchingInfoTable";
import styles from "./index.module.sass";

interface IMatchingRecords {
    carId: any
    carItem?: any
}
const MatchingRecords: React.FC<IMatchingRecords> = (props) => {
    console.debug('MatchingRecords')
    const { carId, carItem } = props
    console.log(carId + carItem)

    const { Panel } = Collapse;



    const handleGetData = useCallback<any>(() => {
        async function main() {
            //   const vo: any = await getLabelTable({ type })
            //   setLabelData(vo.data)
        }
        main()
    }, [])


    useEffect(() => {
        handleGetData()
    }, [carId, handleGetData])

    const text = `
    A dog is a type of domesticated animal.
    Known for its loyalty and faithfulness,
    it can be found as a welcome guest in many households across the world.
  `;


    // 拟合信息
    const fitColumns = [
        ['日期', 'time'],
        ['拟合次数', 'fitTimes'],
        [
            [
                '轨迹详情', (record: any) => {
                    // 跳转查看档案详情页
                    //navigate(`/shipInfo/ShipBaseInformation?id=${record.id}`, { state: { id: record.id } })
                }]
        ]
    ]
    return (
        <article className={styles.wrapper}>
            <div>档案拟合IMSI：68541254135414</div>
            <Collapse defaultActiveKey={['1']} ghost>
                <Panel header="This is panel header 1" key="1">
                    <div className={styles.fitTable}>
                        <MatchingInfoTable carId={carId} columns={fitColumns} />
                    </div>
                </Panel>
                <Panel header="This is panel header 2" key="2">
                    <p>{text}</p>
                </Panel>

            </Collapse>

        </article>
    )
}

export default MatchingRecords