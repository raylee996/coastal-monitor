

import LabelSelect from "component/LabelManage/components/LabelSelect";
import DateSimple from "hooks/basis/DateSimple";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import React from "react";
import { doUploadFile } from "server/common";
import { getDictDataByType } from "server/system";
import { getAreaList } from "server/dataCenter/caseArchive";
import styles from "./index.module.sass";
import { doAddEditPerson, doGetPersonInfo } from "server/personnel";
import { personTypeDict } from "helper/dictionary";
import XcRadios from "component/XcRadios";


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
            '人员分类',
            'personType',
            InputType.component,
            {
                // component: ShipArchiveType,
                // data: personTypeDict,
                component: XcRadios,
                option: { data: personTypeDict },
                isRow: true
            }
        ],
        [
            '姓名',
            'name',
            {
                placeholder: '请输入',
                isRequired: true,
            }
        ],

        [
            '性别',
            'gender',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("sys_user_sex"),
                placeholder: '请选择',
                width: '180px'
            }
        ],
        [
            '民族',
            'nationCode',
            InputType.selectRemote,
            {
                request: () => getDictDataByType("sys_nation"),
                placeholder: '请选择',
                width: '180px'
            }
        ],
        [
            '籍贯',
            'nativeName',
            {
                placeholder: '请输入'
            }
        ],
        [
            '出生日期',
            'birthDay',
            InputType.component,
            {
                component: DateSimple,
                placeholder: '请输入',
                width: '180px'
            }
        ],
        [
            '身份证号',
            'idcard',
            {
                placeholder: '请输入'
            }
        ],
       /*  [
            'IMSI',
            'imsi',
            {
                placeholder: '请输入'
            }
        ],
        [
            'IMEI',
            'imei',
            {
                placeholder: '请输入'
            }
        ],
        [
            'MAC',
            'mac',
            {
                placeholder: '请输入'
            }
        ], */
        [
            '手机号',
            'phone',
            {
                placeholder: '请输入'
            }
        ],
        [
            '车牌号',
            'licensePlate',
            {
                placeholder: '请输入'
            }
        ],

        [
            '地区',
            'censusRegion',
            InputType.cascaderRemote,
            {
                remote: getAreaList,
                colNum: 2
            }
        ],
        [
            '冢庭住址',
            'address',
            {
                placeholder: '请输入',
                isRow: true
            }
        ],
        [
            '工作单位',
            'workPlate',
            {
                placeholder: '请输入',
                isRow: true
            }
        ],

        [
            '曾用名',
            'formerName',
            {
                placeholder: '请输入'
            }
        ],
        [
            '文化程度',
            'educationalLevel',
            {
                placeholder: '请输入'
            }
        ],
        [
            '职业',
            'profession',
            {
                placeholder: '请输入'
            }
        ],
        [
            '户籍类型',
            'censusType',
            {
                placeholder: '请输入'
            }
        ],
        [
            '户籍编号',
            'censusCode',
            {
                placeholder: '请输入'
            }
        ],
        [
            '户籍性质',
            'censusNature',
            {
                placeholder: '请输入'
            }
        ],
        
        [
            '与户主关系',
            'kinship',
            {
                placeholder: '请输入'
            }
        ],
        
        [
            '出生国家',
            'birthCountry',
            {
                placeholder: '请输入'
            }
        ],
        [
            '变更日期',
            'changeDate',
            InputType.component,
            {
                component: DateSimple,
                placeholder: '请输入',
                width: '180px'
            }
        ],
        [
            '出生地详址',
            'birthplace',
            {
                placeholder: '请输入'
            }
        ],
        [
            '手机品牌',
            'mobileBrand',
            {
                placeholder: '请输入'
            }
        ],
        // [
        //     '船名',
        //     '',
        //     {
        //         placeholder: '请输入'
        //     }
        // ],
        
        [
            '标签',
            'labelIds',
            InputType.component,
            {
                component: LabelSelect,
                type: 1,
                placeholder: '请输入',
                style:{width:'100%'},
                isRow: true
            }
        ],
        [
            '照片',
            'facePathList',
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
        await doAddEditPerson({ ...data, id })
        onFinish && onFinish()
        onClosePopup && onClosePopup() // 关闭POPUP
    }

    return (
        <div className={styles.wrapper}>
            <FormInterface
                id={id}
                inputs={formInputs}
                formType={type}
                formProps={{
                    labelCol: {
                        span: 6,
                    }
                }}
                initData={
                    {
                        personType: 2
                    }
                }
                options={{
                    submitText: '确认',
                    column: 3,
                    isShowReset: true
                }}
                getRequest={(params: any) => {
                    return doGetPersonInfo({ id: params, faceid: '', idCard: '' })
                }}
                onFinish={handleFinish}
            />

        </div>
    )
}

export default PersonnelArchiveDetail