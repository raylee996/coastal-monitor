import React, { useEffect, useState } from "react";
import { Button, message, Popconfirm, Upload, UploadProps } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./index.module.sass";
import XcEmpty from "component/XcEmpty";

const IMAGE_FALL_BACK = "data:image/png;base64,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"

interface UploadResult {
  path: string
  url?: string
  name?: string
}

interface Props {
  /** 可上传视频格式 */
  videoType?: string[]
  /** 可上传视频大小上限 单位：MB */
  videoMaxSize?: number
  /** 上传数量限制 */
  maxCount?: number
  /** 是否显示备注信息 */
  showMessage?: boolean
  /** 上传图片的函数 */
  uploadVideoFn: (file: UploadFile) => Promise<UploadResult>
  /** 视频回显列表 */
  value?: any[],
  /**onChange事件*/
  onChange?: Function,
  /** 上传视频成功后的回调函数 */
  uploadCallback?: Function
}

const UploadVideoTable: React.FC<Props> = ({
  videoType = ['video/mp4', 'video/avi', 'video/rmvb'],
  videoMaxSize,
  maxCount = 1,
  uploadVideoFn,
  value,
  onChange,
  uploadCallback
}) => {
  console.debug('UploadVideoTable')

  //上传组件中的列表
  const [fileList, setFileList] = useState<any>(() => {
    return value?.map((item: any) => {
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

  const [videoList, setVideoList] = useState<any[]>([])
  //传给后端的path列表
  const [pathList, setPathList] = useState<any>([]);

  useEffect(() => {
    if(!value){
      setVideoList([])
      return;
    }
    value?.length && setVideoList(value.map((item, index) => {
      const timeArr = /(\d{4})\/(\d{2})\/(\d{2})/.exec(item)
      return {
        id: index,
        videoUrl: item,
        time: item && timeArr?.length ? timeArr[0] : ''
      }
    }))
  }, [value])

  /** 删除视频 */
  function handleRemove(file: any) {
    let newPathList = pathList.filter((item: any) => {
      return item.id !== file.uid
    })
    setPathList(newPathList)
    onChange && onChange(newPathList)

    // 删除视频
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    return false
  }

  /** 上传视频 */
  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList, file }) => {
    try {
      let data: any = await uploadVideoFn(file);
      const result = { path: data.path.url, videoName: data.path.name, name: file.name, id: new Date().getTime() }

      setPathList((e: any) => {
        return [...e, result]
      })
      setFileList([]);

      onChange && onChange([...pathList, result])

      uploadCallback && uploadCallback([...videoList.map(item => {
        item.path = item.videoUrl
        return item
      }), result])
    } catch (err) {
      message.error('上传视频失败')
      console.error(err)
    }
  }

  //beforeUpload 返回false,自定义上传
  function handleBeforeUpload(file: any) {
    //图片格式
    if (!videoType.includes(file.type)) {
      message.error(`只允许上传 ${getVideoTypeName(videoType, '，')} 格式的文件!`);
      return Upload.LIST_IGNORE
    }
    /* const isLt2M = file.size / 1024 / 1024 < 2;
     if (!isLt2M) {
         message.error('Image must smaller than 2MB!');
         return Upload.LIST_IGNORE
     }*/
    return false;
  }

  const getVideoTypeName = (arr: string[], join: string) => {
    return arr.map(item => item.substring(6)).join(join)
  }

  async function del(id: any) {
    let arr = videoList?.filter((item:any)=>{
      return item.id !== id
    }).map((item:any)=>{
      return{
        ...item,
        path: item.videoUrl
      }
    })
    uploadCallback && uploadCallback(arr)
  }

  return <div className={styles.wrapper}>
    <div className={styles.top}>
      <div>
        <span>视频信息</span>
        <span className={styles.msg}>{`备注：支持的视频格式${getVideoTypeName(videoType, '、')}`}</span>
      </div>
      <div>
        <Upload
          beforeUpload={handleBeforeUpload}
          onRemove={handleRemove}
          fileList={fileList}
          onChange={handleChange}
          maxCount={maxCount}
        >
          <Button type="primary" icon={<UploadOutlined />}>上传视频</Button>
        </Upload>
      </div>
    </div>
    <div className={styles.content}>
      {
        videoList?.length ? videoList.map(data => {
          return <div key={data.id} className={styles.wrapperItem}>
            <video className={styles.videoBox} muted controls poster={data?.videoUrl || IMAGE_FALL_BACK}>
              <source src={data?.videoUrl} type="video/mp4"></source>
              <source src={data?.videoUrl} type="video/webm"></source>
              <source src={data?.videoUrl} type="video/ogg"></source>
              您的浏览器不支持Video标签。
            </video>
            <div className={styles.time} title={data.time}>{data.time}</div>
            <Popconfirm title="确定要删除吗?" onConfirm={() => del(data.id)}>
              <span className={styles.button}>删除</span>
            </Popconfirm>
          </div>
        }) : <XcEmpty />
      }
    </div>
  </div>
}

export default UploadVideoTable
