
import { Button } from "antd";
import { useEffect, useState } from "react";
import PopulationBankInfo from "./components/PopulationBankInfo";
import PopulationHouseInfo from "./components/PopulationHouseInfo";
import PopulationInsuranceInfo from "./components/PopulationInsuranceInfo";
import PopulationShipInfo from "./components/PopulationShipInfo";
import PopulationVehicleInfo from "./components/PopulationVehicleInfo";
import PopulationVirtualityInfo from "./components/PopulationVirtualityInfo";
import styles from "./index.module.sass";

interface IPopulationData {
    id: any
}

const PopulationData: React.FC<IPopulationData> = (props) => {
    console.debug('PopulationData')

    // tabs切换按钮index
    const [btnActive, setbtnActive] = useState('0');// 默认
    const tabItems = [
        { label: '船舶信息', key: 'item-0' },
        { label: '社保信息', key: 'item-1' },
        { label: '银行卡信息', key: 'item-2' },
        { label: '房产信息', key: 'item-3' },
        { label: '车辆信息', key: 'item-4' },
        { label: '虚拟信息', key: 'item-5' }
    ]

    useEffect(() => {
    }, [])

    return (
        <article className={styles.wapper}>
            <div className={styles.boxTabs}>
                {
                    tabItems.map((item: any, index: any) => {
                        return (
                            <Button
                                className={styles.tabsBtn}
                                type={`${btnActive === `${index}` ? 'primary' : 'default'}`}
                                onClick={() => {
                                    setbtnActive(`${index}`)
                                }}
                            >{item.label}</Button>
                        )
                    })
                }
            </div>

            <div>
                {btnActive === "0" && <PopulationShipInfo id={props.id} />}
                {btnActive === "1" && <PopulationInsuranceInfo id={props.id} />}
                {btnActive === "2" && <PopulationBankInfo id={props.id} />}
                {btnActive === "3" && <PopulationHouseInfo id={props.id} />}
                {btnActive === "4" && <PopulationVehicleInfo id={props.id} />}
                {btnActive === "5" && <PopulationVirtualityInfo id={props.id} />}
            </div>
        </article>
    )
}

export default PopulationData
