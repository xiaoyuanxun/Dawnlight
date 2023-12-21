import React from "react";
import styles from "./index.less"
import {Content} from "../content";

export const Assets = React.memo(() => {
  return <div style={{width: "100%"}}>
    <div className={styles.assets_wrap}>
      <p className={styles.p}>Top Assets(by Price)</p>
      <Content isHidden={true}/>
      <Content isHidden={true}/>
      <div style={{height:"20px"}}/>
    </div>
  </div>
})
