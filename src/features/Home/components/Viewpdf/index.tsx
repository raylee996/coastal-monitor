import { useEffect, useRef } from 'react'
import styles from './index.module.sass'

const Viewpdf: React.FC = ()=>{
    const pdf = require('images/1.pdf')
    const iframeRef = useRef<any>(null)
    useEffect(() => {
     if(iframeRef.current){
        console.dir(iframeRef.current.contentDocument);
        iframeRef.current.contentDocument.oncontextmenu = () => {
            return false
        }
     }
    }, [])
    
    return<div className={styles.container}>
        <div className={styles.topTitle}>南山智慧边海防系统用户操作手册</div>
        <iframe ref={iframeRef} src={pdf} title='PDF' className={styles.pdf}></iframe>
    </div>
}

export default Viewpdf