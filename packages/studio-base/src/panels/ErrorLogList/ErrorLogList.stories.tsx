// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ErrorLogList from "./ErrorLogList";

export default {
  component: ErrorLogList,
  title: 'components/ErrorLogList',
};

export const Default = (): JSX.Element => (
  <ErrorLogList
    errorLogs={[
      { error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' },
      { error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' },
      { error_message: "テストエラー", error_contents: "Error", error_score: 5, timestamp: '12345' },
    ]}
  />
);
