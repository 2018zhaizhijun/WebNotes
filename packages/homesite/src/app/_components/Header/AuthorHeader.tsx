import FavouriteIcon from 'common/components/FavouriteIcon';
import { SimplifiedUser } from 'common/db/prisma';
import { FavouriteUser } from 'common/db/types';
import { withErrorBoundaryCustom } from 'common/utils/error';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import SearchComp from '../SearchComp';
import UserAct from '../UserAct';
import './Header.css';

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
      `${API_HOST}/api/favourite/users?${queryParse({
        userId: authorInfo.id,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json?.length > 0) {
        setFavouriteInfo(json[0]);
      }
    });
  }, [authorInfo]);

  const postFavouriteInfo = useCallback(() => {
    sendRequest(`${API_HOST}/api/favourite/users`, {
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
      `${API_HOST}/api/favourite/users?${queryParse({
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
      <div className="header__title">
        <span>{'Author / '}</span>
        <span className="header__title__name">{authorInfo.name}</span>
        {session && authorInfo.name !== session.user.name ? (
          <FavouriteIcon
            className="header__title__favourite-icon"
            style={{
              color: favouriteInfo ? undefined : 'transparent',
            }}
            onClick={() => {
              favouriteInfo ? deleteFavouriteInfo() : postFavouriteInfo();
            }}
          />
        ) : null}
      </div>
      <div className="header__content">
        <SearchComp />
        <UserAct />
      </div>
    </div>
  );
};

export default withErrorBoundaryCustom<AuthorHeaderProps>(AuthorHeader);
