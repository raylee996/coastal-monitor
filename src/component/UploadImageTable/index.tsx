import React, { useEffect, useState } from "react";
import { Button, message, Popconfirm, Upload, UploadProps } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import ImageSimple from "hooks/basis/ImageSimple";
import styles from "./index.module.sass";
import './index.sass';
import XcEmpty from "component/XcEmpty";

interface UploadResult {
  path: string
  url?: string
  name?: string
}

interface Props {
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
  /** 上传图片成功后的回调函数 */
  uploadCallback?: Function
}

const UploadImageTable: React.FC<Props> = ({
  imageType = ['image/png', 'image/jpg', 'image/jpeg'],
  maxCount = 1,
  uploadImgFn,
  value,
  onChange,
  uploadCallback
}) => {
  console.debug('UploadImageTable')

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

  const [imageList, setImageList] = useState<any[]>([])
  //传给后端的path列表
  const [pathList, setPathList] = useState<any[]>([]);

  useEffect(() => {
    if(!value){
      setImageList([])
      return;
    }
    value?.length && setImageList(value.map((item, index) => {
      const timeArr = /(\d{4})\/(\d{2})\/(\d{2})/.exec(item)
      return {
        id: index,
        picUrl: item,
        time: item && timeArr?.length ? timeArr[0] : ''
      }
    }))
  }, [value])

  /**删除图片*/
  function handleRemove(file: any) {
    let newPathList = pathList.filter((item: any) => {
      return item.id !== file.uid
    })
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
      const result = { path: data.path.url, imgName: data.path.name, name: file.name, id: new Date().getTime() }
      console.log(fileList, pathList, "fileList, pathList")

      setPathList((e: any) => {
        return [...e, result]
      })
      setFileList([]);
      onChange && onChange([...pathList, result])
      uploadCallback && uploadCallback([...imageList.map(item => {
        item.path = item.picUrl
        return item
      }), result])
    } catch (err) {
      message.error('上传图片失败')
      console.error(err)
    }
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

  async function del(id: any) {
    let arr = imageList?.filter((item:any)=>{
      return item.id !== id
    }).map((item:any)=>{
      return{
        ...item,
        path: item.picUrl
      }
    })
    uploadCallback && uploadCallback(arr)
  }

  return <div className={styles.wrapper}>
    <div className={styles.top}>
      <div>
        <span>图片信息</span>
        <span className={styles.msg}>{`备注：支持的图片格式${getImageTypeName(imageType, '、')}`}</span>
      </div>
      <div>
        <Upload
          beforeUpload={handleBeforeUpload}
          onRemove={handleRemove}
          fileList={fileList}
          onChange={handleChange}
          maxCount={maxCount}
        >
          <Button type="primary" icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
      </div>
    </div>
    <div className={styles.content}>
      {
        imageList?.length ? imageList.map(data => {
          return <div key={data.id} className={`${styles.wrapperItem} UploadImageTable__image_style`}>
            <ImageSimple className={styles.image} src={data.picUrl} width={160} height={120} />
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

export default UploadImageTable