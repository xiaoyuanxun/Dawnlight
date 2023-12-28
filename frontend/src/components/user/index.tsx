import React, {useEffect, useState} from 'react';
import styles from "./index.less"
import {Content} from "../content";
import {Outlet, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";
import {Explore} from "../explore";
import {sliceString, stringToPrincipal} from "../../utils/common";
import {Asset} from "../../declarations/Dawnlight_backend/Dawnlight_backend";
import {drawnlightApi, shareAsset} from "../../api/dawnlight";
import {message, Spin} from "antd";
import {DECIMALS} from "../modals/newModal";

export const UserPage = React.memo(() => {
  const navigate = useNavigate()
  const {address} = useParams()
  const {pathname} = useLocation()
  const tag = pathname.includes("contents") ? 0 : 1
  return <div>
    <div className={styles.user_wrap}>
      <div style={{margin: "20px 0"}}>
        <h2 style={{fontSize: "20px"}}>
          <span style={{marginRight: "10px", fontSize: "30px"}}>🌱</span>
          <span>{sliceString(address)}</span>
        </h2>
        <div style={{fontSize: "14px", color: "#8290A3"}}>
          {address}
        </div>
      </div>
      <div>
        <div className={tag === 0 ? styles.user_tag_1 : styles.user_tag_2}
             onClick={() => navigate(`contents/${address}`)}>
          Contents
        </div>
        <div className={tag === 1 ? styles.user_tag_1 : styles.user_tag_2}
             onClick={() => navigate(`holdings/${address}`)}>
          Holdings
        </div>
      </div>
      <Outlet/>
    </div>
  </div>
})


export const MyContents = React.memo(() => {
  const [data, setData] = useState<Asset[]>()
  const {address} = useParams()

  const fetch = async () => {
    try {
      const principal = stringToPrincipal(address)
      const res = await drawnlightApi.getUserCreated(principal)
      setData(res)
    } catch (e) {
      message.error("address error")
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return <div style={{margin: "20px 0", display: "flex", flexDirection: 'column', gap: "20px"}}>
    <Spin spinning={!data}>
      {data?.map((v, k) => {
        return <Content isSimple={true} key={k} asset={v} isHidden={true}/>
      })}
    </Spin>
  </div>
})

export const Holding = React.memo(() => {
  const [data, setData] = useState<shareAsset[]>()
  const {address} = useParams()

  const fetch = async () => {
    try {
      const principal = stringToPrincipal(address)
      const res = await drawnlightApi.getUserBuyed(principal)
      setData(res)
    } catch (e) {
      message.error("address error")
    }
  }

  useEffect(() => {
    fetch()
  }, [])
  return <div style={{marginTop: "28px"}}>
    <Spin spinning={!data}>
      <div className={styles.table_head}>
        <span>ASSET</span>
        <span></span>
        <span>SHARES</span>
        {/*<span>SHARE VALUE</span>*/}
      </div>
      {data?.map((v, k) => {
        return <Card asset={v} key={k}/>
      })}
    </Spin>
  </div>
})

const Card = React.memo((props: { asset: shareAsset }) => {
  const {asset} = props
  const [price, setPrice] = useState(0)
  const navigate = useNavigate()
  const Type = React.useMemo(() => {
    if (asset.fileType.includes("plain/text")) {
      return "text"
    }
    if (asset.fileType.includes("image")) {
      return "image"
    }
    if (asset.fileType.includes("video")) {
      return "video"
    }
    return "text"
  }, [asset])

  const url = `https://r4yar-zqaaa-aaaan-qlfja-cai.raw.icp0.io/${asset.fileKey}`


  return <div className={styles.card_warp}>
    <span style={{padding: "0"}}>#{Number(asset.id)}</span>
    <span style={{cursor: "pointer"}} onClick={() => navigate(`/${asset.id}`)}>
      {Type === "text" ? <TXT/> : Type === "image" ? <img
        src={url} height={100} width={100} style={{borderRadius: "8px"}}
        alt=""/> : <video height={100} width={100} style={{borderRadius: "8px"}} src={url}/>}
    </span>
    <span>{asset.share / DECIMALS}</span>
    {/*<span>6.92244 ETH ($15554.07)</span>*/}
  </div>
})

const TXT = React.memo(() => {
  return <div
    style={{
      width: "100px", height: "100px", background: "rgb(79, 209, 197)", borderRadius: "8px", display: "flex",
      alignItems: 'center', justifyContent: "center", color: "white"
    }}>
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" focusable="false"
         className="chakra-icon css-1fmr1qf" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"></path>
      <path
        d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"></path>
    </svg>
  </div>
})
