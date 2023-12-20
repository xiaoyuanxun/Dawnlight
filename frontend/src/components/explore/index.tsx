import React from "react"
import styles from "./index.less"

export const Explore = React.memo(() => {
  const arr = ["Recent Activities", "Top Assets", "All Assets", "My Contents", "My Holdings"]
  return <div style={{width: "100%"}}>
    <div className={styles.explore_wrap}>
      <div className={styles.explore_part1}>
        <input placeholder={"Asset ID #"} type="text"/>
        <span>Go</span>
      </div>
      <div className={styles.explore_part2}>
        {arr.map((v, k) => {
          return <span key={k}>{v} </span>
        })}
      </div>
    </div>
  </div>
})
