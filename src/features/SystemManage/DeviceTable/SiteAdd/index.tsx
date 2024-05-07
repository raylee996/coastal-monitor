
import FormInterface from "hooks/integrity/FormInterface"
import { addStateListData,updateStateListData } from "server/system";
import { InputType } from "hooks/flexibility/FormPanel"
interface Props {
    id?:number
    name?:string
    type?:number
    siteCode?:string
    onSuccess?: Function
    onClosePopup?: Function
  }

const SiteAdd: React.FC<Props> = ({id,name,type,siteCode,onSuccess,onClosePopup}) => {
    console.debug('SiteAdd')
    const inputs = [
        ['站点名称', 'siteName',{ isRequired: true ,placeholder: '请输入站点名称', maxLength: 10}],
        ['站点编号', 'siteCode',{ disabled: id?true:false,isRequired: true ,placeholder: '请输入站点编号',maxLength: 10}],
        ['站点类型', 'type',InputType.radio,{ isRequired: true,dict: [{value:1,name:'固定站点'},{value:2,name:'移动站点'}] }]
    ]
    async function handleFinish(params: any){
        if(id){
            let param = {
                siteId:id,
                newSiteName:params.siteName,
                ...params
            }
            await updateStateListData(param)
        }else {
            await addStateListData(params)
        }
        onSuccess && onSuccess()
        onClosePopup && onClosePopup()
    }
    

  
    return (
      <article style={{width:500,height:200,padding:10}}>
        <FormInterface
          inputs={inputs}
          options={{
              submitText: '确认',
              isShowReset: true
          }}
          initData={{siteName:name,siteId:id,siteCode:siteCode,type:type}}
          onFinish={handleFinish}
        />
      </article>
    )
  }
  
  export default SiteAdd