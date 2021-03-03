// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table } from "antd";

import { useTranslation } from "react-i18next";

import { KristBlock } from "../../krist/api/types";
import { lookupBlocks, LookupBlocksOptions, LookupBlocksResponse } from "../../krist/api/lookup";
import { getTablePaginationSettings, handleLookupTableChange } from "../../utils/table";

import { ContextualAddress } from "../../components/ContextualAddress";
import { BlockHash } from "./BlockHash";
import { DateTime } from "../../components/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:blocks-table");

interface Props {
  // Number used to trigger a refresh of the blocks listing
  refreshingID?: number;
  setError?: Dispatch<SetStateAction<Error | undefined>>;
}

export function BlocksTable({ refreshingID, setError }: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupBlocksResponse>();
  const [options, setOptions] = useState<LookupBlocksOptions>({
    limit: 20,
    offset: 0,
    orderBy: "height",
    order: "DESC"
  });

  // Fetch the blocks from the API, mapping the table options
  useEffect(() => {
    debug("looking up blocks");
    setLoading(true);

    lookupBlocks(options)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [refreshingID, setError, options]);

  debug("results? %b  res.blocks.length: %d  res.count: %d  res.total: %d", !!res, res?.blocks?.length, res?.count, res?.total);

  return <Table<KristBlock>
    className="blocks-table"
    size="small"

    loading={loading}
    dataSource={res?.blocks || []}
    rowKey="height"

    // Triggered whenever the filter, sorting, or pagination changes
    onChange={handleLookupTableChange(setOptions)}
    pagination={getTablePaginationSettings(t, res, "blocks.tableTotal")}

    columns={[
      // Height
      {
        title: t("blocks.columnHeight"),
        dataIndex: "height", key: "height",

        render: height => height.toLocaleString(),
        width: 100
      },

      // Miner address
      {
        title: t("blocks.columnAddress"),
        dataIndex: "address", key: "address",

        render: address => address && (
          <ContextualAddress
            className="blocks-table-address"
            address={address}
            allowWrap
          />
        ),

        sorter: true
      },

      // Short hash
      {
        title: t("blocks.columnShortHash"),
        dataIndex: "short_hash", key: "short_hash",

        render: hash => <BlockHash hash={hash} />
      },

      // Full hash
      {
        title: t("blocks.columnHash"),
        dataIndex: "hash", key: "hash",

        render: hash => <BlockHash hash={hash} />,

        sorter: true
      },

      // Difficulty
      {
        title: t("blocks.columnDifficulty"),
        dataIndex: "difficulty", key: "difficulty",

        render: difficulty => difficulty.toLocaleString(),

        sorter: true
      },

      // Time
      {
        title: t("blocks.columnTime"),
        dataIndex: "time", key: "time",
        render: time => <DateTime date={time} />,
        width: 200,

        sorter: true,
        defaultSortOrder: "descend"
      }
    ]}
  />;
}