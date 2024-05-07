import React from "react";
// import styles from './index.module.sass'
import { useEffect } from "react";

interface Props {
  pic?:any
  svagid?:any
  option?:any
  isClear?:boolean
}


const SvgaPic: React.FC<Props> = ({ pic,svagid,option,isClear }) => {

  useEffect(()=>{
    main() 
    function main () {
      let player =new SVGA.Player(`#${svagid}`) 
      let parser =new SVGA.Parser(`#${svagid}`) 
      parser.load(pic,(video:any)=>{
        player.setVideoItem(video)
        player.startAnimation()
      })
    }
    
  },[pic,svagid])
  
  return (
    <article>
      <div id={svagid} style={option}></div>
    </article>
  )
}

export default SvgaPic
