import PDF from 'common/components/PDF';
import { Session } from 'next-auth';
import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';

// const app = document.createElement('div');
// app.id = 'custom-app';
// document.body.appendChild(app);

const href = document.location.origin + document.location.pathname;
document.documentElement.style.width = '100%';
document.documentElement.style.height = '100%';

const PDFContent: React.FC = () => {
  const [session, setSession] = React.useState<
    (Session & { user: { id: string } }) | null
  >(null);

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

  return <PDF url={href} authorId={session?.user?.id} />;
};

ReactDOM.render(<PDFContent />, document.body);
