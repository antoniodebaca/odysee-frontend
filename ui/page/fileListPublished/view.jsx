// @flow
import type { DoFetchClaimListMine } from 'redux/actions/claims';

import './style.scss';
import * as PAGES from 'constants/pages';
import * as ICONS from 'constants/icons';
import React, { useEffect } from 'react';
import Button from 'component/button';
import ClaimList from 'component/claimList';
import ClaimPreview from 'component/claimPreview';
import Page from 'component/page';
import Paginate from 'component/common/paginate';
import { PAGE_PARAM, PAGE_SIZE_PARAM } from 'constants/claim';
import WebUploadList from 'component/webUploadList';
import Spinner from 'component/spinner';
import Yrbl from 'component/yrbl';
import classnames from 'classnames';

type FilterInfo = { key: string, cmd: string, label: string, ariaLabel?: string };

const FILTER: { [string]: FilterInfo } = Object.freeze({
  ALL: { key: 'ALL', cmd: 'stream,repost', label: 'All', ariaLabel: 'All uploads' },
  UPLOADS: { key: 'UPLOADS', cmd: 'stream', label: 'Uploads' },
  REPOSTS: { key: 'REPOSTS', cmd: 'repost', label: 'Reposts' },
});

type Props = {
  uploadCount: number,
  checkPendingPublishes: () => void,
  clearPublish: () => void,
  fetchClaimListMine: DoFetchClaimListMine,
  fetching: boolean,
  urls: Array<string>,
  urlTotal: number,
  history: { replace: (string) => void, push: (string) => void },
  page: number,
  pageSize: number,
};

function FileListPublished(props: Props) {
  const {
    uploadCount,
    checkPendingPublishes,
    clearPublish,
    fetchClaimListMine,
    fetching,
    urls,
    urlTotal,
    page,
    pageSize,
  } = props;

  const [filterBy, setFilterBy] = React.useState(FILTER.ALL.key);

  const params = React.useMemo(() => {
    return {
      [PAGE_PARAM]: Number(page),
      [PAGE_SIZE_PARAM]: Number(pageSize),
    };
  }, [page, pageSize]);

  function getHeaderJsx() {
    return (
      <div className={classnames('flp__header')}>
        <div className="flp__filter">
          {/* $FlowIgnore: mixed bug */}
          {Object.values(FILTER).map((info: FilterInfo) => (
            <Button
              button="alt"
              key={info.label}
              label={__(info.label)}
              aria-label={info.ariaLabel}
              onClick={() => setFilterBy(info.key)}
              className={classnames(`button-toggle`, { 'button-toggle--active': filterBy === info.key })}
            />
          ))}
        </div>
        <div className="flp__refresh">
          {!fetching && (
            <Button
              button="alt"
              label={__('Refresh')}
              icon={ICONS.REFRESH}
              onClick={() => fetchClaimListMine(params.page, params.page_size, true, FILTER[filterBy].cmd.split(','), true)}
            />
          )}
        </div>
      </div>
    );
  }

  function getClaimListResultsJsx() {
    return (
      <>
        {!!urls && (
          <>
            <ClaimList
              noEmpty
              persistedStorageKey="claim-list-published"
              uris={fetching ? [] : urls}
              loading={fetching}
            />
            {getFetchingPlaceholders()}
            <Paginate totalPages={urlTotal > 0 ? Math.ceil(urlTotal / Number(pageSize)) : 1} />
          </>
        )}
      </>
    );
  }

  function getFetchingPlaceholders() {
    return (
      <>
        {fetching &&
          new Array(Number(pageSize)).fill(1).map((x, i) => {
            return <ClaimPreview key={i} placeholder="loading" />;
          })}
      </>
    );
  }

  useEffect(() => {
    checkPendingPublishes();
  }, [checkPendingPublishes]);

  useEffect(() => {
    if (params && fetchClaimListMine) {
      fetchClaimListMine(params.page, params.page_size, true, FILTER[filterBy].cmd.split(','));
    }
  }, [uploadCount, params, filterBy, fetchClaimListMine]);

  return (
    <Page>
      <div className="card-stack">
        <WebUploadList />
        {getHeaderJsx()}
        {getClaimListResultsJsx()}
      </div>
      {!(urls && urls.length) && (
        <React.Fragment>
          {!fetching ? (
            <section className="main--empty">
              <Yrbl
                title={filterBy === FILTER.REPOSTS ? __('No Reposts') : __('No uploads')}
                subtitle={
                  filterBy === FILTER.REPOSTS
                    ? __("You haven't reposted anything yet.")
                    : __("You haven't uploaded anything yet. This is where you can find them when you do!")
                }
                actions={
                  filterBy !== FILTER.REPOSTS && (
                    <div className="section__actions">
                      <Button
                        button="primary"
                        navigate={`/$/${PAGES.UPLOAD}`}
                        label={__('Upload Something New')}
                        onClick={() => clearPublish()}
                      />
                    </div>
                  )
                }
              />
            </section>
          ) : (
            <section className="main--empty">
              <Spinner delayed />
            </section>
          )}
        </React.Fragment>
      )}
    </Page>
  );
}

export default FileListPublished;
