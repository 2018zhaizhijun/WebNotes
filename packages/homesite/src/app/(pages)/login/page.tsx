'use client';

import { signIn } from 'next-auth/react';
import React, { useEffect } from 'react';

const LogIn: React.FC = () => {
  useEffect(() => {
    signIn(undefined, {
      redirect: false,
      callbackUrl: '/author',
    });
  }, []);

  return <></>;
};

export default LogIn;
