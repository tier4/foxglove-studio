// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { PanelExtensionContext } from "@foxglove/studio";
import Panel from "@foxglove/studio-base/components/Panel";
import { PanelExtensionAdapter } from "@foxglove/studio-base/components/PanelExtensionAdapter";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";
import { SaveConfig } from "@foxglove/studio-base/types/panels";

import { Number } from "./Number";
import { Config } from "./types";

function initPanel(context: PanelExtensionContext) {
  ReactDOM.render(
    <StrictMode>
      <ThemeProvider isDark>
        <Number context={context} />
      </ThemeProvider>
    </StrictMode>,
    context.panelElement,
  );
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}

type Props = {
  config: Config;
  saveConfig: SaveConfig<Config>;
};

function NumberPanelAdapter(props: Props) {
  return (
    <PanelExtensionAdapter
      config={props.config}
      saveConfig={props.saveConfig}
      initPanel={initPanel}
    />
  );
}

NumberPanelAdapter.panelType = "NumberPanel";
NumberPanelAdapter.defaultConfig = {};

export default Panel(NumberPanelAdapter);
