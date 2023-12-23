import React from "react"
import styles from "./index.less"
import {useNavigate} from "react-router-dom";

type A = {
  v: string,
  p: string
}
export const Explore = React.memo(() => {
  const navigate = useNavigate()
  const arr: A[] = [{
    v: "Recent Activities",
    p: ""
  }, {
    v: "Top Assets",
    p: "top"
  }, {
    v: "All Assets",
    p: "assets"
  }, {
    v: "My Contents",
    p: ""
  }, {
    v: "My Holdings",
    p: ""
  }]

  return <div style={{width: "100%"}}>
    <div className={styles.explore_wrap}>
      <div className={styles.explore_part1}>
        <input placeholder={"Asset ID #"} type="text"/>
        <span>Go</span>
      </div>
      <div className={styles.explore_part2}>
        {arr.map((v, k) => {
          return <span onClick={() => navigate(`/${v.p}`)} key={k}>{v.v} </span>
        })}
      </div>
    </div>
  </div>
})
