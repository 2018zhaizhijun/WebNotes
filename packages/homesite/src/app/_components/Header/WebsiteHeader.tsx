import { Form, Popconfirm } from 'antd';
import FavouriteForm, {
  FavouriteFormValues,
} from 'common/components/FavouriteForm';
import FavouriteIcon from 'common/components/FavouriteIcon';
import { FavouriteWebsite, Website } from 'common/db/types';
import { withErrorBoundaryCustom } from 'common/utils/error';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SearchComp from '../SearchComp';
import UserAct from '../UserAct';
import './Header.css';

interface WebsiteHeaderProps {
  websiteInfo: Website;
}

const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ websiteInfo }) => {
  const { title, url } = websiteInfo;
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteWebsite | null>(
    null
  );
  const [form] = Form.useForm<FavouriteFormValues>();

  const getFavouriteInfo = useCallback(() => {
    sendRequest<FavouriteWebsite[]>(
      `${API_HOST}/api/favourite/websites?${queryParse({ url })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json.length > 0) {
        setFavouriteInfo(json[0]);
      }
    });
  }, [url]);

  const postFavouriteInfo = useCallback(
    (websiteRename: string, tag: string) => {
      sendRequest(`${API_HOST}/api/favourite/websites`, {
        method: 'POST',
        body: JSON.stringify({
          websiteUrl: url,
          websiteRename,
          tag,
        }),
      }).then(() => {
        getFavouriteInfo();
      });
    },
    [url, getFavouriteInfo]
  );

  const updateFavouriteInfo = useCallback(
    (websiteRename: string, tag: string) => {
      sendRequest(`${API_HOST}/api/favourite/websites?${queryParse({ url })}`, {
        method: 'PUT',
        body: JSON.stringify({
          websiteRename,
          tag,
        }),
      }).then(() => {
        getFavouriteInfo();
      });
    },
    [url, getFavouriteInfo]
  );

  const deleteFavouriteInfo = useCallback(() => {
    sendRequest(`${API_HOST}/api/favourite/websites?${queryParse({ url })}`, {
      method: 'DELETE',
    }).then(() => {
      setFavouriteInfo(null);
    });
  }, [url, setFavouriteInfo]);

  useEffect(() => {
    if (url) {
      getFavouriteInfo();
    }
  }, [url, getFavouriteInfo]);

  const confirmHandler = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        favouriteInfo
          ? updateFavouriteInfo(values.websiteRename, values.tag)
          : postFavouriteInfo(values.websiteRename, values.tag);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }, [form, updateFavouriteInfo, postFavouriteInfo, favouriteInfo]);

  const initialValues = useMemo(() => {
    if (websiteInfo) {
      return {
        websiteRename: websiteInfo.title || websiteInfo.url,
        tag: 'default',
      };
    }
    return {};
  }, [websiteInfo]);

  return (
    <div className="header">
      <div className="header__title">
        <span>{'Website / '}</span>
        <span className="header__title__name">{title || url}</span>
        {url ? (
          <Popconfirm
            icon={null}
            title="Favourite the website"
            description={
              <FavouriteForm
                form={form}
                initialValues={{
                  websiteRename:
                    favouriteInfo?.websiteRename ||
                    initialValues.websiteRename ||
                    '',
                  tag: favouriteInfo?.tag || initialValues.tag || '',
                }}
              />
            }
            onConfirm={confirmHandler}
            onCancel={() => {
              if (favouriteInfo) {
                deleteFavouriteInfo();
                form.setFieldsValue(initialValues);
              }
            }}
            okText="Confirm"
            cancelText="Delete"
          >
            <FavouriteIcon
              className="header__title__favourite-icon"
              style={{
                color: favouriteInfo ? undefined : 'transparent',
              }}
            />
          </Popconfirm>
        ) : null}
      </div>
      <div className="header__content">
        <SearchComp />
        <UserAct />
      </div>
    </div>
  );
};

export default withErrorBoundaryCustom<WebsiteHeaderProps>(WebsiteHeader);
