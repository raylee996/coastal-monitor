import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message, Upload, UploadProps,Image } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import { UseType } from "hooks/flexibility/FormPanel";
import _ from "lodash";

interface UploadResult {
  path: string
  url?: string
  name?: string
}

interface Props {
  /**图片类型：编辑图片或者展示图片*/
  useType?: UseType,
  /** 可上传图片格式 */
  imageType?: string[]
  /**图片上传数量限制*/
  maxCount?: number,
  /** 是否显示备注信息 */
  showMessage?: boolean
  /**上传图片的函数*/
  uploadImgFn: (file: UploadFile) => Promise<UploadResult>
  /**回显图片的URL*/
  displayUrl?: string,
  /**图片回显列表*/
  value?: any[],
  /**onChange事件*/
  onChange?: Function,

}

const UploadImg: React.FC<Props> = ({
  useType = UseType.edit,
  imageType = ['image/png', 'image/jpg', 'image/jpeg'],
  maxCount = 1,
  showMessage,
  uploadImgFn,
  value: imgList,
  onChange
}) => {
  console.debug('Upload')
  //预览相关
  const [isOpenPreview, setIsOpenPreview] = useState(false)
  const [previewSrc, setPreviewSrc] = useState('');
  //上传组件中的列表
  const [fileList, setFileList] = useState<any>(() => {
    if (_.isArray(imgList)) {
      return imgList?.map((item: any) => {
        if (item.name === undefined) {
          return { url: item }
        } else {
          return {
            uid: item.id,
            name: item.name,
            url: item.path,
          }
        }
      }) || []
    } else {
      return []
    }
  });
  //传给后端的path列表
  const [pathList, setPathList] = useState<any>([]);


  //初始化图片回显
  const initFileList = useCallback(
    () => {
      if (_.isArray(imgList)) {
        let fileList = imgList?.map((item: any) => {
          if (item.name === undefined) {
            return { url: item }
          } else {
            return {
              uid: item.id,
              name: item.name,
              url: item.path,
            }
          }
        }) || []
        setFileList(fileList)
        setPathList(imgList || [])
      }
    },
    [imgList],
  );

  //图片回显
  useEffect(() => {
    initFileList()
  }, [initFileList]);

  /**删除图片*/
  function handleRemove(file: any) {
    let newPathList = pathList.filter((item: any) => {
      if (item.path) {
        return item.path !== file.url
      } else {
        return item !== file.url
      }

    })
    console.log(pathList)
    setPathList(newPathList)
    onChange && onChange(newPathList)

    //删除图片
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    return false
  }

  /**新增图片*/
  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList, file }) => {
    try {
      let data: any = await uploadImgFn(file);
      let result: any = { path: data.path.url, imgName: data.path.name, name: file.name, id: new Date().getTime() }

      if (data.path.faceInfo) {
        // 返回faceId相关信息，用于图片识别
        result.faceInfo = data.path.faceInfo
      }

      console.log(fileList, pathList, "fileList, pathList")

      setPathList((e: any) => {
        return [...e, result]
      })
      setFileList(newFileList);

      onChange && onChange([...pathList, result])
    } catch (err) {
      message.error('上传图片失败')
      console.error(err)
    }
    // let data = await uploadImgFn(file);
    // let data = await uploadAttachImgAsync(file)

  }

  //beforeUpload 返回false,自定义上传
  function handleBeforeUpload(file: any) {
    //图片格式
    if (!imageType.includes(file.type)) {
      message.error('只允许上传 JPG/JPEG/PNG 格式的文件!');
      return Upload.LIST_IGNORE
    }
    /* const isLt2M = file.size / 1024 / 1024 < 2;
     if (!isLt2M) {
         message.error('Image must smaller than 2MB!');
         return Upload.LIST_IGNORE
     }*/
    return false;
  }

  const getImageTypeName = (arr: string[], join: string) => {
    return arr.map(item => item.substring(6)).join(join)
  }

  // 预览
  const handlePreview = useCallback(
    (file: any) => {
      file.url && setPreviewSrc(file.url)
      file.response?.url && setPreviewSrc(file.response.url)
      setIsOpenPreview(true)
    },
    [],
  )

  //上传按钮组件
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );
  const preview = useMemo(() => ({
    visible: isOpenPreview,
    onVisibleChange: (value: boolean) => {
      setIsOpenPreview(value)
    }
  }), [isOpenPreview])
  return <>
    <Upload
      style={{ width: '64px!important', height: '64px!important' }}
      beforeUpload={handleBeforeUpload}
      onRemove={handleRemove}
      listType="picture-card"
      fileList={fileList}
      onPreview={handlePreview}
      onChange={handleChange}
      maxCount={maxCount}
      showUploadList={{ showRemoveIcon: useType === UseType.edit }}
    >
      {fileList.length >= maxCount || useType === UseType.show ? null : uploadButton}
    </Upload>
    {showMessage && <div className="hooks__Upload">{`备注：支持的图片格式${getImageTypeName(imageType, '、')}`}</div>}
    <Image
        style={{display:'none',width:'100px'}}
        src={previewSrc}
        preview={preview}
      />
  </>
}

export default UploadImg
