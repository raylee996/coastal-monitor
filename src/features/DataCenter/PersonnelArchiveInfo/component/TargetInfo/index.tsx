import WisdomJudgment from "features/Core/components/WisdomJudgment";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { useEffect, useState } from "react";
import { doGetPersonInfo } from "server/personnel";
import styles from "./index.module.sass";
import { defaultImgPeople } from "helper/common";


interface ITargetInfo {
    /** id */
    id: any
    valise?: any
}

const TargetInfo: React.FC<ITargetInfo> = ({ id, valise }) => {
    // label数据
    console.debug("TargetInfo")
    const [targetData, setTargetData] = useState<any>([])
    const [data, setData] = useState<any>([])

    useEffect(() => {
        async function main() {
            const vo = await doGetPersonInfo({ id })
            setTargetData(vo)
            setData([
                { label: "", value: vo.name, isRow: true },
                // { label: 'IMSI', value: vo.imsi },
                { label: '车牌', value: vo.licensePlate },
                { label: "船名", value: vo.shipCnName },
                { label: '', value: <div className={styles.btnJudgment} onClick={() => handleClick(vo)} title="研判">研判{'>'}</div>, isRow: true, isComponent: true },
            ])
        }
        main()
    }, [id])

    // 人员研判
    function handleClick(vo: any) {
        let clueInfo = [];
        clueInfo.push({
            codeType: 0,
            codeValue: vo.faceid,
            imageUrl: vo.facePath
        })
        popup(<WisdomJudgment data={{ clueInfo, objType: 2, dataType: ['01', '02'] }} />, { title: '智能研判', size: 'fullscreen' })
    }

    return (
        <div className={styles.targetInfo}>

            <div className={styles.targetImgBox}>
                <ImageSimple
                    src={targetData.facePathList && targetData.facePathList.length !== 0 ? targetData.facePathList[0]['path'] : defaultImgPeople}
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