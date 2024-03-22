import FavouriteIcon from 'common/components/FavouriteIcon';
import { SimplifiedUser } from 'common/db/prisma';
import { FavouriteUser } from 'common/db/types';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import SearchComp from './SearchComp';
import UserAct from './UserAct';

interface AuthorHeaderProps {
  authorInfo: SimplifiedUser;
}

const AuthorHeader: React.FC<AuthorHeaderProps> = ({ authorInfo }) => {
  const { data: session } = useSession();
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteUser | null>(
    null
  );

  const getFavouriteInfo = useCallback(() => {
    sendRequest<FavouriteUser[]>(
      `${API_HOST}/api/favourite/user?${queryParse({
        userId: authorInfo.id,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json.length > 0) {
        setFavouriteInfo(json[0]);
      }
    });
  }, [authorInfo]);

  const postFavouriteInfo = useCallback(() => {
    sendRequest(`${API_HOST}/api/favourite/user`, {
      method: 'POST',
      body: JSON.stringify({
        userId: authorInfo.id,
      }),
    }).then(() => {
      getFavouriteInfo();
    });
  }, [authorInfo, getFavouriteInfo]);

  const deleteFavouriteInfo = useCallback(() => {
    sendRequest(
      `${API_HOST}/api/favourite/user?${queryParse({
        userId: authorInfo.id,
      })}`,
      {
        method: 'DELETE',
      }
    ).then(() => {
      setFavouriteInfo(null);
    });
  }, [authorInfo, setFavouriteInfo]);

  useEffect(() => {
    if (authorInfo.id) {
      getFavouriteInfo();
    }
  }, [authorInfo, getFavouriteInfo]);

  return (
    <div className="header">
      <div style={{ marginLeft: '20px' }}>
        <span>{'Author / '}</span>
        <span style={{ fontWeight: '550' }}>{authorInfo.name}</span>
        {session && authorInfo.name !== session.user.name ? (
          <FavouriteIcon
            style={{
              marginLeft: '20px',
              cursor: 'pointer',
              color: favouriteInfo ? undefined : 'transparent',
            }}
            onClick={() => {
              favouriteInfo ? deleteFavouriteInfo() : postFavouriteInfo();
            }}
          />
        ) : null}
      </div>
      <div style={{ display: 'flex' }}>
        <SearchComp />
        <UserAct />
      </div>
    </div>
  );
};

export default AuthorHeader;
