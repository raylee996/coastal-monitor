import { Tabs } from "antd"
import { useCallback, useMemo, useState } from "react"

import IPVoice from "./IPVoice"
import TTSContent from "./TTSContent"
import VoiceContent from "./VoiceContent"
import '../../index.sass'
// ip音柱
const Voice: React.FC = () => {
    const [key, setKey] = useState('item-0')
    const handleChange = useCallback(
        (val: string) => {
            setKey(val)
        },
        [],
    )
    const item1 = useMemo(() => [
        { label: 'IP音柱', key: 'item-0', children: <IPVoice /> },
        { label: 'TTS内容库', key: 'item-1', children: <TTSContent /> },
        { label: '音频内容库', key: 'item-2', children: <VoiceContent /> },
    ], [])

    return <>
        <Tabs  type='card' className="core-tabs-card" items={item1} tabPosition='top' activeKey={key} onChange={handleChange}></Tabs>
    </>
}

export default Voice