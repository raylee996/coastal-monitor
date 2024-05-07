import { PlusOutlined } from "@ant-design/icons"
import { message, Upload, UploadFile, UploadProps, Image } from "antd"
import { RcFile, UploadChangeParam } from "antd/es/upload"
import { UseType } from "hooks/flexibility/FormPanel"
import { useCallback, useEffect, useMemo, useState } from "react"
import styles from "./index.module.sass";


const defaultImageTypes = ['image/png', 'image/jpg', 'image/jpeg']

interface PictureInfo extends UploadFile {
  /** 额外数据 */
  extra?: any
}

interface Props extends Omit<UploadProps, 'onChange'> {
  value?: PictureInfo[]
  onChange?: (val: PictureInfo[]) => void
  /** 使用类型，不是展示时才显示上传图标和删除图标 */
  useType?: UseType
  /** 限制上传图片类型 */
  imageTypes?: string[]
  /** 是否显示图片类型提示信息 */
  isShowImageTypesAlt?: boolean
  /** 远程图片文件上传请求 */
  onUpload?: (file: File) => Promise<PictureInfo>
}

const UploadPicture: React.FC<Props> = ({ value, isShowImageTypesAlt, imageTypes, useType, onChange, maxCount, onUpload }) => {
  console.debug('UploadPicture')


  const [fileList, setFileList] = useState<PictureInfo[]>([])
  const [isOpenPreview, setIsOpenPreview] = useState(false)
  const [previewSrc, setPreviewSrc] = useState('');


  useEffect(() => {
    if (value) {
      setFileList(value)
    }
  }, [value])


  // 校验图片格式
  const handleBeforeUpload = useCallback(
    (file: RcFile) => {
      const typeList = imageTypes ? imageTypes : defaultImageTypes
      const isImg = typeList.includes(file.type)
      if (!isImg) {
        message.error(`只允许上传${typeList.join('/')}格式的图片!`);
      }
      return isImg || Upload.LIST_IGNORE
    },
    [imageTypes],
  )

  const handleChange = useCallback(
    (info: UploadChangeParam<UploadFile>) => {
      const _fileList = info.fileList.map(item => {
        if (!item.url && item.response) {
          item.url = item.response.url
        }
        return item
      })
      onChange && onChange(_fileList)
    },
    [onChange],
  )

  // 预览
  const handlePreview = useCallback(
    (file: PictureInfo) => {
      file.url && setPreviewSrc(file.url)
      file.response?.url && setPreviewSrc(file.response.url)
      setIsOpenPreview(true)
    },
    [],
  )

  // 自定义上传
  const handleCustomRequest = useCallback(
    async (data: any) => {
      if (onUpload) {
        const newFile = await onUpload(data.file)
        data.onSuccess(newFile)
      } else {
        const url = URL.createObjectURL(data.file)
        const newFile = {
          url,
          name: data.file.name,
          uid: data.file.uid,
          extra: data.file
        }
        data.onSuccess(newFile)
      }
    },
    [onUpload],
  )


  const showUploadList = useMemo(() => {
    return { showRemoveIcon: useType ? useType !== UseType.show : true }
  }, [useType])

  const isShowUploadButton = useMemo(() => {
    if (maxCount) {
      return fileList.length < maxCount && useType !== UseType.show
    } else {
      return useType !== UseType.show
    }
  }, [fileList, maxCount, useType])

  const imageTypesAlt = useMemo(() => {
    let typsText = ''
    if (imageTypes) {
      typsText = imageTypes.join('、')
    } else {
      typsText = defaultImageTypes.join('、')
    }
    return `备注：支持的图片格式${typsText}`
  }, [imageTypes])

  const preview = useMemo(() => ({
    visible: isOpenPreview,
    onVisibleChange: (value: boolean) => {
      setIsOpenPreview(value)
    }
  }), [isOpenPreview])


  return (
    <>
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={showUploadList}
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        customRequest={handleCustomRequest}
      >
        {isShowUploadButton &&
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        }
      </Upload>
      {isShowImageTypesAlt && <div>{imageTypesAlt}</div>}
      <Image
        className={styles.image}
        src={previewSrc}
        preview={preview}
      />
    </>
  )
}

export default UploadPicture