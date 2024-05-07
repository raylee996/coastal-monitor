import { Alert, Button, Form, Input, message } from 'antd';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { useNavigate } from 'react-router-dom';
import { getUserMenuList, userlogin } from 'server/user';
import { selectValue, setUserInfo } from 'slice/userInfoSlice';
import styles from "./index.module.sass";
import React, { useCallback, useEffect, useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { local } from 'helper/storage';
import { getLoginSrc, getLoginCA } from 'server/admin';



const Login: React.FC = () => {
  console.debug('Login')

  const dispatch = useAppDispatch()
  const navigate = useNavigate();

  const userData = useAppSelector(selectValue)

  const [form] = Form.useForm();

  const [shows, setshows] = useState('none')
  const [bgshows, setbgshows] = useState('none')
  const [version] = useState(local('VERSION'))
  const [username, setUsername] = useState('')
  const [keyID, setKeyId] = useState('')
  const [contlist, setContlist] = useState()
  const [isTakes, setIsTakes] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setshows('block')
    }, 500)

    setTimeout(() => {
      setbgshows('block')
    }, 700)
  }, [userData, navigate])

  const handleGet = useCallback(() => {
    let consts: any = ''
    $QCA.EnumDev((res: any) => {
      let keys = res.split('|');
      if (keys.length > 0) {
        let str1 = keys[0].split(':');
        consts = str1[2];
        setContlist(str1[2])
      }
      if (keys.length - 1 === 0) {
        setIsTakes(true)
      }
      for (let i = 0; i < keys.length - 1; i++) {
        getCertInfo(keys[i], (e: any) => {
          let user: any = e[0]
          form.setFieldValue('username', user)
          setUsername(user)
          setKeyId(e[1])
        });
      }
    }, (err: any) => {
      message.warning("请检查是否安装驱动！");
    });
    function getCertInfo(keyID: any, callback: { (e: any): void; (arg0: any[]): void; }) {
      $QCA.ConnectDev(keyID, (res: any) => {
        if (consts === "") {
          return;
        }
        $QCA.getCertificateCN(consts, (res: any) => {
          let result = [];
          result.push(res);
          result.push(keyID);
          callback(result);
        }, (err: any) => {

        });
      }, (err: any) => {

      });
    }
  }, [form])

  /*  const handelCAData = useCallback(() => {
 
     let szcaPki = new SzcaPki()
     szcaPki.getApplyId((applydata: any) => {
       if (applydata.code === 0) {
         szcaPki.keyDevice(applydata.data.applyID, (data: any) => {
           if (data.code === 0) {
             if (data.data.keys != null) {
               var keys = data.data.keys;
               for (var i = 0; i < keys.length; i++) {
                 getCertInfo(keys[i], (e: any) => {
                   //certList.add(new Option(e[0], e[1]));
                   let user: any = e[0]
                   form.setFieldValue('username', user)
                   setUsername(user)
                   // setUsername('张三_360782111111111111')
                   setKeyId(e[1])
                   // setKeyId('1688636246:596A064A332A')
                 });
               }
             }
           }
         })
       } else {
         console.log("初始化应用失败")
       }
     })
     function getCertInfo(keyID: string, callback: { (e: any): void; (arg0: any[]): void; }) {
       szcaPki.getCertificateNumber(keyID, (data: any) => {
         if (data.code === 0) {
           szcaPki.analyticalCertificate(data.data.certs[0], "", (cerdata: any) => {
             var dn = cerdata.data.subject.toString();
             dn = dn.substring(3, dn.indexOf(","));
             console.log("keyID:" + keyID);
             var result = [];
             result.push(dn);
             result.push(keyID);
             callback(result);
           })
         }
       })
     }
   }, [form]) */

  useEffect(() => {
    function main() {
      handleGet()
    }
    main()
  }, [handleGet])
  useEffect(() => {
    if (isTakes) {
      setTimeout(() => {
        setIsTakes(false)
      }, 2000)
    }
  }, [isTakes])
  async function handelSub() {
    let formData = await form.validateFields()
    let pramas = {
      password: formData.password,
      username: formData.username,
      account: formData.username,
    }
    const vo = await userlogin(pramas)
    const menuList = await getUserMenuList(vo.access_token)

    dispatch(setUserInfo({ token: vo.access_token, name: formData.username, menuList }))

    navigate('/', { replace: true })
  }

  const handelCAbutton = useCallback(async () => {
    let formData = await form.validateFields()
    if (!formData.username) {
      handleGet()
      return
    }
    // let szcaPki = new SzcaPki()

    if (username) {

      /* szcaPki.login(keyID, formData.password, async (data: any) => { //第一步，验证uKey密码
        console.log(data)
        if (data.code === 0) {
          szcaPki.getCertificateNumber(keyID, (signdata: any) => {
            if (signdata.code === 0 && signdata.data != null) {
              szcaPki.analyticalCertificate(signdata.data.certs[0], "", (cerdata: any) => { //第二步，获取证书信息 
                // var dn = cerdata.data.subject;
                // document.getElementById('dnCert').value = dn.substring(3,dn.indexOf(",")); 
                szcaPki.setCurrentAlgorithm(keyID, cerdata.data.algoType, async (typedata: any) => {//第三步，设置算法
                  if (typedata.code === 0) {
                    let srcData = await getLoginSrc(username)
                    let srcDatas = JSON.parse(srcData)
                    let baseData = Base64.encode(srcDatas.srcDate)
                    //第四步，对随机数签名,注：srcData为随机数，由后台生成，建议以ip+当前时间+random随机数生成，安全级别高
                    szcaPki.getP7(keyID, baseData, false, async (p1data: any) => {
                      if (p1data.code === 0 && p1data.data !== null) {
                        // document.getElementById('p7signData').value = p1data.data.signature;
                        //第五步，提交后台验证
                        // alert("将签名结果p7signData、登录人dnCert传入后台验证，后台验证成功后登录");
                        let param = {
                          "dnCert": formData.username,
                          "password": formData.password,
                          "signData": p1data.data.signature,
                          "username": formData.username
                        }
                        const vo = await getLoginCA(param)
                        const menuList = await getUserMenuList(vo.access_token)
                        dispatch(setUserInfo({ token: vo.access_token, name: formData.username, menuList }))
                        navigate('/', { replace: true })
                      } else {

                      }
                    })
                  } else {

                  }
                })
              })
            } else {
              message.warning('请检查是否插入设备！')
            }
          })
        } else {
          message.warning('请输入密码或密码错误！')
        }
      }) */

      $QCA.ConnectDev(keyID, (res: any) => {
        $QCA.Login(contlist, formData.password, async (res: any) => {
          let srcData = await getLoginSrc(username)
          let srcDatas = JSON.parse(srcData)
          let baseData = Base64.encode(srcDatas.srcDate)
          if (!baseData) {
            message.warning("签名原文为空");
            return;
          }
          $QCA.signMessage(contlist, 0, baseData, async (res: any) => {
            let param = {
              "dnCert": formData.username,
              "password": formData.password,
              "signData": res,
              "username": formData.username
            }
            const vo = await getLoginCA(param)
            const menuList = await getUserMenuList(vo.access_token)
            dispatch(setUserInfo({ token: vo.access_token, name: formData.username, menuList }))

            navigate('/', { replace: true })
          }, function (err: any) {
            var txt = 'code=' + err.ErrorCode + ',msg=' + err.ErrorMsg;
            message.warning(txt);
          });
        }, function (err: any) {
          message.warning('请输入密码或密码错误！')
        });
      }, function (err: any) {
        message.warning('请检查是否插入设备！')
      });
    } else {
      message.warning('当前账号不是CA认证的账号！')
    }
  }, [form, handleGet, username, keyID, contlist, dispatch, navigate])

  const handelDown = useCallback(async () => {
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = require('../../images/control.exe')
    a.setAttribute('download', 'CA登录软件驱动.exe')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  return (
    <article className={styles.wrapper}>

      <video src={require('../../images/login/bg.mp4')} autoPlay loop muted className={styles.bgVideo} />

      <img src={require('../../images/login/title.png')} alt='' className={styles.titles} />

      <section className={styles.bgcount}>
        <img style={{ display: shows }} alt='' src={require('../../images/login/left.png')} className={styles.lefts} />
        <img style={{ display: shows }} alt='' src={require('../../images/login/right.png')} className={styles.rights} />
        <div style={{ display: bgshows }} className={styles.bgimage}></div>
        <Form
          onFinish={handelSub}
          className={styles.form}
          form={form}
        >
          <Form.Item name='username' className={styles.formItem}>
            <Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='用户' />
          </Form.Item>
          <Form.Item name='password' className={styles.formItem}>
            <Input prefix={<LockOutlined className='site-form-item-icon' />} type="password" placeholder='密码' />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center', marginBottom: '0px' }}>
            <Button className={styles.submit} htmlType="submit">
              <img src={require('../../images/login/sub.png')} alt='' />
            </Button>
            <Button className={styles.submits} htmlType="button" onClick={handelCAbutton}>
              <img src={require('../../images/login/ca.png')} alt='' />
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Button className={styles.submits} htmlType="button" type='text' onClick={handelDown}>
              CA登录驱动下载
            </Button>
          </Form.Item>
        </Form>
      </section>

      <section className={styles.version}>{version}</section>
      {isTakes &&
        <div className={styles.alerts}>
          <Alert
            message="请检查是否插入设备！"
            type="warning"
            showIcon
            onClose={() => setIsTakes(false)}
            closable
          />
        </div>
      }

    </article>
  );
}

export default Login;