import React, {useState} from 'react';
import styles from "./index.less"
import {Content} from "../content";

export const UserPage = React.memo(() => {
  const [tag, setTag] = useState(0)
  return <div>
    <div className={styles.user_wrap}>
      <div style={{margin: "20px 0"}}>
        <h2 style={{fontSize: "20px"}}>
          <span style={{marginRight: "10px", fontSize: "30px"}}>🌱</span>
          <span>0xD1</span>
        </h2>
        <div style={{fontSize: "14px", color: "#8290A3"}}>
          0xD10be77aD727ce32C85809a2ae8Ff4d86EbC068D
        </div>
      </div>
      <div>
        <div className={tag === 0 ? styles.user_tag_1 : styles.user_tag_2} onClick={() => setTag(0)}>
          Contents
        </div>
        <div className={tag === 1 ? styles.user_tag_1 : styles.user_tag_2} onClick={() => setTag(1)}>
          Holdings
        </div>
      </div>
      {
        tag === 0
          ?
          <div style={{margin: "20px 0", display: "flex", flexDirection: 'column', gap: "20px"}}>
            <Content isHidden={true}/>
            <Content isHidden={true}/>
          </div>
          :
          <div style={{marginTop: "28px"}}>
            <div className={styles.table_head}>
              <span>ASSET</span>
              <span></span>
              <span>SHARES</span>
              <span>SHARE VALUE</span>
            </div>
            <Card/>
            <Card/>
            <Card/>
          </div>
      }
    </div>
  </div>
})

const Card = React.memo(() => {
  return <div className={styles.card_warp}>
    <span style={{padding: "0"}}>#0</span>
    <span>
          <img height={100} width={100} style={{borderRadius: "8px"}}
               src="https://thumbnail.bodhi.wtf/thumbnail/KFp-UgQquh0XoybFiWXOIbTJ6E8hs3LmPHFcZt69j-c" alt=""/>
    </span>
    <span>6</span>
    <span>6.92244 ETH ($15554.07)</span>
  </div>
})
