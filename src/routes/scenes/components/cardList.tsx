import React from 'react';

const CardListPage: React.FC<{
  list?: any;
  onEdit?: (data: any) => void;
  handleDelete?: (data: any) => void;
  showTrack?: (data: any) => void;
}> = props => {
  const handleEdit = data => {
    props.onEdit(data);
  };

  return (
    <>
      <div className="scenes-card-wrap">
        <div className="scenes-card-container">
          {(props.list || []).map((item, index) => {
            return (
              <div
                className="scenes-card-item"
                key={index}
                onClick={ev => {
                  ev.stopPropagation();
                  props.showTrack(item);
                }}
              >
                <div className="card-img"></div>
                <div className="scenes-inner-container">
                  <div className="scenes-title">
                    <span>{item.sceneName}</span>
                  </div>
                  <div className="text-group">
                    <span className="text-title">行动策略:</span>
                    {item.strategy}
                  </div>
                  <div className="text-group">
                    <span className="text-title">攻击目标:</span>

                    <span className="text-info">{item.attackObject}</span>
                  </div>
                  <div className="text-group">
                    <span className="text-title">损失影响:</span>

                    <span className="text-info">{item.loseEffect}</span>
                  </div>

                  <div className="scenes-card-footer">
                    <div
                      style={{ marginRight: '15px' }}
                      className="scenes-footer-btn"
                      onClick={ev => {
                        ev.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      编辑
                    </div>
                    <div
                      className="scenes-footer-btn"
                      onClick={ev => {
                        ev.stopPropagation();
                        props.handleDelete(item);
                      }}
                    >
                      删除
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CardListPage;
