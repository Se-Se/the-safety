import { useHistory } from '@tea/app';
import { Breadcrumb, Icon } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import { Link } from 'react-router-dom';

export default function BreadcrumbPage(props: any) {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  useEffect(() => {
    const val = cookie.load('safetyTrade') && cookie.load('safetyTrade').split('/')[1];
    let arr = props.crumbs;
    if (arr && !props.notChange) {
      arr[0].name = val;
    }
    setOptions(arr);
  }, [props.crumbs]);
  const handleGoBack = () => {
    history.goBack();
  };
  return (
    <Breadcrumb className="sec-sandbox-crumb">
      <Icon type="btnback" style={{ margin: '0 10px 0 0', cursor: 'pointer' }} onClick={handleGoBack} />
      {(props.crumbs || []).map((item, index) => {
        return (
          <Breadcrumb.Item key={index}>
            {index === 0 ? <Link to={item.link}>{item.name}</Link> : item.name}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
