import { useApi } from '@src/services/api/useApi';
import cls from 'classnames';
import React, { useEffect, useState } from 'react';
import './business.less';

const BusinessCard: React.FC<{
  onChange: (name) => void;
  name?: string;
}> = props => {
  const [dataList, setDataList] = useState<Array<{}>>([]);
  const { getAll } = useApi('business');
  const [select, setSelect] = useState<string>(props.name);

  useEffect(() => {
    getAll()
      .then(data => {
        setDataList(data);
      })
      .catch(() => {});
  }, []);

  const selectBusiness = name => {
    let selected = name;
    if (name === select) {
      selected = '';
    }
    setSelect(selected);
    props.onChange(selected);
  };

  return (
    <div className="business-select">
      {dataList.map((item, index) => {
        const name = item['businessName'];
        return (
          <div
            key={index}
            className={cls('business-name', { select: select == name && select != '' })}
            onClick={() => selectBusiness(name)}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
};

export default BusinessCard;
