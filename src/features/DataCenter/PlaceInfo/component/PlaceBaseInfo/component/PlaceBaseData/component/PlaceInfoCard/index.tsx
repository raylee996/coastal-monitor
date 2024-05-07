
import { Button, Col, Row, Tooltip } from "antd";
import StretchBox from "component/StretchBox";
// import DataDescriptions from "features/DataCenter/components/DataDescriptions";
import PlaceDetail from "features/DataCenter/PlaceDetail";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";
import { doGetPlaceInfo } from "server/place";
import { getDictName, PlaceTypeIconDict } from "helper/dictionary";
import { getPlaceTypeIconSrc } from "helper";

interface IPlaceInfoCard {
    /**场所ID */
    placeId: any
    /**自定义样式 */
    customStyle?: any
    onFinish?: any
}
const PlaceInfoCard: React.FC<IPlaceInfoCard> = (props) => {
    const { placeId, customStyle, onFinish } = props

    const [placeDataInfo, setPlaceDataInfo] = useState<any>([])
    const [placeDetail, setPlaceDetail] = useState<any>([])

    // 获取场所详情
    const getPlaceInfoData = useCallback(() => {
        (async function () {
            const vo: any = await doGetPlaceInfo(placeId)
            setPlaceDetail(vo.data)
            setPlaceDataInfo(vo.data)
            onFinish && onFinish(vo.data)
        }())
    }, [placeId, onFinish])

    useEffect(() => {
        getPlaceInfoData()
    }, [getPlaceInfoData])



    function handleEditPlace() {
        popup(<PlaceDetail type={UseType.edit} id={placeId} onSuccess={() => {
            //更新数据
            getPlaceInfoData()
            onFinish && onFinish(placeDetail)
        }} />, { title: '编辑重点场所', size: "large" })
    }
    return (
        <StretchBox
            customStyle={customStyle}
            headTitle={"场所信息"}
            hasClose={true}
            component={
                <div className={styles.boxInfo}>
                    <div className={styles.boxInfoState}>
                        <div className={`${styles.stateTxt} ${styles[`stateBg${placeDetail.level}`]}`}>
                            {placeDetail.levelName}
                        </div>
                        <div className={`${styles.addressTxt}`}>
                            {placeDetail.name}
                        </div>
                    </div>
                    {/* <DataDescriptions column={1} data={placeDataInfo} /> */}
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>场所类型：</Col>
                        <Col span={14} className={styles.detailContent}>{placeDataInfo.labelName || '--'}</Col>
                    </Row>
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>进出港识别：</Col>
                        <Col span={14} className={styles.detailContent}>{placeDataInfo.isRecognitionName || '--'}</Col>
                    </Row>
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>场所图标：</Col>
                        <Col span={14} className={styles.detailContent}>

                            {placeDataInfo.icon &&
                                <Tooltip placement="right" title={getDictName(PlaceTypeIconDict, placeDataInfo.icon)}>
                                    <img className={styles.img} alt={''} width={placeDataInfo.icon === '11' ? '94px' : '28px'} height={placeDataInfo.icon === '11' ? '22px' : '28px'} src={getPlaceTypeIconSrc(placeDataInfo.icon)} />
                                </Tooltip>
                            }

                        </Col>
                    </Row>
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>场所说明：</Col>
                        <Col span={14} className={styles.detailContent}>{placeDataInfo.comment || '--'}</Col>
                    </Row>
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>场所地区：</Col>
                        <Col span={14} className={styles.detailContent}>{placeDataInfo.areaFullName || '--'}</Col>
                    </Row>
                    <Row className={`${styles.rowTowCommon}`}>
                        <Col span={10} className={styles.borderCol}>场所来源：</Col>
                        <Col span={14} className={styles.detailContent}>{placeDataInfo.isAuto === 1 ? '手动添加' : placeDataInfo.isAuto === 2 ? "风险累计自动添加" : '--'}</Col>
                    </Row>
                    {/*  {placeDataInfo.map((item:any)=>{
                        return(
                            <>
                                <Row className={`${styles.rowTowCommon}`}>
                                    <Col span={10} className={styles.borderCol}>{item.label}：</Col>
                                    <Col span={14} className={styles.detailContent} title={item.value}>{item.value || '--'}</Col>
                                </Row>
                            </>
                        )
                    })} */}

                    <div className={styles.footer}><Button type="primary" size="small" onClick={handleEditPlace}>编辑</Button></div>
                </div>
            }
        />
    )
}

export default PlaceInfoCard
