# Dawnlight 曦光

## Product Introduction
我们想帮助公共物品们。

社会从许多优秀的公共物品中受益，开源代码、博客、小说、视频 等等。

一些代码必须开源才能获得别人的信任，一些视频只有看了才知道好不好，一些博客总能帮助到一部分人。

公共物品贡献了社会价值，但是难以获得营收。

这些公共物品单独存在，要么被别人白嫖，要么在角落里积灰，如何才能更好的帮助公共物品呢？

我们尝试将公共物品代币化公开发行，并给购买人回报预期，是金子总会发光。

将公共物品通过类似 bodhi 和 FT 的方式发行：每个 Share 的价格随着购买人数的增加而逐渐上涨。

以前是只有公司才有这种模式，到一个区块链项目可以自己发 FT ，现在更去中心化了，相当于任何公共物品都可以发行 FT 。

通过给捐助者一个投资回报预期，促进人们自发地对有价值的公共物品进行早期捐助。
将资产发行和回报的过程都放在智能合约上，使之公开透明。

## 部署

### 本地

```shell
dfx deploy icrc_token --argument '(record {
  name = "icrc_wicp";
  symbol = "wicp";
  decimals = 8: nat8;
  fee = 1000: nat;
  max_supply = 1000000000000000000: nat;
  initial_balances = vec {
    (record {
      record {
        owner = principal "lxxuo-qaany-e5qxk-ommoy-kgfao-74i5c-sk23j-upuyy-ks7gi-oyboy-xae";
        subaccount = null;
      };
      1000000000000000000: nat
    })
  };
  min_burn_amount = 1000 : nat;
  minting_account = null;
  advanced_settings = null;
})'
```

```shell
dfx deploy Dawnlight_backend --argument '(principal "bkyz2-fmaaa-aaaaa-qaaaq-cai", principal "be2us-64aaa-aaaaa-qaabq-cai")'

dfx wallet send $(dfx canister id Dawnlight_backend) 10000000000000
```

### 主网
```
bucket : r4yar-zqaaa-aaaan-qlfja-cai

Dawnlight_backend : g5r75-yaaaa-aaaan-qlgua-cai

Dawnlight_frontend : g2qzj-vyaaa-aaaan-qlguq-cai

wicp : gttsv-dqaaa-aaaan-qlgva-cai
```

```shell
dfx deploy --ic icrc_token --argument '(record {
  name = "icrc_wicp";
  symbol = "wicp";
  decimals = 8: nat8;
  fee = 1000: nat;
  max_supply = 1000000000000000000: nat;
  initial_balances = vec {
    (record {
      record {
        owner = principal "g5r75-yaaaa-aaaan-qlgua-cai";
        subaccount = null;
      };
      1000000000000000000: nat
    })
  };
  min_burn_amount = 1000 : nat;
  minting_account = null;
  advanced_settings = null;
})'
```

```shell
dfx deploy --ic Dawnlight_backend --argument '(principal "r4yar-zqaaa-aaaan-qlfja-cai", principal "gttsv-dqaaa-aaaan-qlgva-cai")'
```
