import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import {personUserProfile,putPersonUserProfile} from "server/system"
import React, {useState,useEffect} from 'react';

interface Props {
  onClosePopup?: Function
}
const inputs = [
  ['账号', 'userName',{ disabled: true}],
  ['姓名', 'name',{placeholder:'请输入姓名'}],
  ['性别', 'sex', InputType.radio, 
    { dict: [
        { value: "1", name: "男" },
        { value: "2", name: "女" },
    ] }
  ],
  ['身份证', 'idCard',{placeholder:'请输入身份证'}],
  ['手机号', 'phonenumber',{ isRequired: true ,placeholder:'请输入手机号'}],
  ['邮箱', 'email',{placeholder:'请输入邮箱'}],
  ['所属部门', 'deptName',{ disabled: true}]
]
const BaseMessage: React.FC<Props> = ({onClosePopup}) => {
    console.debug('BaseMessage')
    const [initBase,setInitBase] = useState()
    async function handleFinish(params:any){
      // console.log(params)
      await putPersonUserProfile(params)
      onClosePopup && onClosePopup()
    }
    useEffect(()=>{
      async function main(){
        const vo= await personUserProfile()
        vo['deptName'] = vo.dept.deptName
        setInitBase(vo)
      }
      main()
    },[])
  
    return (
      <article style={{width:500,height:320,padding:10}}>
        <FormInterface
          inputs={inputs}
          initData={initBase}
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
  
  export default BaseMessage