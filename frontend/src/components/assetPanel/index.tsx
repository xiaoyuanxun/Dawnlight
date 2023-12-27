import React, {useEffect, useState} from "react";
import styles from "./index.less"
import {Asset, TradeMetaData} from "../../declarations/Dawnlight_backend/Dawnlight_backend";
import {drawnlightApi} from "../../api/dawnlight";
import {DECIMALS} from "../modals/newModal";
import {sliceString} from "../../utils/common";
import {Skeleton} from 'antd';
import { Principal } from '@dfinity/principal'

const Trades = React.memo((props: { asset?: Asset }) => {
  const [recent, setRecent] = useState<TradeMetaData[]>()

  const init = async () => {
    if (!props.asset) return
    const res = await drawnlightApi.getRecentTrade(props.asset.id)
    setRecent(res)
  }

  useEffect(() => {
    init()
  }, [props.asset])

  return <>
    {recent ? recent.map((v, k) => {
      return <div className={styles.panel_item} key={k}>
        <span>🛁</span>
        <span>{sliceString(v.user.toText())}</span>
        <span className={styles.panel_item_tag}>{Object.keys(v.tradeType)[0].toUpperCase()}</span>
        <span> {Number(v.tokenAmount) / DECIMALS} share for {Number(v.icpAmount) / DECIMALS} ICP</span>
      </div>
    }) : <div style={{height: "200px"}}>
      <Skeleton/>
    </div>}
  </>
})

const Holders = React.memo((props: { asset?: Asset }) => {
  const [holders, setHodlers] = useState<Array<[Principal, bigint]>>()

  const init = async() => {
    if(!props.asset) return
    const res = await drawnlightApi.getHolders(props.asset.id)
    setHodlers(res)
  }

  useEffect(() => {
    init()
  }, [props.asset])

  return <>
    <div className={styles.holder_header}>
      <span>HOLDER</span>
      <span>SHARE</span>
    </div>
    <div className={styles.holder_item}>
      {
        holders?.map((v, k) => {
          return (
            <>
              <span>
                🌱 {sliceString(v[0].toText())}
              </span>
              <span>
                {Number(v[1]) / DECIMALS}
              </span>
            </>
          )
        })
      }
    </div>
  </>
})

const Overview = React.memo((props: { asset?: Asset }) => {
  const [supply, setSupply] = useState<bigint>()
  const [poolValue, setPoolValue] = useState<number>(0)

  const init = async () => {
    if (!props.asset) return
    const res = await drawnlightApi.getShareSupply(props.asset.id)
    setSupply(res)
  }

  const getPoolValue = async () => {
    if (!props.asset) return
    const res = await drawnlightApi.getPoolValue(props.asset.id);
    setPoolValue(Number(res) / DECIMALS)
  }

  useEffect(() => {
    init()
    getPoolValue()
  }, [props.asset])
  return <>
    {supply ? <>
      <div style={{marginBottom: "24px"}}>
        <div className={styles.overview_title}>Total Value in the Pool</div>
        <div className={styles.overview_content}>{poolValue} ICP</div>
      </div>
      <div>
        <div className={styles.overview_title}>Share Supply</div>
        <div className={styles.overview_content}>{Number(supply) / DECIMALS} Shares</div>
      </div>
    </> : <div>
      <Skeleton.Input/>
    </div>}
  </>
})

export const AssetPanel = React.memo((props: { asset?: Asset }) => {
  const [tag, setTag] = useState(0)
  const arr = ["Recent Trades", "Holders", "Overview"]

  return <div className={styles.panel_wrap}>
    <div className={styles.panel_header}>
      {arr.map((v, k) => {
        return <span onClick={() => setTag(k)} key={k} className={tag === k ? styles.click : styles.default}>{v}</span>
      })}
    </div>
    <div className={styles.panel_main}>
      {tag === 0 ? <Trades {...props}/> : tag === 1 ? <Holders {...props}/> : <Overview {...props}/>}
    </div>
  </div>
})

