import { Button, Form, Input, Modal } from '@tencent/tea-component';
import React from 'react';
import { useField, useForm } from 'react-final-form-hooks';

// eslint-disable-next-line
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getStatus(meta, validating) {
  if (meta.active && validating) {
    return 'validating';
  }
  if (!meta.touched) {
    return null;
  }
  return meta.error ? 'error' : 'success';
}

export default function AddPathName(props) {
  // visible: 是否初始可见， existedNames: 已经被占用的路径名字
  const { visible, existedNames } = props;
  async function onSubmit(values) {
    await sleep(500);
    props.onConfirmed(values);
    // reset form
    form.reset();
    form.resetFieldState('name');
  }

  // 输入验证
  const validateFn = input => {
    let { name } = input;
    let valid = name && name.length > 0 && existedNames.findIndex(elem => elem === name) === -1;
    let state = valid ? undefined : '路径名为空或已被占用';
    return {
      name: state,
    };
  };

  const { form, handleSubmit, validating, submitting } = useForm({
    onSubmit,
    initialValuesEqual: () => true,
    initialValues: { name: '' },
    validate: validateFn,
  });

  const name = useField('name', form);

  return (
    <div className="example-stage">
      <Modal maskClosable visible={visible} size="m" disableCloseIcon={true} caption="输入路径名">
        <form onSubmit={handleSubmit}>
          <Form>
            <Form.Item
              label="名称"
              status={getStatus(name.meta, validating)}
              message={getStatus(name.meta, validating) === 'error' && name.meta.error}
            >
              <Input className="w-330" {...name.input} autoComplete="off" placeholder="输入路径名（唯一）" />
            </Form.Item>
          </Form>
          <Form.Action>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={validating}>
              提交
            </Button>
            <Button
              type="weak"
              onClick={e => {
                e.preventDefault();
                props.onCancel();
                // reset form
                form.reset();
                form.resetFieldState('name');
              }}
            >
              取消
            </Button>
          </Form.Action>
        </form>
      </Modal>
    </div>
  );
}
