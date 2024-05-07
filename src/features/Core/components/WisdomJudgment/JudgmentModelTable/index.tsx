import React, {useRef} from "react";
import TableInterface from "hooks/integrity/TableInterface";
import styles from './index.module.sass'
import {Button, message, Popconfirm} from "antd";
import popup from "hooks/basis/Popup";
import JudgmentModelAdd from "../JudgmentModelAdd";
import {analyzeModelDelAsync, getAnalyzeModelListPages} from "../../../../../server/core/wisdomJudgment";


const JudgmentModelTable:React.FC = ()=>{
  const tableRef = useRef<any>(null)
  const columns = [
    ['模型名称', 'modelName'],
    ['研判对象', 'modelTypeName'],
    ['操作', '',{
      itemProps: {
        width:'160px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={()=>openModelAdd(record)}>编辑</Button>
              <Popconfirm title="确定要删除吗?" onConfirm={()=>delModel(record)}>
                <Button type={"link"}>删除</Button>
              </Popconfirm>
            </>
          )
        }
      }
    }],
  ]
  const inputs: any[] = [
    ['模型名称', 'modelName', {
      placeholder: '请输入模型名称',
      itemProps: {},
      allowClear: true
    }]
  ]
  //编辑模型
  function openModelAdd(record:any){
    popup(<JudgmentModelAdd formData={record}/>,{title:'编辑模型',size:'small',onCloseCallback:function (){
        tableRef.current.onRefresh();
      }})
  }
  //删除模型
  function delModel(record:any){
    analyzeModelDelAsync(record.id).then(()=>{
      message.success('删除成功')
      tableRef.current.onRefresh();
    })
  }

  return<div className={styles.wrapper}>
    <TableInterface
      ref={tableRef}
      queryInputs={inputs}
      columns={columns}
      request={getAnalyzeModelListPages}
      paginationProps={{
        showTotal: (total: number) => {
          return `总数 : ${total}`
        }
      }}
    />
  </div>
}

export default JudgmentModelTable
