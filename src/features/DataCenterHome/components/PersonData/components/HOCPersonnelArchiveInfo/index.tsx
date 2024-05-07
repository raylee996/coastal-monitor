import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo"
import { useEffect, useState } from "react"
import { doGetPersonInfo } from "server/personnel"


interface Props {
  /** 档案id */
  id: string
}

const HOCPersonnelArchiveInfo: React.FC<Props> = ({ id }) => {
  console.debug('HOCPersonnelArchiveInfo')


  const [data, setData] = useState<any>()


  useEffect(() => {
    async function main() {
      const vo = await doGetPersonInfo({ id })
      setData(vo)
    }
    main()
  }, [id])


  return (
    <article>
      {data
        ? <PersonnelArchiveInfo id={id} itemProps={data} />
        : <span>数据加载中</span>
      }
    </article>
  )
}

export default HOCPersonnelArchiveInfo