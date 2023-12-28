import React from "react";
import MDEditor from '@uiw/react-md-editor/nohighlight';
import rehypeSanitize from "rehype-sanitize";
import styles from "./index.less"
import {bucketApi} from "../../api/bucket";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";
import {notification} from "antd";

export const Editor = React.memo(() => {
  const [value, setValue] = React.useState("");
  const [api, contextHolder] = notification.useNotification();

  const handleClick = async () => {
    try {
      api.info({
        message: 'uploading',
        key: 'upload',
        duration: null,
        description: '',
        icon: <LoadingOutlined/>
      })
      await bucketApi.store(value)
      api.success({
        message: 'upload Successful !',
        key: 'upload',
        description: '',
        icon: <CheckOutlined/>
      });
    } catch (e) {
      api.error({
        message: 'upload failed !',
        key: 'upload',
        description: '',
        icon: <CloseOutlined/>
      });
    }
  }
  return <div style={{padding: "0 8px"}}>
    <div data-color-mode="light">
      <MDEditor
        value={value}
        height={"500px"}
        onChange={setValue as any}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
    {contextHolder}
    <div className={styles.editor_footer}>
      <span onClick={handleClick}>Upload</span>
    </div>
  </div>
})
