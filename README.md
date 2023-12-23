# bodhi

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
dfx deploy bodhi_backend --argument '(principal "bkyz2-fmaaa-aaaaa-qaaaq-cai", principal "be2us-64aaa-aaaaa-qaabq-cai")'

dfx wallet send $(dfx canister id bodhi_backend) 10000000000000
```

### 主网
```json
bucket : r4yar-zqaaa-aaaan-qlfja-cai

bodhi_backend : g5r75-yaaaa-aaaan-qlgua-cai

bodhi_frontend : g2qzj-vyaaa-aaaan-qlguq-cai

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
dfx deploy --ic bodhi_backend --argument '(principal "r4yar-zqaaa-aaaan-qlfja-cai", principal "gttsv-dqaaa-aaaan-qlgva-cai")'
```