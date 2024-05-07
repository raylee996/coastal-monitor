import React from "react";
import { Pagination } from 'antd';

interface Props {
  changePagination:Function,
  total:number,
  pageSize?:number,
  currentPage:number
}

export const Paginational:React.FC<Props> =  ({
  changePagination,
  total,
  pageSize,
  currentPage
})=>{
  console.log('paginational')
  const handleChange = (page:number,pageSize:number) => {
    // 回调函数
    changePagination && changePagination(page,pageSize)
  }
  return (
    <div style={{width:'100%',display:"flex",justifyContent:'center', marginTop:'10px'}}>
      <Pagination
        // 传递过来的总数据
        size={"small"}
        showSizeChanger={false}
        total={total}
        // 默认第一页
        defaultCurrent={1}
        // 默认一页十条数据
        defaultPageSize={5}
        pageSize={pageSize? pageSize:10}
        // 点击翻页的事件
        onChange={handleChange}
      />
    </div>
  )
}
