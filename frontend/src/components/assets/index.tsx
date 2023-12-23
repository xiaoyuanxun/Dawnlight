import React, {useEffect, useState} from "react";
import styles from "./index.less"
import {Content} from "../content";
import {Asset} from "../../declarations/bodhi_backend/bodhi_backend";
import {bodhiApi} from "../../api/bodhi";

export const Assets = React.memo(() => {
  const [data, setData] = useState<Asset[]>()

  const fetch = async () => {
    const res = await bodhiApi.getAssetsEntries()
    setData(res)
  }

  useEffect(() => {
    fetch()
  }, [])

  return <div style={{width: "100%"}}>
    <div className={styles.assets_wrap}>
      {/*<p className={styles.p}>Top Assets(by Price)</p>*/}
      {data?.map((v, k) => {
        return <Content isSimple={true} asset={v} key={k} isHidden={true}/>
      })}
      <div style={{height: "20px"}}/>
    </div>
  </div>
})
