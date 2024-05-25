import { EditOutlined, HeartOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, Modal } from 'antd';
import UserModal from 'common/components/UserModal';
import { SimplifiedUser } from 'common/db/prisma';
import { withErrorBoundaryCustom } from 'common/utils/error';
import { API_HOST, sendRequest } from 'common/utils/http';
import { signIn, signOut, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import './UserAct.css';
import UserDisplay from './UserDisplay';

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
    session && getFavouriteInfo();
  }, [session, getFavouriteInfo]);

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
            <div
              className="user-drawer__item"
              onClick={() => setEditModalOpen(true)}
            >
              <div>
                <EditOutlined /> Edit Profile
              </div>
            </div>
            <div
              className="user-drawer__item"
              onClick={() => setFavouriteModalOpen(true)}
            >
              <div>
                <HeartOutlined /> Favourite Authors
              </div>
            </div>
            <Divider />
            <div className="user-drawer__item" onClick={() => signOut()}>
              <div>
                <LogoutOutlined /> Log Out
              </div>
            </div>

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
        // signIn() 默认参数 callbackUrl = window.location.href, redirect = true
        <Button onClick={() => signIn()} type="link">
          Log in
        </Button>
      )}
    </>
  );
};

export default withErrorBoundaryCustom(UserAct);
