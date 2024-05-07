interface Props {
    value?: string | number
}

const TextSimple: React.FC<Props> = ({ value }) => {
    console.debug('TextSimple')

    return <span>{value}</span>
}

export default TextSimple