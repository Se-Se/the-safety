import { useApi } from '@src/services/api/useApi';

export async function fetchData(outdata = null) {
  const getDashboard = useApi('dashboard').getAll;
  const getProperty = useApi('property').getAll;
  const getGroup = useApi('group').getAll;
  let data = [];
  let group = [];
  await Promise.all([getDashboard(), getProperty(), getGroup()])
    .then(([dashData, propertyData, groupData]) => {
      for (let index = 0; index < dashData.length; index++) {
        const content = dashData[index] ? JSON.parse(dashData[index].content) : { title: '', data: [] };
        for (let idx = 0; idx < content.data.length; idx++) {
          const curData = content.data[idx];
          if (curData.type == 'system') {
            if (outdata) {
              content.data[idx].data = outdata
                .filter(item => item.systemPart == curData.text)
                .map(item => item.dataName);
            }
            content.data[idx].class = '系统';
          } else {
            const property = propertyData.filter(item => item.propertyName == curData.text);
            content.data[idx].class = property && property.length ? property[0].propertyKind.split('/')[1] : '';
          }
        }
        dashData[index].content = content;
      }
      data = dashData;
      group = groupData;
    })
    .catch(() => {});

  return [data, group];
}
