import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Image, Popconfirm } from 'antd';
import UserModal from 'common/components/UserModal';
import { Session } from 'next-auth';
import React, { useCallback, useEffect, useState } from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';

const Popup: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const getSession = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'AUTH_CHECK' }, (sessionInfo) => {
      if (sessionInfo) {
        setSession(sessionInfo);
      } else {
        //no session means user not logged in
      }
    });
  }, [setSession]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  const logOut = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'LOG_OUT' }, () => {
      setSession(null);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Image src={logo} className="App-logo" alt="logo" />
          {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a> */}
          <div>WebNotes</div>
        </div>
        {session ? (
          <div>
            <Avatar
              shape="circle"
              src={session.user?.image || ''}
              style={{ marginRight: '10px' }}
            />
            <text>{session.user?.name || 'Anonymous User'}</text>
            <button
              onClick={() => setOpen(true)}
              style={{ marginLeft: '20px' }}
            >
              <EditOutlined />
            </button>

            <Popconfirm
              title=""
              description="Are you sure to logout?"
              onConfirm={() => logOut()}
              okText="Yes"
              cancelText="No"
            >
              <button>
                <LogoutOutlined />
              </button>
            </Popconfirm>

            <UserModal
              open={open}
              setOpen={setOpen}
              onOk={() => getSession()}
              session={session}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              chrome.tabs.create({
                url: `/login`,
              });
            }}
          >
            Log in
          </button>
        )}
      </header>
    </div>
  );
};

export default Popup;
