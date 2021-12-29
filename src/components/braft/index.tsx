import BraftEditor from 'braft-editor';
// 引入编辑器样式
import 'braft-editor/dist/index.css';
import React, { useEffect, useState } from 'react';

const FancyButton = React.forwardRef((props: any, ref: any): any => {
  const val = BraftEditor.createEditorState(null);
  const [editorState, setEditorState] = useState(val);

  useEffect(() => {
    const htmlContent = props.editData;
    const html = BraftEditor.createEditorState(htmlContent);
    setEditorState(html);
  }, [props.editData]);

  const handleEditorChange = data => {
    setEditorState(data);
  };

  return (
    <div className="my-component">
      <BraftEditor readOnly={props.isEdit} ref={ref} value={editorState} onChange={handleEditorChange} />
    </div>
  );
});

export default FancyButton;
