import { Checkbox, Input } from '@tencent/tea-component';
import React from 'react';
import './edit.less';

const EditCard: React.FC<{
    group: boolean,
    data: { title: string, data?: Array<{ text: string, select: boolean }> },
    onChange: (index, value) => void
}> = (props) => {
    const data = props.data;

    return <div className="partition-edit">
        {
            props.group ? <div className="group-part">
                <div className="edit-header">大区名称</div>
                <Input value={data.title} onChange={value => {
                    props.onChange(-1, value);
                }} />
            </div> : <div className='part'>
                <div className="edit-header">分区名称</div>
                <Input value={data.title} readOnly />
                <div className="edit-header edit-element">选择展示元素</div>

                <div className="edit-select">
                    <Checkbox.Group layout="column" >
                        {
                            data.data.map((item, index) => {
                                return <Checkbox key={index} display="block" value={item.select} onChange={(value, _) => {
                                    props.onChange(index, value);
                                }}>{item.text}</Checkbox>;
                            })
                        }
                    </Checkbox.Group>
                </div>
            </div>
        }
    </div>;
};

export default EditCard;
