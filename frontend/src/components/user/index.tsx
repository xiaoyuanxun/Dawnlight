import React, {useEffect, useState} from 'react';
import styles from "./index.less"
import {Content} from "../content";
import {Outlet, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";
import {Explore} from "../explore";
import {sliceString, stringToPrincipal} from "../../utils/common";
import {Asset} from "../../declarations/Dawnlight_backend/Dawnlight_backend";
import {drawnlightApi, shareAsset} from "../../api/dawnlight";
import {message, Spin} from "antd";

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
        <span>SHARE VALUE</span>
      </div>
      {data?.map((v, k) => {
        return <Card asset={v} key={k}/>
      })}
    </Spin>
  </div>
})

const Card = React.memo((props: { asset: shareAsset }) => {
  const {asset} = props
  return <div className={styles.card_warp}>
    <span style={{padding: "0"}}>#{Number(asset.id)}</span>
    <span>
          <img height={100} width={100} style={{borderRadius: "8px"}}
               src="https://thumbnail.bodhi.wtf/thumbnail/KFp-UgQquh0XoybFiWXOIbTJ6E8hs3LmPHFcZt69j-c" alt=""/>
    </span>
    <span>{asset.share}</span>
    <span>6.92244 ETH ($15554.07)</span>
  </div>
})
