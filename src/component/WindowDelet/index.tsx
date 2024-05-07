
import {Button} from 'antd'
interface Props {
    id?:any
    title?:any
    request?: any
    onClosePopup?: Function
    onSuccess?: Function
}

const WindowDelet: React.FC<Props>  = ({onClosePopup,onSuccess,request,title,id}) => {
    
    async function onSubmits() {
        await request(id)
        onSuccess && onSuccess()
        onClosePopup && onClosePopup()
    }
    function Close(){
        onClosePopup && onClosePopup()
    }
    return (
      <article style={{width:310,height:100,padding:10}}>
         <p style={{color: '#a6cdff',fontSize:'18px',textAlign: 'center'}}>{title}</p>
         <div style={{textAlign: 'center'}}>
             <Button onClick={Close}>取消</Button>
             <Button type='primary' onClick={onSubmits} style={{marginLeft: '22px'}}>确定</Button>
         </div>
      </article>
    )
  }
  
  export default WindowDelet