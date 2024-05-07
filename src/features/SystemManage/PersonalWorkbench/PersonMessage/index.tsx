import { Button } from "antd"
import styles from './index.module.sass'
// import popup from "hooks/basis/Popup";
// import popupmini from "component/PopupMini";
import UpdateImage from "./UpdateImage";
import UpdatePwd from "./UpdatePwd";
import BaseMessage from "./BaseMessage";
import { personUserProfile } from "server/system"
import React, { useState, useEffect } from 'react';
import { defaultImgPeople } from "helper/common";
import popupUI from "component/PopupUI";

const PersonMessage: React.FC = () => {
  console.debug('PersonMessage')
  const [Avatar, setAvatar] = useState('')
  const [users, setUsers] = useState('')
  function showUPdateImage() {
    popupUI(<UpdateImage onSuccess={() => { getPerson() }} />, { title: '修改头像', size: 'auto' })
  }
  function showUpPwd() {
    popupUI(<UpdatePwd />, { title: '修改密码', size: 'auto' })
  }
  function showBasemessage() {
    popupUI(<BaseMessage />, { title: '基本信息', size: 'auto' })
  }
  useEffect(() => {
    async function main() {
      getPerson()
    }
    main()
  }, [])
  async function getPerson() {
    const vo = await personUserProfile()
    setAvatar(vo.avatar)
    setUsers(vo.name)
  }
  return (
    <article >
      <section>
        <div className={styles.contents}>
          <img src={Avatar ? Avatar : defaultImgPeople} className={styles.imags} alt='' />
          <div className={styles.showImage} onClick={showUPdateImage}>修改头像</div>
        </div>
        <div style={{ textAlign: 'center', color: '#a6cdff', fontSize: '18px' }}>
          <p>{users}</p>
          <p>
            <Button type={"primary"} onClick={showUpPwd}>修改密码</Button>
          </p>
          <p>
            <Button type={"primary"} onClick={showBasemessage}>基本信息</Button>
          </p>
        </div>

      </section>
    </article>
  )
}

export default PersonMessage