
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import { defaultImgPeople } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { doDelPlaceStaff, doGetPlacePersonList } from "server/place";
import PlaceStaffDetail from "./component/PlaceStaffDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";


interface IPlaceStaff {
    placeId: any
}

const PlaceStaff: React.FC<IPlaceStaff> = (props) => {
    console.debug('PlaceStaff')
    const { placeId } = props
    console.log(placeId)
    const tableRef = useRef<any>(null)

    // 涉案信息
    const caseColumns = [
        // ['序号', 'id'],
        ['照片', 'facePath', ColType.image, {
            itemProps: {
                render: (text: any, record: any) => {
                    return (
                        <ImageSimple width={80} height={80} src={record.facePath} defaultSrc={defaultImgPeople} />
                    )
                }
            }
        }],
        ['姓名', 'name'],
        ['职务', 'position'],
        ['在职状态', 'statusName'],
        ['性别', 'genderName'],
        ['身份证号', 'idcard'],
        ['车牌', 'licensePlate'],
        ['户籍地区', 'censusRegion'],
        // ['户籍详址', 'censusAddress'],
        ['家庭住址', 'address'],
        ['操作时间', 'actionTime'],
        ['操作人', 'actionBy'],
        [
            ['编辑', (record: any) => {
                popup(<PlaceStaffDetail type={UseType.edit} placeId={placeId} id={record.id} peopleItem={record} onFinish={handlePlaceStaffFinish} />, { title: '编辑', size: "middle" })

            }],
            ['删除', async (record: any) => {
                popupUI(<WindowDelet title={'确定删除重点场所吗？'} request={doDelPlaceStaff} id={record.id} onSuccess={() => {
                    handlePlaceStaffFinish()
                }} />, { title: '删除提示', size: 'auto' })
                // await doDelPlaceStaff(record.id)
                // handlePlaceStaffFinish()
            }],

            ['查看档案', (record: any) => {
                // 跳转查看档案详情页
                popup(<PersonnelArchiveInfo id={record.personId} itemProps={record} />, { title: '个人档案详情', size: "fullscreen" })
                //navigate(`/shipInfo/ShipBaseInformation?id=${record.id}`, { state: { id: record.id } })
            }],
        ]
    ]

    // 表格右侧功能键区
    const toolsRight: any = [
        ['新增', {
            onClick: () => {
                popup(<PlaceStaffDetail type={UseType.add} placeId={placeId} onFinish={handlePlaceStaffFinish} />, { title: '新增', size: "middle" })
            },
            type: 'primary',
        }]
    ]


    const queryInputs = [
        ['人员',
            'searchValue',
            {
                placeholder: '请输入人员/别名/身份证号搜索',
                allowClear: true
            }
        ]
    ]

    // 工作人员添加后
    function handlePlaceStaffFinish() {
        tableRef.current.onRefresh()
    }

    return (
        <article className={styles.wrapper}>
            <TableInterface
                ref={tableRef}
                queryInputs={queryInputs}
                toolsRight={toolsRight}
                columns={caseColumns}
                request={doGetPlacePersonList}
                extraParams={{ focusPlaceId: placeId }}
            />
        </article>
    )
}

export default PlaceStaff
