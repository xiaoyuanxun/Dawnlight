import React from "react"
import styles from "./index.less"

export const Content = React.memo(() => {

  return <div style={{width: "100%"}}>
    <div className={styles.content_wrap}>
      <div className={styles.content_header}>

        <span>#0 Created by 🌱 0xD1</span>
        <span style={{height: "24px", width: "24px"}}>
          <svg viewBox="0 0 24 24" focusable="false" className="chakra-icon css-onkibi" aria-hidden="true"><g
            fill="currentColor" stroke="currentColor" strokeLinecap="square" strokeWidth="2"><circle cx="12" cy="12"
                                                                                                       fill="none"
                                                                                                       r="11"
                                                                                                       stroke="currentColor"></circle><line
            fill="none" x1="11.959" x2="11.959" y1="11" y2="17"></line><circle cx="11.959" cy="7" r="1"
                                                                               stroke="none"></circle></g></svg>
        </span>
      </div>
      <div className={styles.content_footer}>
        <div className={styles.content_footer_left}>
          <span>$392.75</span>
          <span style={{fontSize:"14px",fontWeight:"300"}}> 0.17779 ETH / Share</span>
        </div>
        <div className={styles.content_footer_right}>
          <div className={styles.content_footer_right_button_1}>Buy</div>
          <div className={styles.content_footer_right_button_2}>Sell</div>
        </div>
      </div>
    </div>
  </div>
})

