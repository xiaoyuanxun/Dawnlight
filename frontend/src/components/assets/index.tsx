import React, {useEffect, useState} from "react";
import styles from "./index.less"
import {Content} from "../content";
import {Asset} from "../../declarations/Dawnlight_backend/Dawnlight_backend";
import {drawnlightApi} from "../../api/dawnlight";
import {Spin} from "antd";


export const Assets = React.memo(() => {
  const [data, setData] = useState<Asset[]>()

  const fetch = async () => {
    const res = await drawnlightApi.getAssetsEntries()
    setData(res)
  }

  useEffect(() => {
    fetch()
  }, [])

  return <div style={{width: "100%"}}>
    <Spin spinning={!data}>
      <div className={styles.assets_wrap}>
        {data?.map((v, k) => {
          return <Content isSimple={true} asset={v} key={k} isHidden={true}/>
        })}
        <div style={{height: "20px"}}/>
      </div>
    </Spin>
  </div>
})
