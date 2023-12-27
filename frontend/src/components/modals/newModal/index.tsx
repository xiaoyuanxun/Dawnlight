import React, {useEffect, useState} from 'react';
import {
  Modal, Typography, Radio, Input, Space, notification
} from 'antd';
import styles from "./index.less"
import {bucketApi} from "../../../api/bucket";
import {useDropzone} from "react-dropzone";
import {useAuth} from "../../../utils/useAuth";
import { drawnlightApi } from '../../../api/dawnlight';
import type { RadioChangeEvent } from 'antd';
import {LoadingOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';
import { icrcApi } from '../../../api/icrc';
import { Principal } from '@dfinity/principal';
import { getSubAccount } from '../../../utils/common';

export const DECIMALS: number = 100_000_000;
const TEST_ICP_CANISTER = 'gttsv-dqaaa-aaaan-qlgva-cai';
const DAWNLIGHT_CANISTER = 'g5r75-yaaaa-aaaan-qlgua-cai';

export const NewModal = React.memo((props: { open: boolean, setOpen: Function }) => {
  const {open, setOpen} = props
  const [step, setStep] = useState(0)

  return (
    <Modal
      width={"576px"}
      title={<span>{step === 0 ? "Create" : <span>
         <span onClick={() => setStep(0)} style={{
           color: "rgb(113, 128, 150)",
           cursor: "pointer",
           display: 'inline-flex',
           alignItems: "center",
         }}>
            <svg style={{marginRight: "8px"}} stroke="currentColor" fill="currentColor" stroke-width="0"
                 viewBox="0 0 448 512" aria-hidden="true"
                 focusable="false" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path
              d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path></svg>
        Back
         </span>
      </span>
      }
    </span>}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      {step === 0 ? <Step1 setStep={setStep}/> : <Step2/>}
    </Modal>
  );
})

const Step1 = React.memo((props: { setStep: Function }) => {
  const onDrop = React.useCallback((files: File[]) => {
    bucketApi.storeFile(files[0]).then(e => console.log("ok"))
  }, [])

  const {getRootProps, getInputProps} = useDropzone({onDrop, multiple: false})

  return <div className={styles.new_modal_content}>
    <div className={styles.new_modal_item} onClick={() => props.setStep(1)}>
          <span>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" focusable="false"
                 className="chakra-icon css-19vv2c5" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><path
              d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>
          </span>
      <p className={styles.p1}>Write Something</p>
      <p className={styles.p2}>Short messages or long article with markdown</p>
    </div>
    <div style={{height: "16px"}}/>

    <div className={styles.new_modal_item} {...getRootProps()}>
      <input {...getInputProps()} />
      <span>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" focusable="false"
                 className="chakra-icon css-19vv2c5" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path
              d="M608 0H160a32 32 0 0 0-32 32v96h160V64h192v320h128a32 32 0 0 0 32-32V32a32 32 0 0 0-32-32zM232 103a9 9 0 0 1-9 9h-30a9 9 0 0 1-9-9V73a9 9 0 0 1 9-9h30a9 9 0 0 1 9 9zm352 208a9 9 0 0 1-9 9h-30a9 9 0 0 1-9-9v-30a9 9 0 0 1 9-9h30a9 9 0 0 1 9 9zm0-104a9 9 0 0 1-9 9h-30a9 9 0 0 1-9-9v-30a9 9 0 0 1 9-9h30a9 9 0 0 1 9 9zm0-104a9 9 0 0 1-9 9h-30a9 9 0 0 1-9-9V73a9 9 0 0 1 9-9h30a9 9 0 0 1 9 9zm-168 57H32a32 32 0 0 0-32 32v288a32 32 0 0 0 32 32h384a32 32 0 0 0 32-32V192a32 32 0 0 0-32-32zM96 224a32 32 0 1 1-32 32 32 32 0 0 1 32-32zm288 224H64v-32l64-64 32 32 128-128 96 96z"></path></svg>
          </span>
      <p className={styles.p1}>Publish Media</p>
      <p className={styles.p2}>image / video / pdf / games, or any other file</p>
    </div>
    <p style={{fontSize: "14px", color: "rgb(113, 128, 150)", textAlign: 'center'}}>
      All formats are accepted. Content will be stored forever till the world ends. No one can change your content
      but you.
    </p>
  </div>
})

const Step2 = React.memo(() => {
  const [value, setValue] = useState<string>("")

  const handleClick = async () => {
    await bucketApi.store(value)
    console.log("ok")
  }
  return <div className={styles.new_modal_content}>
    <textarea onChange={(e: any) => setValue(e.target.value)} placeholder={"Write something here.Markdown Supported"}
              name=""
              id="" rows={5}/>
    <div className={styles.preview_wrap}>
      <a href={"/editor"}>Switch to Markdown Editor</a>
      <span onClick={handleClick}>Upload</span>
    </div>
  </div>
})

export const BuyModal = React.memo((props: { open: boolean, setOpen: Function, assetId: number}) => {
  const {open, setOpen, assetId} = props
  const [step, setStep] = useState(0)
  const {identity,isAuth} = useAuth()
  const [value, setValue] = useState(1);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(1);
  const [api, contextHolder] = notification.useNotification();

  const onChange = (e: RadioChangeEvent) => {
    // console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const initBuyPrice = async () => {
    if(assetId != undefined && !Number.isNaN(assetId)) {
      if(value === 1) {
        const price = await drawnlightApi.getBuyPriceAfterFee(BigInt(assetId), BigInt(DECIMALS))
        setPrice(Number(price))
        setAmount(DECIMALS)
      } else if(value === 2) {
        const price = await drawnlightApi.getBuyPriceAfterFee(BigInt(assetId), BigInt(10 * DECIMALS))
        setPrice(Number(price))
        setAmount(10 * DECIMALS)
      } else if(value === 3) {
        const price = await drawnlightApi.getBuyPriceAfterFee(BigInt(assetId), BigInt(100 * DECIMALS))
        setPrice(Number(price))
        setAmount(100 * DECIMALS)
      }
      // else if(value == 4) {
      //   const price = await drawnlightApi.getBuyPriceAfterFee(BigInt(assetId), BigInt(amount * DECIMALS))
      //   setPrice(Number(price))
      // }
    }
  };

  const buy = async() => {
    const _asset = assetId;
    const _amount = amount;
    api.info({
      message: 'Buy Asset',
      key: 'buy',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    })
    api.info({
      message: 'Transfer TEST ICP',
      key: 'transfer',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    })
    const _icrcApi = icrcApi(TEST_ICP_CANISTER);
    const transferResult = await _icrcApi.icrc1_transfer({
      to: {
        owner: Principal.fromText(DAWNLIGHT_CANISTER),
        subaccount: [getSubAccount(identity?.getPrincipal() as Principal)]
      },
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: BigInt(price)
    });
    console.log(transferResult)
    if('Ok' in transferResult) {
      api.success({
        message: 'Transfer TEST ICP Successful !',
        key: 'transfer',
        description: '',
        icon: <CheckOutlined/>
      });
      const buyResult = await drawnlightApi.buy(BigInt(_asset), BigInt(_amount))
      if(buyResult == null) {
        api.success({
          message: 'Buy Asset Successful !',
          key: 'buy',
          description: '',
          icon: <CheckOutlined/>
        });
      }
    } else {
      api.error({
        message: 'Transfer TEST ICP Error !',
        key: 'transfer',
        description: '',
        icon: <CloseOutlined />
      });
      api.error({
        message: 'Buy Asset Error !',
        key: 'buy',
        description: '',
        icon: <CloseOutlined />
      });
    }
  }

  useEffect(() => {
    initBuyPrice()
  }, [assetId, value]);

  return (
    <Modal
      title={`Asset#${assetId}`}
      open={open}
      // onOk={handleOk}
      onCancel={() => setOpen(false)}
      okText='BUY'
      onOk={buy}
    >
      <Typography.Paragraph>
        Price : {Number(price / DECIMALS)} ICP
      </Typography.Paragraph>
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical">
          <Radio.Button value={1}>1 Share</Radio.Button>
          <Radio.Button value={2}>10 Share</Radio.Button>
          <Radio.Button value={3}>100 Share</Radio.Button>
          {/* <Radio.Button value={4}>
            Other
            {value === 4 ? <Input style={{ width: 100, marginLeft: 20}} /> : null}
          </Radio.Button> */}
        </Space>
      </Radio.Group>
      {contextHolder}
    </Modal>
  );
})
