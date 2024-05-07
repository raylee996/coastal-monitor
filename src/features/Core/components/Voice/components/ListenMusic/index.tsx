import { useEffect, useRef } from "react"
import styles from './index.module.sass'
interface Props {
    audioUrl?: string
    audioName?: string
}
// 试听
const ListenMusic: React.FC<Props> = ({
    audioUrl,
    audioName
}) => {
    const audioRef = useRef<any>(null)
    useEffect(() => {
        let audio = audioRef.current
        if (audioRef.current && audioUrl) {
            audioRef.current.play()
        }
        return () => {
            audio && audio.pause()
        }
    }, [audioUrl])

    return <article className={styles.wrapper}>
        <p className={styles.musicName}>{audioName}</p>
        <audio src={audioUrl} ref={audioRef} controls loop autoPlay />
    </article>
}

export default ListenMusic