import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Popconfirm } from 'antd';
import { signIn, signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import UserModal from './UserModal';
import styled from 'styled-components';

export const StyledDiv = styled.div`
  display: inline-block;
  padding: 0 8px 0 0;
  cursor: pointer;

  :hover {
    color: #418df7;
  }
`;

const UserInfo: React.FC = () => {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session) {
      console.log('Logged info:', session);
    }
  }, [session]);

  return (
    <>
      {session ? (
        <div>
          <Avatar
            shape="circle"
            src={session.user?.image || ''}
            style={{ marginRight: '10px' }}
          />
          <text>{session.user?.name || 'Anonymous User'}</text>
          <StyledDiv
            onClick={() => setOpen(true)}
            style={{ marginLeft: '20px' }}
          >
            <EditOutlined />
          </StyledDiv>

          <Popconfirm
            title=""
            description="Are you sure to logout?"
            onConfirm={() => signOut()}
            okText="Yes"
            cancelText="No"
          >
            <StyledDiv>
              <LogoutOutlined />
            </StyledDiv>
          </Popconfirm>

          <UserModal
            open={open}
            setOpen={setOpen}
            onOk={() => update()}
            session={session}
          />
        </div>
      ) : (
        <button onClick={() => signIn()}>Log in</button>
      )}
    </>
  );
};

export default UserInfo;
