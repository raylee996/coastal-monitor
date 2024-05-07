import { InputType ,ShowType, UseType} from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { doUploadFileAvatar } from "server/common";
interface Props {
  onClosePopup?: Function
  onSuccess?: Function
}

const UpdateImage: React.FC<Props>  = ({onClosePopup,onSuccess}) => {
    console.debug('UpdateImage')
   
    const inputs = [
      ['照片', 'path',
          InputType.uploadImg,
          ShowType.image,
          {
              isRow: true,
              maxCount: 1,
              useType: UseType.edit,
              uploadImgFn: doUploadFileAvatar,
              displayUrl: ''
          }
      ]
    ]
    async function handleFinish(params:any){
      onSuccess&&onSuccess()
      onClosePopup && onClosePopup()
    }
    
    return (
      <article style={{width:500,height:250,padding:10}}>
         <p style={{color: '#a6cdff',fontSize:'14px',marginLeft:'10px'}}>选择本地照片上传：支持bmp、png、jpg、jpeg格式</p>
         <FormInterface
            inputs={inputs}
            options={{
              submitText: '确认',
              
              isShowReset: true
            }}
            onFinish={handleFinish}
          />
      </article>
    )
  }
  
  export default UpdateImage