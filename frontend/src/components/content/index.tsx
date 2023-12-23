import React, {useEffect, useRef, useState} from "react"
import styles from "./index.less"
import {marked} from "marked";
import {AssetPanel} from "../assetPanel";
import {useNavigate} from "react-router-dom";
import {Skeleton} from 'antd';

export const Home = React.memo(() => {
  return <div style={{width: "100%"}}>
    <Content isHidden={false} fileKey={"123"}/>
    <div style={{height: "20px"}}/>
    <AssetPanel/>
    <div style={{height: "90px"}}/>
    <FixedDiv/>
  </div>
})

export const Content = React.memo((props: { isHidden: boolean, fileKey?: string }) => {
  const {isHidden, fileKey} = props
  const ref = useRef<HTMLDivElement | null>(null)
  const [content, setContent] = useState<string>()
  const navigate = useNavigate()

  const fetchData = async () => {
    if (!fileKey) return
    try {
      const res = await fetch(`https://r4yar-zqaaa-aaaan-qlfja-cai.raw.icp0.io/${fileKey}`)
      const arraybuffer = await res.arrayBuffer()
      setTimeout(async () => {
        if (ref.current) {
          ref.current.innerHTML = await marked.parse(new TextDecoder().decode(arraybuffer))
        }
      }, 0)
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fileKey])

  return <div className={styles.content_wrap}>
    <div className={styles.content_header}>

      <span>#0 Created by 🌱 0xD1</span>
      <span style={{height: "24px", width: "24px"}}>
          <svg viewBox="0 0 24 24" focusable="false" className="chakra-icon css-onkibi" aria-hidden="true"><g
            fill="currentColor" stroke="currentColor" strokeLinecap="square" strokeWidth="2"><circle cx="12" cy="12"
                                                                                                     fill="none"
                                                                                                     r="11"
                                                                                                     stroke="currentColor"></circle><line
            fill="none" x1="11.959" x2="11.959" y1="11" y2="17"></line><circle cx="11.959" cy="7" r="1"
                                                                               stroke="none"></circle></g></svg>
        </span>
    </div>
    {/*<div style={{width:'520px'}}>*/}
    {/*  <Skeleton/>*/}
    {/*</div>*/}
    <div ref={ref} className={isHidden ? styles.content_main : styles.content_main_2}/>
    <div className={styles.read_full_asset}
         onClick={() => navigate("/")}>
      Read Full Asset
    </div>
    <div className={styles.content_footer}>
      <div className={styles.content_footer_left}>
        <span>$392.75</span>
        <span style={{fontSize: "14px", fontWeight: "300"}}> 0.17779 ETH / Share</span>
      </div>
      <div className={styles.content_footer_right}>
        <div className={styles.content_footer_right_button_1}>Buy</div>
        <div className={styles.content_footer_right_button_2}>Sell</div>
      </div>
    </div>
  </div>
})

const FixedDiv = React.memo(() => {
  const navigate = useNavigate()
  return <div className={styles.fixed_panel} onClick={() => navigate("/explore")}>
    Enter Bodhi
  </div>
})

