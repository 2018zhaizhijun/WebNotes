import React, { useState } from 'react';

import {
  CheckOutlined,
  HighlightOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import '../style/Tip.css';

import { ColorPicker } from 'antd';
import styled from 'styled-components';
import { getPopupContainer, presets } from '../lib/utils';

interface Props {
  onConfirm: (color: string, comment?: { text: string }) => void;
}

const StyledDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 5px 0 0;

  button:hover {
    color: rgb(21, 92, 254);
  }
`;

export function Tip({ onConfirm }: Props) {
  const [compact, setCompact] = useState<boolean>(true);
  const [text, setText] = useState<string>('');
  const [color, setColor] = useState<string>('#ffe28f');

  return (
    <div className="Tip">
      {compact ? (
        <div className="Tip__compact">
          <div className="Tip__option">
            <ColorPicker
              presets={presets}
              value={color}
              size="small"
              onChangeComplete={(color) => {
                onConfirm('#' + color.toHex());
              }}
              getPopupContainer={getPopupContainer}
              format="rgb"
            >
              {/* <div className="Tip__item">Add highlight</div> */}
              <div className="Tip__item">
                <HighlightOutlined />
              </div>
            </ColorPicker>
          </div>
          <div className="Tip__option">
            {/* <div className="Tip__item"
                    onClick={() => {
                        setCompact(false)
                    }}
                >
                    Add comment
                </div> */}
            <div
              className="Tip__item"
              onClick={() => {
                setCompact(false);
              }}
            >
              <MessageOutlined />
            </div>
          </div>
        </div>
      ) : (
        <form
          className="Tip__card"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(color, { text });
          }}
        >
          <div>
            <TextArea
              rows={3}
              placeholder="Your comment"
              autoFocus
              maxLength={100}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
          <StyledDiv>
            <ColorPicker
              value={color}
              presets={presets}
              size="small"
              onChangeComplete={(color) => setColor('#' + color.toHex())}
              getPopupContainer={getPopupContainer}
              format="rgb"
            />
            <button type="submit">
              <CheckOutlined />
            </button>
          </StyledDiv>
        </form>
      )}
    </div>
  );
}

export default Tip;
