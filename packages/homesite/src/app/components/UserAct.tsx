import { Avatar, Divider, Drawer, Modal } from 'antd';
import { signIn, signOut, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { EditOutlined, HeartOutlined, LogoutOutlined } from '@ant-design/icons';
import UserModal from 'common/components/UserModal';
import styled from 'styled-components';
import { API_HOST, sendRequest } from 'common/utils/http';
import { SimplifiedUser } from 'common/db/prisma';
import UserDisplay from './UserDisplay';

const StyledDiv = styled.div`
  cursor: pointer;
  color: rgb(49, 49, 49);
  padding: 10px 0;

  .anticon {
    padding: 0 10px;
  }

  :hover {
    color: #418df7;
  }
`;

const UserAct: React.FC = () => {
  const { data: session, update } = useSession();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [favouriteModalOpen, setFavouriteModalOpen] = useState(false);

  const [favouriteUsers, setFavouriteUsers] = useState<SimplifiedUser[]>();

  const getFavouriteInfo = useCallback(() => {
    sendRequest<SimplifiedUser[]>(`${API_HOST}/api/query/favouriteAuthors`, {
      method: 'GET',
    }).then((json) => {
      setFavouriteUsers(json);
    });
  }, [setFavouriteUsers]);

  useEffect(() => {
    getFavouriteInfo();
  }, [getFavouriteInfo]);

  return (
    <>
      {session ? (
        <>
          <button onClick={() => setDrawerOpen(true)}>
            <Avatar
              shape="circle"
              src={session.user?.image || ''}
              style={{ margin: '0 20px' }}
            />
          </button>
          <Drawer
            title={
              <div>
                <Avatar
                  shape="circle"
                  src={session.user?.image || ''}
                  style={{ marginRight: '10px' }}
                />
                <text>{session.user?.name || 'Anonymous User'}</text>
              </div>
            }
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={240}
            closeIcon={false}
          >
            <StyledDiv onClick={() => setEditModalOpen(true)}>
              <div>
                <EditOutlined /> Edit Profile
              </div>
            </StyledDiv>
            <StyledDiv onClick={() => setFavouriteModalOpen(true)}>
              <div>
                <HeartOutlined /> Favourite Authors
              </div>
            </StyledDiv>
            <Divider />
            <StyledDiv onClick={() => signOut()}>
              <div>
                <LogoutOutlined /> Log Out
              </div>
            </StyledDiv>

            <UserModal
              open={editModalOpen}
              setOpen={setEditModalOpen}
              onOk={() => update()}
              session={session}
            />

            <Modal
              open={favouriteModalOpen}
              title="Favourite Authors"
              onCancel={() => setFavouriteModalOpen(false)}
              footer={null}
            >
              <div style={{ paddingTop: '16px' }}>
                {favouriteUsers?.map((item) => {
                  return <UserDisplay key={item.id} user={item} />;
                })}
              </div>
            </Modal>
          </Drawer>
        </>
      ) : (
        <button onClick={() => signIn()}>Log in</button>
      )}
    </>
  );
};

export default UserAct;
