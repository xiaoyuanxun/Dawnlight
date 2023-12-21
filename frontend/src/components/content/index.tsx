import React, {useEffect, useRef} from "react"
import styles from "./index.less"
import {marked} from "marked";
import {AssetPanel} from "../assetPanel";
import {useNavigate} from "react-router-dom";
import {Skeleton} from 'antd';

const a = "# About Bodhi\n" +
  "\n" +
  "The content industry has never been a major industry. \n" +
  "\n" +
  "If you look at the Fortune 500, how many of them are content creators? Only 4.\n" +
  "\n" +
  "This is weird.\n" +
  "\n" +
  "We humans are spiritual beings. Rather than just living in a physical world, we also live in the mental worlds we created for each other: stories, music, films, and games. It's in the company of these creations that we get through hard times.\n" +
  "\n" +
  "Yet, there are two main problems in the content industry waiting to be solved: distribution and incentivization.\n" +
  "\n" +
  "'**Distribution**' is how your content reaches its audience. Web2 companies, such as Facebook and TikTok, have solved this quite well, whether through social networks or AI, and they continue to make improvements to their algorithms.\n" +
  "\n" +
  "However, **'incentivization'** remains an unresolved issue. And this is what Bodhi is built for.\n" +
  "\n" +
  "## The Problem\n" +
  "\n" +
  "Incentivization means getting rewards for creating valuable things, whether those rewards are in the form of social approval (views and likes), or financial gain (making money).\n" +
  "\n" +
  "People have come up with many ways to make money from their content, like adding sponsorships and selling merchandise in it.\n" +
  "\n" +
  "These approaches create a higher barrier, as it requires content creators to be not just creators, but also businessmen.\n" +
  "\n" +
  "So, what about ads or paywall, aren't they good enough?\n" +
  "\n" +
  "Let's consider pornography as an example, due to its universal and easily measurable value. If people can’t make money even from porn, it means our current approach is fundamentally flawed.\n" +
  "\n" +
  "Before Onlyfans, creators on Pornhub earned just $0.6 per 1000 views.\n" +
  "\n" +
  "Why so low? Because advertisers didn't want to place ads on porn sites. That's one of the problems of ads -- advertisers select content and audiences. Value to viewers doesn’t always mean value to advertisers.\n" +
  "\n" +
  "Later with the subscription-based Onlyfans, creators' income significantly increased.\n" +
  "\n" +
  "However, Onlyfans is not the perfect solution, either. Understanding the limitations of Onlyfans is the key to grasping the problem of content incentivization.\n" +
  "\n" +
  "The problem with Onlyfans is: **it reduces the value that content creates for the world**.\n" +
  "\n" +
  "- On Pornhub, your content could be consumed by 100,000 people, creating significant value, but yielding minimal return for you.\n" +
  "- On Onlyfans, you might have 100 subscribers paying $9.9 each per month, which increases your income. But the catch is that, the overall ‘cake’ shrinks – only 100 people see your content, reducing the value it adds to the world.\n" +
  "\n" +
  "**Getting a larger slice of a smaller cake will never be the ultimate solution. The ideal approach should be enlarging the cake and capturing a fair share of it.**\n" +
  "\n" +
  "## Dig Deeper\n" +
  "\n" +
  "Behind this problem lies a deeper issue:\n" +
  "\n" +
  "**Copying information is cost-free, yet our economic system isn't built for goods with zero marginal cost.**\n" +
  "\n" +
  "Consider the example of an apple sale: If I sell you an apple for one dollar, I lose an apple but gain a dollar, and you lose a dollar but gain an apple. This is what our economic system was designed for— the exchange of physical goods.\n" +
  "\n" +
  "However, the scenario changes when trading information (like articles, music, videos). Information can be replicated endlessly. **In such exchanges, a finite valuable resource (money) is traded for something that can be infinitely duplicated at no cost.**\n" +
  "\n" +
  "This creates an inherent conflict, which is the root of many problems: piracy, the challenge of rewarding creators, and the “shrinking cake” dilemma mentioned earlier.\n" +
  "\n" +
  "## A New Path\n" +
  "\n" +
  "With crypto, the solution space for the incentivization problem expand. A trading model distinct from “buying” could be devised, tackling the issues that traditional economic systems cannot.\n" +
  "\n" +
  "By establishing such a model at a fundamental level (a protocol), applications and users can concentrate on their core work without worrying about incentivization.\n" +
  "\n" +
  "Let's return to the problem we aim to solve: **incentivizing valuable content**.\n" +
  "\n" +
  "This problem can be broken down into two sub-questions:\n" +
  "\n" +
  "1. How to Recognize the Value of Content\n" +
  "2. How to Provide Incentives\n" +
  "\n" +
  "### How to Recognize the Value of Content\n" +
  "\n" +
  "One thing is certain: we cannot measure the value of content by the content itself. The value of content is determined by its consumers.\n" +
  "\n" +
  "The same article may seem pointless to one reader but could be a million-dollar inspiration to another; a how to video might be trivial to one viewer but crucial to another.\n" +
  "\n" +
  "This is similar to search engines. The value of a page is not about how often keywords appear, but how many other pages refer to it.\n" +
  "\n" +
  "Thus we can conclude:\n" +
  "\n" +
  "**The protocol doesn’t need to know what the content is. It measures value through consumer behavior.**\n" +
  "\n" +
  "### How to Provide Incentives\n" +
  "\n" +
  "First, let’s consider what won’t work under a crypto protocol:  \n" +
  "\n" +
  "**Any paywall (pay to view) is infeasible.** \n" +
  "\n" +
  "Why is this the case?\n" +
  "\n" +
  "When you build an economic mechanism on the blockchain that runs perpetually, where should its corresponding content be stored?\n" +
  "\n" +
  "If it's in a centralized server, it means it could disappear or become invalid at any time, rendering the economic mechanism meaningless. It's like investing in a company whose products and itself could vanish from the earth at any time, which doesn’t make sense.\n" +
  "\n" +
  "Instead, content should be in a place that is permanently accessible, i.e., on the blockchain. Blockchains like Arweave, designed for storage, can accomplish this task well.\n" +
  "\n" +
  "However, content on the blockchain is inevitably public.\n" +
  "\n" +
  "If you want to add a paywall for a public thing, you have to encrypt it. But where does the decryption process take place? If it's managed by a centralized server, its failure means the content becomes invalid, no different from direct hosting on a centralized server. If it's decrypted through blockchain mechanisms, it essentially remains public.\n" +
  "\n" +
  "So, the “paywall” is not only inefficient economically, but also infeasible technically.\n" +
  "\n" +
  "By the way, when we examine content on the blockchain, we find it has two characteristics: anyone can access it (non-excludability), and your access doesn’t affect others’ access (non-rivalry).\n" +
  "\n" +
  "This is exactly the definition of public goods. That's why the content incentivization problem is so challenging, as **it is fundamentally a public goods funding problem**, a dilemma that humanity has struggled with for thousands of years.\n" +
  "\n" +
  "## Bodhi as an experiment\n" +
  "\n" +
  "Bodhi is an experiment to solve the problem of content incentivization.\n" +
  "\n" +
  "Instead of relying on ads or paywall, **Bodhi turns anything you create into an asset, like a mini-company**.\n" +
  "\n" +
  "People can buy and sell its shares directly with Bodhi. Share prices automatically increase when people buy, and decrease when they sell.\n" +
  "\n" +
  "As the creator, you own the initial share and profit as its value increases.\n" +
  "\n" +
  "Plus, every time someone trades shares of your content, you receive a portion of the transaction as a fee.\n" +
  "\n" +
  "From a technical perspective, Bodhi stores content on Arweave, turning each Arweave ID into an ERC1155 asset. As users purchase, the token is minted more, and its price follows a quadratic curve based on the supply volume.\n" +
  "\n" +
  "From a financial perspective, Bodhi provides liquidity to long-tail assets. Since the protocol acts as the trading counterparty, liquidity is maintained even when there's only a single buyer for an asset.\n" +
  "\n" +
  "### Where does Bodhi come from\n" +
  "\n" +
  "I've had the idea for many years, but my confidence in it came from a sudden realization:\n" +
  "\n" +
  "> For the toughest problems, the answers may not lie in entities, but in the void (in our minds).\n" +
  "\n" +
  "Things that exist only in our minds are often the most influential and vibrant. This is the greatness of Bitcoin, which isn't always easy to recognize.\n" +
  "\n" +
  "Moreover, people often think of Meme and Ponzi as insignificant or even evil. But the two have one thing in common: they exist only in our minds and can be very powerful incentives for human beings. My intuition tells me Meme and Ponzi are underrated and might hold the key to public goods funding problem.\n" +
  "\n" +
  "Bodhi embodies this very insight.\n" +
  "\n" +
  "## Future\n" +
  "\n" +
  "As an experiment, even if Bodhi doesn't work as expected, it will still offer valuable insights for future protocols.\n" +
  "\n" +
  "But if it works, we will unlock a lot of interesting stuff.\n" +
  "\n" +
  "Since Bodhi has no protocol fee, anyone can build any type of protocol on top of it, and charge a fee if they want.\n" +
  "\n" +
  "Here're some possible ones:\n" +
  "\n" +
  "- A Youtube/TikTok-like platform with Bodhi\n" +
  "- A book publishing protocol with Bodhi\n" +
  "- A Steam-like game publishing protocol with Bodhi\n" +
  "- A protocol version of Twitter/Medium with Bodhi\n" +
  "- A crowdfunding tool for communities with Bodhi\n" +
  "- An academic paper publishing and fundraising protocol with Bodhi\n" +
  "- A voting protocol with Bodhi (sounds funny because bribery is inherently built-in.)\n" +
  "- A protocol version of Github where open source code can be both stored and incentivized\n" +
  "\n" +
  "...\n" +
  "\n" +
  "Now that you have a general understanding of what Bodhi is, to give you a deeper experience of it, this post itself is the very first asset on Bodhi.\n" +
  "\n" +
  "**Try trading it.**"
export const Home = React.memo(() => {
  return <div style={{width: "100%"}}>
    <Content isHidden={false}/>
    <div style={{height: "20px"}}/>
    <AssetPanel/>
    <div style={{height: "90px"}}/>
    <FixedDiv/>
  </div>
})

export const Content = React.memo((props: { isHidden: boolean }) => {
  const {isHidden} = props
  const ref = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  useEffect(() => {
    setTimeout(async () => {
      if (ref.current) {
        ref.current.innerHTML = await marked.parse(a)
      }
    }, 0)
  }, [])
  return <div className={styles.content_wrap}>
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
    {/*<div style={{width:'520px'}}>*/}
    {/*  <Skeleton/>*/}
    {/*</div>*/}
    <div ref={ref} className={isHidden ? styles.content_main : styles.content_main_2}/>
    <div className={styles.read_full_asset}
         onClick={() => navigate("/")}>
      Read Full Asset
    </div>
    <div className={styles.content_footer}>
      <div className={styles.content_footer_left}>
        <span>$392.75</span>
        <span style={{fontSize: "14px", fontWeight: "300"}}> 0.17779 ETH / Share</span>
      </div>
      <div className={styles.content_footer_right}>
        <div className={styles.content_footer_right_button_1}>Buy</div>
        <div className={styles.content_footer_right_button_2}>Sell</div>
      </div>
    </div>
  </div>
})

const FixedDiv = React.memo(() => {
  const navigate = useNavigate()
  return <div className={styles.fixed_panel} onClick={() => navigate("/explore")}>
    Enter Bodhi
  </div>
})

