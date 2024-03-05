"use client";

import React, { useCallback, useEffect } from "react";
import { SimplifiedUser } from "common/db/prisma";
import { API_HOST, sendRequest } from "common/utils/http";
import { useRouter } from "next/navigation";

function HomePage() {
  const router = useRouter();

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(`${API_HOST}/api/user`, {
      method: "GET",
    }).then((json) => {
      if (json.length > 0) {
        router.push(`/author/${json[0].name}`);
      }
    });
  }, [sendRequest]);

  useEffect(() => {
    getAuthorInfo();
  }, []);

  return <></>;
}

export default HomePage;
