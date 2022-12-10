// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ErrorLogListItem, { ErrorLogListEmptyItem } from "./ErrorLogListItem";

export default {
  component: ErrorLogListItem,
  title: 'components/ErrorLogListItem',
};

export const Default = (): JSX.Element => (
  <ErrorLogListItem
    index={1}
    isSelected={false}
    item={{ error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' }}
    hasFeedback={true}
    handleClickItem={console.log}
    handleClickFeedback={console.log}
  />
);

export const NoFeedback = (): JSX.Element => (
  <ErrorLogListItem
    index={1}
    isSelected={false}
    item={{ error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' }}
    hasFeedback={false}
    handleClickItem={console.log}
    handleClickFeedback={console.log}
  />
);

export const Selected = (): JSX.Element => (
  <ErrorLogListItem
    index={1}
    isSelected={true}
    item={{ error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' }}
    hasFeedback={true}
    handleClickItem={console.log}
    handleClickFeedback={console.log}
  />
);

export const Empty = (): JSX.Element => (
  <ErrorLogListEmptyItem />
);
