import React, {useState} from 'react';
import styles from "./index.less"
import {NewModal} from "../modals/newModal";

export const Header = React.memo(() => {
  const [open, setOpen] = useState(false)
  return <div className={styles.header_wrap}>
    <NewModal setOpen={setOpen} open={open}/>
    <div className={styles.header_left}>
      <img height={30} width={30} src="https://bodhi.wtf/assets/bodhi-f8f8fb-180-faebd556.png" alt=""/>
      BodHi - IC
    </div>
    <div style={{height: "100%", display: "flex", alignItems: "center", gap: "10px"}}>
      <div onClick={()=>setOpen(true)} className={styles.header_button} style={{borderColor: "#C05522", color: "#C05522"}}>
        + &nbsp;
        New
      </div>
      <div className={styles.header_button}>
        🌭
        0X1f0b
        <span style={{height: "24px", width: "24px"}}>
        <svg viewBox="0 0 24 24" focusable="false" className="chakra-icon css-onkibi" aria-hidden="true">
        <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
      </svg>
      </span>
      </div>
    </div>

  </div>
})

