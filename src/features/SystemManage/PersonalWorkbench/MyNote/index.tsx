import LabelManage from "component/LabelManage";
// import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { getLabelSelect } from "server/label";
import { queryMyNoteList } from "server/system";
import NoteAddCardItem from "./NoteAddCardItem";
import styles from "./index.module.sass";
import NoteAdd from "./NoteAdd";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";


const MyNote: React.FC = () => {
  console.debug('MyNote')

  const tableRef = useRef<any>(null)
  const [listType, setListType] = useState([])

  const queryInputs = [
    ['关键字',
      'key',
      {
        placeholder: '请输入关键字搜索',
        allowClear: true,
        style: { width: '360px' }
      }
    ],
    [
      '分类', 'noteTypeId', InputType.select, {
        dict: listType,
        placeholder: '请选择分类',
        style: { width: '180px' }
      }],
  ]

  const tools: any = [
    ['分类管理', {
      onClick: () => {
        popupUI(<LabelManage type={11} hasTypeName={true} />, { title: '分类管理', size: "small", onCloseCallback: () => labelRefresh() })
      },
      type: "primary"
    }],
    ['新增便签', {
      onClick: () => {
        addEditNote()
      },

    }],
  ]

  useEffect(() => {
    async function main() {
      labelRefresh()
    }
    main()
  }, [])

  async function labelRefresh() {
    let vo = await getLabelSelect({ type: 11 })
    vo && setListType(vo)
    tableRef.current.onRefresh()
  }

  function addEditNote() {
    popupUI(<NoteAdd noteType={0} onSuccess={() => {
      tableRef.current.onRefresh()
    }} />, { title: '新增便签', size: "auto" })
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        card={NoteAddCardItem}
        cardOptions={{ isFlex: true }}
        queryInputs={queryInputs}
        request={queryMyNoteList}
        toolsRight={tools}
      />
    </article>
  )
}

export default MyNote
