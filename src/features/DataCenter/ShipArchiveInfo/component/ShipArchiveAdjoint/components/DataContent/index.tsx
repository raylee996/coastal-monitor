interface Props {
  record: any
}

const DataContent: React.FC<Props> = ({ record }) => {
  console.debug('DataContent')

  return (
    <span>{record.codeType === 6 ? record.content : record.targetId}</span>
  )
}

export default DataContent