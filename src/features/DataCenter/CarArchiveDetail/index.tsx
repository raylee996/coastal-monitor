

import LabelSelect from "component/LabelManage/components/LabelSelect";
import XcRadios from "component/XcRadios";
import { carDescTypeDict } from "helper/dictionary";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import React from "react";
import { doAddEditCar, getCarArchiveData } from "server/car";
import { doUploadFile } from "server/common";
import { getDictDataByType } from "server/system";
import styles from "./index.module.sass";



/**人员档案详情 */
interface IPersonDetail {
    type?: UseType
    id?: string
    onClosePopup?: any
    onFinish?: any
}
// 人员档案详情
const PersonnelArchiveDetail: React.FC<IPersonDetail> = (props) => {
    console.debug("PersonnelArchiveDetail")
    const { type, id, onClosePopup, onFinish } = props

    const formInputs: any = [
        [
            '车辆分类',
            'type',
            InputType.component,
            {
                component: XcRadios,
                option: { data: carDescTypeDict },
                isRow: true,
            }
        ],
        [
            '车牌号',
            'licensePlate',
            { isRequired: true }
        ],
        [
            '车牌颜色',
            'plateColor',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("archive_plate_color"),
                allowClear: true
            }
        ],
        [
            '车型',
            'carType',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("archive_car_type"),
                allowClear: true
            }
        ],
        [
            '车身颜色',
            'carColor',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("archive_car_color"),
                allowClear: true
            }
        ],
        [
            '车品牌',
            'carMake',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("archive_car_make"),
                allowClear: true
            }
        ],
        [
            '车子品牌',
            'subCarMake'
        ],

        [
            '年款',
            'carYear'
        ],        
        [
            '标签',
            'labelIds',
            InputType.component,
            {
                component: LabelSelect,
                type: 2,
                placeholder: '请输入',
                isRow: true,
            }
        ],
        ['照片', 'platePath',
            InputType.uploadImg,
            ShowType.image,
            {
                isRow: true,
                maxCount: 1,
                useType: UseType.edit,
                uploadImgFn: doUploadFile,
                displayUrl: ''
            }
        ],
    ]

    async function handleFinish(data: any) {
        console.debug('handle Finish')
        await doAddEditCar(data)
        onFinish && onFinish()
        onClosePopup && onClosePopup() // 关闭POPUP

    }

    return (
        <div className={styles.wrapper}>
            <FormInterface
                id={id}
                inputs={formInputs}
                formType={type}
                initData={{
                    type: 2
                }}
                formProps={{
                    labelCol: {
                        span: 6,
                    }
                }}
                options={{
                    submitText: '确认',
                    column: 3,
                    isShowReset: true
                }}
                getRequest={(params: any) => {

                    return getCarArchiveData(id)
                }}
                onFinish={handleFinish}
            // onFill={handleFill}
            />

        </div>
    )
}

export default PersonnelArchiveDetail