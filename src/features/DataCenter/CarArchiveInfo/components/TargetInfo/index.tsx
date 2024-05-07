import WisdomJudgment from "features/Core/components/WisdomJudgment";
import { defaultImgCar } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { useEffect, useState } from "react";
import { getCarArchiveData } from "server/car";
import styles from "./index.module.sass";

interface ITargetInfo {
    /** id */
    id: any
    valise?: any
    item?: any
}

const TargetInfo: React.FC<ITargetInfo> = (props) => {
    console.debug("TargetInfo")

    const { id, valise } = props
    const [targetData, setTargetData] = useState<any>([])
    const [data, setData] = useState<any>([])

    useEffect(() => {
        async function main() {
            const vo = await getCarArchiveData(id)
            setTargetData(vo)

            setData([
                { label: '', value: vo?.licensePlate, isRow: true },
                { label: '', value: <div className={styles.btnJudgment} onClick={() => handleClick(vo)} title="研判">研判{'>'}</div>, isRow: true },
            ])
        }
        main()
    }, [id])

    function handleClick(vo: any) {
        let clueInfo = [];
        clueInfo.push({
            codeType: 1,
            codeValue: vo?.licensePlate
        })
        popup(<WisdomJudgment data={{ clueInfo, objType: 2, dataType: ['01', '02'] }} />, { title: '智能研判', size: 'fullscreen' })
    }

    return (
        <div className={styles.targetInfo}>

            <div className={styles.targetImgBox}>
                <ImageSimple
                    src={targetData?.carImgPath ? targetData?.carImgPath : defaultImgCar}
                    width={"90%"}
                    height={'160px'}
                />
            </div>

            <div className={styles.targetInfoBox}>
                {
                    data && data.map((item: any, index: number) => {
                        return (
                            <div key={index} className={styles.txt}>
                                {
                                    item.isRow ?
                                        <div className={`${styles.txtLabel} ${styles.txtRow}`}>{item[valise.value]} </div>
                                        :
                                        <>
                                            <span className={styles.txtLabel}>{`${item[valise.name]} : `} </span>{item[valise.value]}
                                        </>
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}


// 组件属性默认值
TargetInfo.defaultProps = {
    valise: { name: 'label', value: 'value' }
}

export default TargetInfo