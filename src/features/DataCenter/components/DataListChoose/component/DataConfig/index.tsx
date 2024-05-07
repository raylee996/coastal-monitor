import { defaultImgPeople } from "helper/common"
import { personTypeDict, shipDataTypeDict } from "helper/dictionary"
import ImageSimple from "hooks/basis/ImageSimple"
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel"
import { ColType } from "hooks/flexibility/TablePanel"
import { doUploadFile } from "server/common"
import shipDefSrc from 'images/default/ship.png'

/**
 * 船舶配置
 */
// 船舶列表-列配置
export const shipColumns = [
    ['照片', 'shipImgPath', ColType.image,{
        itemProps: {
            render: (text: any, record: any) => {
              return (<>
                {<ImageSimple width={60} height={60} src={record.shipImgPath} defaultSrc={shipDefSrc} />}
              </>
              )
            }
          }
    }],
    ['英文船名', 'enName'],
    ['中文船名', 'cnName'],
    ['船型', 'shipTypeName'],
    ['MMSI', 'mmsi'],
    ['目标ID', 'targetId', {
        itemProps: {
          ellipsis: true
        }
    }],
    ['雷达批号', 'radarNumber', {
        itemProps: {
          ellipsis: true
        }
    }],
    ['船长/米', 'shipL'],
    ['船宽/米', 'shipW'],
    ['建档时间', 'createTime', {
        itemProps: {
          ellipsis: true
        }
    }],
    ['标签', 'labelNames', {
        itemProps: {
          ellipsis: true
        }
    }],
    ['船舶分类', 'focusTypeName']
]

// 船舶列表-查询条件配置
export const shipQueryInputs = [
    [
        '数据类型',
        'dataType',
        InputType.select, {
            dict: shipDataTypeDict,
            placeholder: '请选择',
            style: { width: "160px" },
            allowClear: false
        }
    ],
    ['船舶',
        'shipSearchValue',
        {
            placeholder: '请输入船名/MMSI/目标ID',
            allowClear: true,
            when: { dataType: 1 }
        }
    ],
    ['雷达批号',
        'radarSearchValue',
        {
            placeholder: '请输入雷达批号/目标ID',
            allowClear: true,
            when: { dataType: 2 }
        }
    ]
]


/**
 * 人员配置
 * 
 */
// 人员列表-列配置
export const personColumns = [
    ['人员ID', 'id'],
    ['照片', 'facePath', ColType.image,{
        itemProps: {
            render: (text: any, record: any) => {
              return (<>
                {<ImageSimple width={60} height={60} src={record.facePath} defaultSrc={defaultImgPeople} />}
              </>
              )
            }
          }
    }],
    ['姓名', 'name'],
    ['性别', 'genderName'],
    ['身份证号', 'idcard'],
    // ['IMSI', 'imsi'],
    ['手机号', 'phone'],
    ['车牌号', 'licensePlate'],
    ['人员分类', 'personTypeName']
]

// 人员列表-查询条件配置
export const personQueryInputs = [
    ['人员',
        'searchValue',
        {
            placeholder: '请输入人员信息搜索',
            allowClear: true
        }
    ],
    [
        '人员分类',
        'personType',
        InputType.select,
        {
            dict: personTypeDict,
            style: { width: '180px' }
        }
    ],
    [
        '照片',
        'imgPath',
        InputType.uploadImg,
        ShowType.image,
        {
            isRow: true,
            maxCount: 2,
            useType: UseType.edit,
            uploadImgFn: doUploadFile,
            displayUrl: ''
        }
    ],
]
