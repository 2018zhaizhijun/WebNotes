"use client";

import { signIn } from "next-auth/react";
import React, { useEffect } from "react";

const LogIn: React.FC = () => {
  useEffect(() => {
    signIn(undefined, {
      redirect: false,
      callbackUrl: "/",
    });
  }, []);

  return <></>;
};

export default LogIn;
