import DataListChoose from "features/DataCenter/components/DataListChoose";
import common from "helper/common";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { doGetPersonList } from "server/personnel";
import { doAddEditShipSailor, doGetShipSailorDetail } from "server/ship";
import styles from "./index.module.sass";

interface IShipDetail {
    type?: UseType
    id?: string
    shipCreateTime: string
    shipId: string
    onClosePopup?: Function
    onFinish?: Function
}

const ShipArchiveDetail: React.FC<IShipDetail> = (props) => {
    console.debug('ShipArchiveDetail')
    //数据定义
    const { shipId, shipCreateTime, type, id, onClosePopup, onFinish } = props
    const formInputs: any = [
        [
            '选择人员',
            'personId',
            InputType.component,
            {
                component: DataListChoose,
                isRow: true,
                btnTxt: '选择人员',
                popTitle: '人员档案列表',
                dataType: 'person',
                rowSelectionType: "radio",
                request: doGetPersonList
            }
        ],
        // ['头像照片', 'imgPath',
        //     InputType.uploadImg,
        //     ShowType.image,
        //     {
        //         isRow: true,
        //         maxCount: 2,
        //         useType: UseType.edit,
        //         uploadImgFn: doUploadFile,
        //         displayUrl: ''
        //     }
        // ],
        ['职位', 'position', {
            placeholder: '请输入'
        }
        ],
        [
            '证书等级',
            'certificateLevel',
            {
                placeholder: '请输入'
            }
        ],
        [
            '在职状态',
            'status',
            InputType.radio,
            {
                isRow: true,
                dict: [{ name: '在职', value: 1 }, { name: '离职', value: 2 }]
            }

        ]
    ]


    async function handleFinish(data: any) {
        console.debug('handle Finish')
        const vo = await doAddEditShipSailor({ id, ...data, shipCreateTime, shipId })
        if (vo.code === 0) {
            common.showMessage({ msg: vo.msg })
        } else {
            onFinish && onFinish()
            onClosePopup && onClosePopup() // 关闭POPUP
        }

    }

    return (
        <article className={styles.addShip}>
            {
                <FormInterface
                    id={id}
                    inputs={formInputs}
                    formType={type}
                    initData={{
                        status: 1
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
                    getRequest={doGetShipSailorDetail}
                    onFinish={handleFinish}
                />
            }
        </article>
    )
}

export default ShipArchiveDetail