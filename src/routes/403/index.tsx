import { Card, Status } from '@tencent/tea-component';
import React from 'react';

export default () => (
  <Card style={{ height: '100%' }}>
    <Status icon={'no-permission'} title={'暂无权限'} description="请联系系统管理员" />
  </Card>
);
