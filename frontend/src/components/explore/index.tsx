import React, {useState} from "react"
import styles from "./index.less"
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../utils/useAuth";

type A = {
  v: string,
  p: string
}
export const Explore = React.memo(() => {
  const [value, setValue] = useState<string>()
  const {principal} = useAuth()
  const navigate = useNavigate()

  const arr: A[] = React.useMemo(() => {
    const a1: A[] = [
      //   {
      //   v: "Recent Activities",
      //   p: ""
      // },
      //   {
      //   v: "Top Assets",
      //   p: "top"
      // },
      {
        v: "All Assets",
        p: "assets"
      }]

    if (principal) return [...a1, ...[{
      v: "My Contents",
      p: `user/contents/${principal?.toText()}`
    }, {
      v: "My Holdings",
      p: `user/holdings/${principal?.toText()}`
    }]]
    return a1
  }, [principal])


  return <div style={{width: "100%"}}>
    <div className={styles.explore_wrap}>
      <div className={styles.explore_part1}>
        <input onChange={e => setValue(e.target.value)} placeholder={"Asset ID #"} type="number"/>
        <span
          style={{color: value ? "black" : "", cursor: value ? "pointer" : "not-allowed"}}
          onClick={() => navigate(`/${value}`)}
        >Go</span>
      </div>
      <div className={styles.explore_part2}>
        {arr.map((v, k) => {
          return <span onClick={() => navigate(`/${v.p}`)} key={k}>{v.v} </span>
        })}
      </div>
    </div>
  </div>
})
