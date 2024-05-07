import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { defaultImgCar } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import { doDelCar } from "server/car";
import styles from "./index.module.sass";
import "../../../dataCenter.sass"
import CarArchiveDetail from "features/DataCenter/CarArchiveDetail";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
import { CloseOutlined, FormOutlined } from "@ant-design/icons";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";


// const { confirm } = Modal;


const VoitureGallery: React.FC = (props: any) => {
  const { onRefresh, index } = props

  const onChange = (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`);
  };


  function handleFinish() {
    onRefresh && onRefresh()
  }

  // 删除车辆档案
  async function handleDelCar(data: any) {
    popupUI(<WindowDelet title={'确定删除档案吗？'} request={doDelCar} id={data} onSuccess={() => {
      // message.success('删除成功！')
      onRefresh && onRefresh()
    }} />, { title: '删除提示', size: 'auto' })
    // await doDelCar(data)
    // onRefresh && onRefresh()
  }

  return (
    <div className={`${styles.gallery} ${(index + 1) % 9 === 0 ? styles.delMarginLeft : ''}`}
      onClick={() => {
        props.onSelect(true, props.data)
      }}
    >
      <div className={styles.galleryImgItem}>
        <div className={styles.galleryImg}>

          <div className={styles.boxImg} >
            <ImageSimple
              alt=""
              className={styles.img}
              width={'100%'}
              height={'100%'}
              preview={false}
              src={props.data.platePath ? props.data.platePath : defaultImgCar}
              onClick={() => {
                popup(<CarArchiveInfo carId={props.data.id} carItem={props.data} />, { title: '车辆档案详情', size: "fullscreen" })
              }}
            />
          </div>

          <div className={styles.imgEcheckBox} >
            <Checkbox onChange={onChange} />
          </div>

          <div className={styles.state} >
            {props.data.typeName}
          </div>

          <div className={styles.galleryImTool} >
            {/* 车辆类型 */}
            <div className={styles.peopleType} >
              {props.data.licensePlate}
            </div>

            <div className={styles.operation} >
              <div className={styles.operBtn} title={'编辑档案'}>
                <FormOutlined
                  onClick={() => {
                    popup(<CarArchiveDetail id={props.data.id} type={UseType.edit} onFinish={handleFinish} />, { title: '编辑车辆档案', size: "middle" })
                  }}
                />
              </div>
              <div className={styles.operBtn} title={'删除档案'}>
                <CloseOutlined
                  style={{ fontSize: '16px' }}
                  onClick={() => handleDelCar(props.data.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoitureGallery