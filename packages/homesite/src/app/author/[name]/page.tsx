"use client";

import React, { useCallback, useEffect, useState } from "react";
import AuthorHome from "@/components/AuthorHome";
import { SessionProvider } from "next-auth/react";
import { SimplifiedUser } from "common/db/prisma";
import { API_HOST, queryParse, sendRequest } from "common/utils/http";

function AuthorHomePage({ params }: { params: { name: string } }) {
  const [authorInfo, setAuthorInfo] = useState<SimplifiedUser | null>(null);

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser>(
      `${API_HOST}/api/user?${queryParse({ name: params.name })}`,
      {
        method: "GET",
      }
    ).then((json) => {
      if (json.id) {
        setAuthorInfo(json);
      }
    });
  }, [params.name, sendRequest, setAuthorInfo]);

  useEffect(() => {
    if (params.name) {
      getAuthorInfo();
    }
  }, [params.name, getAuthorInfo]);

  return (
    <SessionProvider>
      {authorInfo && (
        <AuthorHome authorInfo={{ ...authorInfo, id: authorInfo.id }} />
      )}
    </SessionProvider>
  );
}

export default AuthorHomePage;
