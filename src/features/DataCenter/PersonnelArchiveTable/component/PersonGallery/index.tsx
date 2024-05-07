import { CloseOutlined, FormOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import common, { defaultImgPeople } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import { doDelPerson } from "server/personnel";
import styles from "./index.module.sass";
import "../../../dataCenter.sass"
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import PersonnelArchiveDetail from "features/DataCenter/PersonnelArchiveDetail";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";


// const { confirm } = Modal;

const PersonGallery: React.FC = (props: any) => {
  const { data, onRefresh, onFinish, index, onAction } = props


  const onChange = (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`);
  };


  let userFacePath: any = ""
  if (!common.isNull(data.facePath)) {
    userFacePath = data.facePath.split(',')
  }

  // 删除人员档案
  async function handleDelPerson(data: any) {
    popupUI(<WindowDelet title={'确定删除档案吗？'} request={doDelPerson} id={data} onSuccess={() => {
      // message.success('删除成功！')
      onRefresh && onRefresh()
      onFinish && onFinish()
      onAction && onAction()
    }} />, { title: '删除提示', size: 'auto' })
    // await doDelPerson(data)
    // onRefresh && onRefresh()
    // onFinish && onFinish()
    // onAction && onAction()
  }


  function handleFinish() {
    onRefresh && onRefresh()
  }

  return (
    <div className={`${styles.gallery} ${(index + 1) % 9 === 0 ? styles.delMarginLeft : ''}`}
      onClick={() => {
        props.onSelect(true, props.data)
      }}
    >
      <div className={styles.galleryImg}>

        <div className={styles.boxImg} >
          <ImageSimple
            alt=""
            width={'100%'}
            height={'100%'}
            src={props.data.facePath ? userFacePath[0] : defaultImgPeople}
            preview={false}
            onClick={() => {
              popup(<PersonnelArchiveInfo id={props.data.id} itemProps={props.data} />, { title: '个人档案详情', size: "fullscreen" })
            }}
          />
        </div>

        <div className={styles.imgEcheckBox} >
          <Checkbox onChange={onChange} />
        </div>

        <div className={styles.state} >
          {props.data.personTypeName}
        </div>

        <div className={styles.galleryImTool} >
          {/* 人员类型 */}

          <div className={styles.peopleType} title={props.data.name}>
            {props.data.name}
          </div>

          <div className={styles.operation} >

            <div className={styles.operBtn} title={'编辑档案'}>

              <FormOutlined

                onClick={() => {
                  popup(<PersonnelArchiveDetail id={props.data.id} type={UseType.edit} onFinish={handleFinish} />, { title: '编辑个人档案', size: "fullscreen" })
                }}
              />
            </div>

            <div className={styles.operBtn} title={'删除档案'}>
              <CloseOutlined
                style={{ fontSize: '16px' }}
                onClick={() => handleDelPerson(props.data.id)}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonGallery