import { Avatar } from "antd";
import FavouriteIcon from "common/components/FavouriteIcon";
import { FavouriteUser } from "common/db/types";
import { API_HOST, queryParse, sendRequest } from "common/utils/http";
import { signIn, useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import SearchComp from "./SearchComp";
import { SimplifiedUser } from "common/db/prisma";

interface AuthorHeaderProps {
  authorInfo: SimplifiedUser;
}

const AuthorHeader: React.FC<AuthorHeaderProps> = ({ authorInfo }) => {
  const { data: session, update } = useSession();
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteUser | null>(
    null
  );

  const getFavouriteInfo = useCallback(() => {
    sendRequest<FavouriteUser[]>(
      `${API_HOST}/api/favourite/user?${queryParse({
        userId: authorInfo.id,
      })}`,
      {
        method: "GET",
      }
    ).then((json) => {
      if (json.length > 0) {
        setFavouriteInfo(json[0]);
      }
    });
  }, [sendRequest, authorInfo]);

  const postFavouriteInfo = useCallback(() => {
    sendRequest(`${API_HOST}/api/favourite/user`, {
      method: "POST",
      body: JSON.stringify({
        userId: authorInfo.id,
      }),
    }).then((json) => {
      getFavouriteInfo();
    });
  }, [sendRequest, authorInfo, getFavouriteInfo]);

  const deleteFavouriteInfo = useCallback(() => {
    sendRequest(
      `${API_HOST}/api/favourite/user?${queryParse({
        userId: authorInfo.id,
      })}`,
      {
        method: "DELETE",
      }
    ).then((json) => {
      setFavouriteInfo(null);
    });
  }, [sendRequest, authorInfo, setFavouriteInfo]);

  useEffect(() => {
    if (authorInfo.id) {
      getFavouriteInfo();
    }
  }, [authorInfo, getFavouriteInfo]);

  return (
    <div className="header">
      <div style={{ marginLeft: "20px" }}>
        <span>{"Author / "}</span>
        <span style={{ fontWeight: "550" }}>{authorInfo.name}</span>
        {session && authorInfo.name !== session.user.name ? (
          <FavouriteIcon
            style={{
              marginLeft: "20px",
              cursor: "pointer",
              color: favouriteInfo ? undefined : "transparent",
            }}
            onClick={() => {
              favouriteInfo ? deleteFavouriteInfo() : postFavouriteInfo();
            }}
          />
        ) : null}
      </div>
      <div style={{ display: "flex" }}>
        <SearchComp />
        {session ? (
          <div>
            <Avatar
              shape="circle"
              src={session.user?.image || ""}
              style={{ margin: "0 20px" }}
            />
          </div>
        ) : (
          <button onClick={() => signIn()}>Log in</button>
        )}
      </div>
    </div>
  );
};

export default AuthorHeader;
