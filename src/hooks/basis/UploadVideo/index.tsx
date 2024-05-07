import { PlusOutlined } from "@ant-design/icons";
import { message, Modal, Upload, UploadFile } from "antd"
import { UploadProps } from "antd/lib/upload";
import { UseType } from "hooks/flexibility/FormPanel";
import { useCallback, useEffect, useState } from "react";

interface UploadResult {
  path: string
  url?: string
  name?: string
}

interface Props {
  /** 组件被使用状态 */
  useType?: UseType,
  /** 可上传视频格式 */
  videoType?: string[]
  /** 可上传视频大小上限 单位：MB */
  videoMaxSize?: number
  /** 上传数量限制 */
  maxCount?: number
  /** 是否显示备注信息 */
  showMessage?: boolean
  /**上传视频的函数*/
  uploadVideoFn: (file: UploadFile) => Promise<UploadResult>
  /** 视频回显列表 */
  value?: any[],
  /** onChange事件 */
  onChange?: Function,
}

const UploadVideo: React.FC<Props> = ({
  useType = UseType.edit,
  videoType = ['video/mp4', 'video/avi', 'video/rmvb',],
  videoMaxSize = 2000,
  maxCount = 1,
  showMessage,
  uploadVideoFn,
  value: videoList,
  onChange,
}) => {
  console.debug('UploadVideo')

  // 预览相关
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVideo, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  //上传组件中的列表
  const [fileList, setFileList] = useState<any>(() => {
    return videoList?.map((item: any) => {
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
  });
  //传给后端的path列表
  const [pathList, setPathList] = useState<any>([]);

  //初始化视频回显
  const initFileList = useCallback(
    () => {
      let fileList = videoList?.map((item: any) => {
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
      setPathList(videoList || [])
    },
    [videoList],
  );

  // 视频回显
  useEffect(() => {
    initFileList()
  }, [initFileList]);


  //关闭预览
  function handleCancel() {
    setPreviewOpen(false);
  }

  //预览
  async function handlePreview(file: UploadFile) {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  }

  /** 删除视频 */
  function handleRemove(file: any) {
    let newPathList = pathList.filter((item: any) => {
      return item.id !== file.uid
    })
    setPathList(newPathList)
    onChange && onChange(newPathList)

    //删除视频
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    return false
  }

  /** 添加视频 */
  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList, file }) => {
    // 显示文件上传中
    setFileList((val: any) => {
      return [
        ...val,
        {
          url: '',
          status: 'uploading',
          name: ''
        }
      ]
    })
    try {
      let data: any = await uploadVideoFn(file);
      const result = { path: data.path.url, imgName: data.path.name, name: file.name, id: new Date().getTime() }
      console.log(fileList, pathList, "fileList, pathList")

      setPathList((e: any) => {
        return [...e, result]
      })
      setFileList(newFileList);

      onChange && onChange([...pathList, result])
    } catch (err) {
      message.error('视频上传失败')
      console.error(err)
      // 上传失败，最后一个去除
      setFileList((val: any) => {
        val.splice(val.length - 1, 1)
        return [
          ...val
        ]
      })
    }
    // let data = await uploadImgFn(file);
    // let data = await uploadAttachImgAsync(file)

  }

  //beforeUpload 返回false,自定义上传
  function handleBeforeUpload(file: any) {
    // 格式检查
    if (!videoType.includes(file.type)) {
      message.error(`只允许上传 ${getVideoTypeName(videoType, '，')} 格式的文件!`);
      return Upload.LIST_IGNORE
    }
    // 大小检查
    const isLt2M = file.size / 1024 / 1024 > videoMaxSize;
    if (isLt2M) {
      message.error(`文件不得大于${videoMaxSize}MB!`);
      return Upload.LIST_IGNORE
    }
    return false;
  }

  const getVideoTypeName = (arr: string[], join: string) => {
    return arr.map(item => item.substring(6)).join(join)
  }

  return (
    <>
      <Upload
        // style={{ width: '64px!important', height: '64px!important' }}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        maxCount={maxCount}
        showUploadList={{ showRemoveIcon: useType === UseType.edit }}
      >
        {fileList.length >= maxCount || useType === UseType.show ? null : //上传按钮组件
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传视频</div>
          </div>
        }
      </Upload>
      {showMessage && <div className="hooks__Upload">{`备注：支持的视频格式${getVideoTypeName(videoType, '、')}，最大支持${videoMaxSize}MB`}</div>}
      <Modal title={previewTitle} footer={null} onCancel={handleCancel} visible={previewOpen}>
        <video style={{ width: '100%' }} src={previewVideo} controls />
      </Modal>
    </>
  )
}

export default UploadVideo
