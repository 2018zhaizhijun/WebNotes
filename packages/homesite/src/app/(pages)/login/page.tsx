'use client';

import { signIn } from 'next-auth/react';
import React, { useEffect } from 'react';

const LogIn: React.FC = () => {
  useEffect(() => {
    signIn(undefined, {
      redirect: true,
      callbackUrl: '/author',
    });
  }, []);

  return <></>;
};

export default LogIn;
