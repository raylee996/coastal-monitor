import { UploadOutlined } from "@ant-design/icons"
import { Button, ButtonProps } from "antd"
import { ButtonGroupProps } from "antd/es/button"
import { useState } from "react"
import { uploadFaceAction } from "server/common"


interface Props {
  onSuccess?: (data: { id: number, url: string }) => void
  buttonProps?: ButtonGroupProps
}

const UploadFaceButton: React.FC<Props> = ({ onSuccess, buttonProps }) => {
  console.debug('UploadFaceButton')

  const [realButtonProps] = useState<ButtonProps>(() => {
    const _realButtonProps = {

    }
    const result = {
      ..._realButtonProps,
      ...buttonProps
    }
    return result
  })

  function handleClick() {
    const inputEle = document.createElement('input')
    inputEle.type = 'file'
    inputEle.accept = ".png, .jpg, .jpeg"
    inputEle.addEventListener('change', updateImageDisplay)
    inputEle.click()

    async function updateImageDisplay() {
      if (inputEle.files) {
        const vo = await uploadFaceAction(inputEle.files)
        onSuccess && onSuccess(vo)
      }
    }
  }

  return (
    <Button icon={<UploadOutlined />} {...realButtonProps} onClick={handleClick}>上传人脸</Button>
  )
}

export default UploadFaceButton