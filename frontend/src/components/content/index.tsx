import React, {useEffect, useRef, useState} from "react"
import styles from "./index.less"
import {marked} from "marked";
import {AssetPanel} from "../assetPanel";
import {useNavigate, useParams} from "react-router-dom";
import {Skeleton, Tooltip} from 'antd';
import {Asset} from "../../declarations/Dawnlight_backend/Dawnlight_backend";
import {drawnlightApi} from "../../api/dawnlight";
import { BuyModal } from '../modals/newModal';

export const Home = React.memo(() => {
  const {id} = useParams()
  const [data, setData] = useState<Asset>()

  const fetch = async () => {
    let ID: any = id
    if (id === undefined) {
      ID = 0
    }
    const b = Number(ID)
    if (isNaN(b)) return
    try {
      const res = await drawnlightApi.getAsset(b)
      setData(res)
    } catch (e) {
      setData(undefined)
    }
  }

  useEffect(() => {
    fetch()
  }, [id])

  return <div style={{width: "100%"}}>
    <Content isHidden={false} asset={data} isSimple={false}/>
    <div style={{height: "20px"}}/>
    <AssetPanel/>
    <div style={{height: "90px"}}/>
    <FixedDiv/>
  </div>
})

export const Content = React.memo((props: { isHidden: boolean, asset?: Asset, isSimple: boolean }) => {
  const {isHidden, asset, isSimple} = props
  const ref = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const [buyModalOpen, setBuyModalOpen] = useState(false)

  const actor = React.useMemo(() => {
    if (!asset) return ''
    const principal = asset.creator.toText()
    return principal.substring(0, 3) + "..." + principal.substring(principal.length - 3, principal.length)
  }, [asset])

  const handleBuy = async () => {
    setBuyModalOpen(true)
  };

  const handleSell = async () => {

  };
  
  const fetchData = async () => {
    if (!asset) return
    try {

      setTimeout(async () => {
        if (ref.current) {
          let content: string = ""
          const fileType = asset.fileType
          const url = `https://r4yar-zqaaa-aaaan-qlfja-cai.raw.icp0.io/${asset.fileKey}`
          if (fileType.includes("text")) {
            const res = await fetch(url)
            const arraybuffer = await res.arrayBuffer()
            content = await marked.parse(new TextDecoder().decode(arraybuffer))
          } else if (fileType.includes("image")) {
            content = `<img  src="${url}"/>`
          } else if (fileType.includes("video")) {
            content = `<div style="display: flex;justify-content: center"> <video controls src="${url}" type="${asset.fileType}"/> <div/>`
          }
          ref.current.innerHTML = content
        }
      }, 0)
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [asset])

  return <div className={styles.content_wrap}>
    <div className={styles.content_header}>
      <span>#{Number(asset?.id)} Created by 🌱
        <Tooltip
          title={asset?.creator.toText()}>
          &nbsp;
          <span style={{cursor: "pointer"}}
                onClick={() => navigate(`/user/contents/${asset?.creator.toText()}`)}>{actor}</span>
        </Tooltip>
      </span>
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
    {isSimple && <div className={styles.read_full_asset}
                      onClick={() => navigate(`/${Number(asset?.id)}`)}>
      Read Full Asset
    </div>}
    <div className={styles.content_footer}>
      <div className={styles.content_footer_left}>
        <span>$392.75</span>
        <span style={{fontSize: "14px", fontWeight: "300"}}> 39.8 ICP / Share</span>
      </div>
      <div className={styles.content_footer_right}>
        <div className={styles.content_footer_right_button_1} onClick={handleBuy}>
          Buy
        </div>
        <BuyModal open={buyModalOpen} setOpen={setBuyModalOpen} assetId={Number(asset?.id)}/>
        <div className={styles.content_footer_right_button_2} onClick={handleSell}>
          Sell
        </div>
      </div>
    </div>
  </div>
})

const FixedDiv = React.memo(() => {
  const {id} = useParams()
  const navigate = useNavigate()
  return <div style={{display: id !== undefined ? "none" : "flex"}} className={styles.fixed_panel}
              onClick={() => navigate("/explore")}>
    Enter Bodhi
  </div>
})

