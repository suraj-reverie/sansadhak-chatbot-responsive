import React, { useState } from 'react';
import { message } from 'antd';
import BotAvatarComponent from './BotAvatar';

const MultipleSelectMessage = ({
  options,
  handleMultipleSelect,
  newIconUrl,
}) => {
  const [selected, setSelected] = useState([]);

  const handleSelect = (option) => {
    const newArr = [...selected];
    const index = newArr.indexOf(option);
    if (index !== -1) {
      newArr.splice(index, 1);
    } else {
      newArr.push(option);
    }
    console.log('newArr', newArr);
    setSelected(newArr);
  };

  const handleSubmit = () => {

    if (selected.length === 0) {
      message.warning('Please select at least one option.');
      return;
    }
    handleMultipleSelect(selected)
  }

  return (
    <div style={{ display: 'flex' }}>
      {/*<div*/}
      {/*  style={{*/}
      {/*    height: '35px',*/}
      {/*    width: '35px',*/}
      {/*    marginRight: '0.5em',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  /!*<BotAvatarComponent newIconUrl={newIconUrl} />*!/*/}
      {/*</div>*/}
      <div className="lang-select-container">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={(e) => handleSelect(option)}
            className={`lang-item ${selected.includes(option) ? 'active' : ''}`}
            style={
              selected.includes(option)
                ? {
                  boxShadow: '0px 2px 4px 0px #00000033',
                  wordBreak: "break-word",
                }
                : {}
            }
          >
            {option.option}
          </div>
        ))}
        <div
          onClick={handleSubmit}
          className="lang-item"
          style={{ borderRadius: '50px' }}
        >
          Select
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectMessage;
