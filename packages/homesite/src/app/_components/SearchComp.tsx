import { highlightKeywords } from '@/_lib/utils';
import { ExportOutlined } from '@ant-design/icons';
import {
  Checkbox,
  Collapse,
  Divider,
  Input,
  List,
  Modal,
  Skeleton,
} from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { SearchProps } from 'antd/es/input/Search';
import { SimplifiedUser } from 'common/db/prisma';
import { Website } from 'common/db/types';
import { withErrorBoundaryCustom } from 'common/utils/error';
import { queryParse, sendRequest } from 'common/utils/http';
import React, { useCallback, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import './SearchComp.css';
import UserDisplay from './UserDisplay';

const { Search } = Input;

enum SearchSource {
  USER = 'User',
  URL = 'Url',
  KEYWORD = 'Keyword',
}

interface SearchResultType {
  author_result?: SimplifiedUser[];
  url_result?: Website[];
  keyword_result?: Website[];
  keyword_result_total?: number;
}

const SearchComp: React.FC = () => {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResultType>({});
  const [loadingMoreData, setLoadingMoreData] = useState(false);

  const onSearch: SearchProps['onSearch'] = useCallback(
    (value: string) => {
      setLoadingSearch(true);

      const promises = [];
      if (checkedValues.includes(SearchSource.USER)) {
        promises.push(
          sendRequest<SimplifiedUser[]>(
            `/api/search/authors?${queryParse({ regexp: value })}`,
            {
              method: 'GET',
            }
          )
        );
      }

      const includes_url = checkedValues.includes(SearchSource.URL);
      const includes_keyword = checkedValues.includes(SearchSource.KEYWORD);
      if (includes_url || includes_keyword) {
        promises.push(
          sendRequest<{
            url_result: Website[];
            keyword_result: Website[];
          }>(
            `/api/search/websites?${queryParse({
              url_regexp: includes_url ? value : undefined,
              keyword_regexp: includes_keyword ? value : undefined,
            })}`,
            {
              method: 'GET',
            }
          )
        );
      }

      let search_result = {};
      Promise.all(promises)
        .then((values) => {
          values.forEach((value) => {
            search_result = {
              ...search_result,
              ...value,
            };
          });
          setInput(value);
          setSearchResult(search_result);
          setLoadingSearch(false);
        })
        .catch((error) => {
          console.log(error.message);
          setLoadingSearch(false);
        });
    },
    [checkedValues, setSearchResult, setLoadingSearch]
  );

  const loadMoreData = useCallback(() => {
    if (loadingMoreData || !checkedValues.includes(SearchSource.KEYWORD)) {
      return;
    }
    setLoadingMoreData(true);

    sendRequest<{
      url_result: Website[];
      keyword_result: Website[];
    }>(
      `/api/search/websites?${queryParse({
        keyword_regexp: input,
        offset: String(searchResult.keyword_result?.length || 0),
      })}`,
      {
        method: 'GET',
      }
    )
      .then((value) => {
        setSearchResult({
          ...searchResult,
          keyword_result: searchResult.keyword_result?.concat(
            value.keyword_result
          ),
        });
        setLoadingMoreData(false);
      })
      .catch((error) => {
        console.log(error.message);
        setLoadingMoreData(false);
      });
  }, [
    loadingMoreData,
    checkedValues,
    searchResult,
    input,
    setLoadingMoreData,
    setSearchResult,
  ]);

  const onChange: CheckboxGroupProps['onChange'] = useCallback(
    (checkedValues: CheckboxValueType[]) => {
      setCheckedValues(checkedValues as string[]);
    },
    [setCheckedValues]
  );

  const items = useMemo(() => {
    if (!searchResult.keyword_result) {
      return [];
    }
    return searchResult.keyword_result.map((item) => {
      return {
        key: String(item.id),
        label: (
          <div className="search__keyword-result__label">
            {highlightKeywords(item.title || '', input)}
          </div>
        ),
        children: (
          <div className="search__keyword-result__content">
            {highlightKeywords(item.abstract || '', input)}
          </div>
        ),
        extra: (
          <ExportOutlined onClick={() => window.open(item.url, '_blank')} />
        ),
      };
    });
  }, [searchResult.keyword_result, input]);

  return (
    <>
      <Search
        className="search__input"
        placeholder="user / url / keywords"
        onClick={() => setOpen(true)}
      />

      <Modal
        className="search__modal"
        title={null}
        width={'70%'}
        open={open}
        footer={null}
        closeIcon={false}
        onCancel={() => setOpen(false)}
      >
        <div>
          <Search
            className="search__modal__input"
            placeholder="user / url / keywords"
            loading={loadingSearch}
            onSearch={onSearch}
          />
          <Checkbox.Group
            options={[
              SearchSource.USER,
              SearchSource.URL,
              SearchSource.KEYWORD,
            ]}
            onChange={onChange}
          />
        </div>

        {!!searchResult.author_result?.length && (
          <>
            <Divider />
            <div className="search__user-result">{SearchSource.USER}</div>
            <div>
              {searchResult.author_result.map((item) => (
                <UserDisplay key={item.id} user={item} keyword={input} />
              ))}
            </div>
          </>
        )}

        {!!searchResult.url_result?.length && (
          <>
            <Divider />
            <div className="search__url-result">{SearchSource.URL}</div>
            <List
              className="search__url-result__list"
              itemLayout="horizontal"
              dataSource={searchResult.url_result}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <a href={item.url} target="_blank">
                        {item.title}
                      </a>
                    }
                    description={highlightKeywords(item.url || '', input)}
                  />
                </List.Item>
              )}
            />
          </>
        )}

        {!!searchResult.keyword_result?.length && (
          <>
            <Divider />
            <div className="search__keyword-result">{SearchSource.KEYWORD}</div>
            <div id="scrollableDiv">
              <InfiniteScroll
                dataLength={items.length}
                next={loadMoreData}
                hasMore={
                  items.length < (searchResult.keyword_result_total || 50)
                }
                loader={<Skeleton paragraph={{ rows: 1 }} active />}
                endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                scrollableTarget="scrollableDiv"
              >
                <Collapse items={items} ghost expandIconPosition="end" />
              </InfiniteScroll>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default withErrorBoundaryCustom(SearchComp);
