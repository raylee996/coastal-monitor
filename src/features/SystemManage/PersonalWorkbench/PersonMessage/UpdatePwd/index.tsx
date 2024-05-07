import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { message } from "antd"
import {updatePwds} from 'server/system'

interface Props {
  onClosePopup?: Function
}

const inputs = [
  ['原密码', 'oldPassword',InputType.password, { isRequired: true,placeholder: '请输入原密码', }],
  ['新密码', 'newpwd',InputType.password, { isRequired: true ,placeholder: '请输入新密码',} ],
  ['确认密码', 'newPassword', InputType.password, 
    { 
      isRequired: true,
      placeholder: '请输入新密码',
    }
  ],
]

const UpdatePwd: React.FC<Props> = ({onClosePopup}) => {
    console.debug('UpdatePwd')
    async function handleFinish(params:any){
      if(params.newpwd!==params.newPassword){
        message.warning("请输入相同的新密码")
        return
      }
      await updatePwds(params)
      onClosePopup && onClosePopup()
    }
    
  
    return (
      <article style={{width:500,height:170,padding:10}}>
        <FormInterface
          inputs={inputs}
          options={{
              submitText: '确认',
              
              isShowReset: true
          }}
          formProps={{
            labelCol: {
              span: 3,
            }
          }}
          onFinish={handleFinish}
        />
      </article>
    )
  }
  
  export default UpdatePwd