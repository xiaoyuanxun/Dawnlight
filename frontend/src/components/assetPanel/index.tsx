import React, {useState} from "react";
import styles from "./index.less"

const Trades = React.memo(() => {
  return <>
    {new Array(100).fill(0).map((v, k) => {
      return <div className={styles.panel_item} key={k}>
        <span>🛁</span>
        <span>35cik-...-pae</span>
        <span className={styles.panel_item_tag}>SOLD</span>
        <span> 0.03 share for 3.60 ICP</span>
      </div>
    })}
  </>
})

const Holders = React.memo(() => {
  return <>
    <div className={styles.holder_header}>
      <span>HOLDER</span>
      <span>SHARE</span>
    </div>
    <div className={styles.holder_item}>
      <span>
        🌱 35cik-...-pae
      </span>
      <span>6</span>
    </div>
  </>
})

const Overview = React.memo(() => {
  return <>
    <div style={{marginBottom:"24px"}}>
      <div className={styles.overview_title}>Total Value in the Pool</div>
      <div className={styles.overview_content}>$124093.33</div>
      <div className={styles.overview_des}>11532.33 ICP</div>
    </div>
    <div>
      <div className={styles.overview_title}>Share Supply</div>
      <div className={styles.overview_content}>142.400844000000000001 Shares</div>
    </div>
  </>
})

export const AssetPanel = React.memo(() => {
  const [tag, setTag] = useState(0)
  const arr = ["Recent Trades", "Holders", "Overview"]

  return <div className={styles.panel_wrap}>
    <div className={styles.panel_header}>
      {arr.map((v, k) => {
        return <span onClick={() => setTag(k)} key={k} className={tag === k ? styles.click : styles.default}>{v}</span>
      })}
    </div>
    <div className={styles.panel_main}>
      {tag === 0 ? <Trades/> : tag === 1 ? <Holders/> : <Overview/>}
    </div>
  </div>
})

