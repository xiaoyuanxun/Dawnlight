import React from "react";
import MDEditor from '@uiw/react-md-editor/nohighlight';
import rehypeSanitize from "rehype-sanitize";
import styles from "./index.less"

export const Editor = React.memo(() => {
  const [value, setValue] = React.useState("");
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
    <div className={styles.editor_footer}>
      <span>Preview</span>
    </div>
  </div>
})
