import { Affix, Form, Image, Popconfirm } from 'antd';
import { HighlightType } from 'db/prisma';
import { FavouriteWebsite, Website } from 'db/types';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withErrorBoundaryCustom } from '../utils/error';
import { API_HOST } from '../utils/http';
import { extractInfo } from '../utils/pdf';
import FavouriteForm, { FavouriteFormValues } from './FavouriteForm';
import FavouriteIcon from './FavouriteIcon';
import './Sidebar.css';
// const UserInfo = React.lazy(() => import('./UserInfo'));

interface SidebarProps {
  highlights: HighlightType[];
  url: string;
  pdfDocument: PDFDocumentProxy | null;
  appendButtons?: (highlights: HighlightType[]) => React.ReactNode;
}

const updateHash = (highlight: HighlightType) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar: React.FC<SidebarProps> = ({
  highlights,
  url,
  pdfDocument,
  appendButtons,
}) => {
  // const [sortedHighlights, setSortedHighlights] = useState<HighlightType[]>(highlights);
  const [websiteInfo, setWebsiteInfo] = useState<Website | null>(null);
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteWebsite | null>(
    null
  );

  const [form] = Form.useForm<FavouriteFormValues>();
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  // const isFavourite = useMemo(()=>{
  //   return Array.isArray(favouriteInfo)
  // }, [favouriteInfo])

  // useEffect(()=>{
  //   let sorted = highlights.sort((a, b) => {
  //     if (a.position.pageNumber == b.position.pageNumber) {
  //       return a.position.boundingRect.y1 - b.position.boundingRect.y1;
  //     }
  //     else {
  //       return a.position.pageNumber - b.position.pageNumber;
  //     }
  //   })
  //   setSortedHighlights(sorted);
  // }, [highlights])

  const getFavouriteInfo = useCallback(() => {
    if (!document.location.href.startsWith(API_HOST)) {
      chrome.runtime.sendMessage(
        { action: 'GET_FAVOURITE_WEBSITE_INFO', url },
        function (result: FavouriteWebsite[]) {
          if (result.length > 0) {
            setFavouriteInfo(result[0]);
          }
        }
      );
    }
  }, [setFavouriteInfo, url]);

  const updateFavouriteInfo = useCallback(
    (websiteRename: string, tag: string, isCreate = false) => {
      if (!document.location.href.startsWith(API_HOST)) {
        const params = isCreate
          ? {
              action: 'CREATE_FAVOURITE_WEBSITE_INFO',
              body: {
                websiteUrl: url,
                websiteRename,
                tag,
              },
            }
          : {
              action: 'UPDATE_FAVOURITE_WEBSITE_INFO',
              url,
              body: {
                websiteRename,
                tag,
              },
            };

        chrome.runtime.sendMessage(
          {
            ...params,
          },
          function (result) {
            getFavouriteInfo();
          }
        );
      }
    },
    [getFavouriteInfo, url]
  );

  const deleteFavouriteInfo = useCallback(() => {
    if (!document.location.href.startsWith(API_HOST)) {
      chrome.runtime.sendMessage(
        { action: 'DELETE_FAVOURITE_WEBSITE_INFO', url },
        function (result) {
          setFavouriteInfo(null);
        }
      );
    }
  }, [setFavouriteInfo, url]);

  const getWebsiteInfo = useCallback(
    (onEmpty?: () => void) => {
      if (!document.location.href.startsWith(API_HOST)) {
        chrome.runtime.sendMessage(
          { action: 'GET_WEBSITE_INFO', url },
          function (result: Website[]) {
            if (result.length > 0) {
              setWebsiteInfo(result[0]);
              getFavouriteInfo();
            } else {
              onEmpty?.();
            }
          }
        );
      }
    },
    [setWebsiteInfo, getFavouriteInfo, url]
  );

  const createWebsiteInfo = useCallback(async () => {
    if (!document.location.href.startsWith(API_HOST) && pdfDocument) {
      const pdfInfo = await extractInfo(pdfDocument);
      chrome.runtime.sendMessage(
        {
          action: 'CREATE_WEBSITE_INFO',
          body: { url, ...pdfInfo },
        },
        function (result) {
          getWebsiteInfo();
        }
      );
    }
  }, [getWebsiteInfo, url, pdfDocument]);

  useEffect(() => {
    if (url && pdfDocument) {
      getWebsiteInfo(() => {
        createWebsiteInfo();
      });
    }
  }, [getWebsiteInfo, createWebsiteInfo, url, pdfDocument]);

  const initialValues = useMemo(() => {
    if (websiteInfo) {
      return {
        websiteRename: websiteInfo.title || websiteInfo.url,
        tag: 'default',
      };
    }
    return {};
  }, [websiteInfo]);

  const confirmHandler = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        updateFavouriteInfo(values.websiteRename, values.tag, !favouriteInfo);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }, [form, updateFavouriteInfo, favouriteInfo]);

  const cancelHandler = useCallback(() => {
    if (favouriteInfo) {
      deleteFavouriteInfo();
      form.setFieldsValue(initialValues);
    }
  }, [deleteFavouriteInfo, form, favouriteInfo, initialValues]);

  return (
    <>
      <div className="sidebar" ref={setContainer}>
        <div className="sidebar__description">
          <div className="sidebar__description__title">
            <span>WebNotes</span>
            {!document.location.href.startsWith(API_HOST) && websiteInfo ? (
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
                onCancel={cancelHandler}
                okText="Confirm"
                cancelText="Delete"
              >
                <FavouriteIcon
                  className="sidebar__favourite__icon"
                  style={{
                    color: favouriteInfo ? undefined : 'transparent',
                  }}
                />
              </Popconfirm>
            ) : null}
          </div>

          {/* {document.location.href.startsWith(API_HOST) ? (
            <div
              style={{
                marginBottom: "10px",
              }}
            >
              <Suspense>
                <UserInfo />
              </Suspense>
            </div>
          ) : null} */}

          <div>
            <small>
              To create area highlight hold ⌥ Option key (Alt), then click and
              drag.
            </small>
          </div>
        </div>

        <ul className="sidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className="sidebar__highlight"
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                <strong>{highlight.comment?.text}</strong>
                {highlight.content.text ? (
                  <blockquote className="highlight__text">
                    {`${highlight.content.text.slice(0, 90).trim()}…`}
                  </blockquote>
                ) : null}
                {highlight.content.image ? (
                  <div className="highlight__image">
                    <Image src={highlight.content.image} alt={'Screenshot'} />
                  </div>
                ) : null}
              </div>
              <div className="highlight__location">
                Page {highlight.position.pageNumber}
              </div>
            </li>
          ))}
        </ul>

        <Affix offsetBottom={0} target={() => container}>
          {appendButtons?.(highlights)}
        </Affix>
      </div>
    </>
  );
};

export default withErrorBoundaryCustom<SidebarProps>(Sidebar);
