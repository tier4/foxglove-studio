// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { PanelExtensionContext } from "@lichtblick/suite";
import Panel from "@lichtblick/suite-base/components/Panel";
import { PanelExtensionAdapter } from "@lichtblick/suite-base/components/PanelExtensionAdapter";
import ThemeProvider from "@lichtblick/suite-base/theme/ThemeProvider";
import { SaveConfig } from "@lichtblick/suite-base/types/panels";

import { TrafficLight } from "./TrafficLight";
import { Config } from "./types";

function initPanel(context: PanelExtensionContext) {
  ReactDOM.render(
    <StrictMode>
      <ThemeProvider isDark>
        <TrafficLight context={context} />
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

function TrafficLightPanelAdapter(props: Props) {
  return (
    <PanelExtensionAdapter
      config={props.config}
      saveConfig={props.saveConfig}
      initPanel={initPanel}
    />
  );
}

TrafficLightPanelAdapter.panelType = "TrafficLightPanel";
TrafficLightPanelAdapter.defaultConfig = {};

export default Panel(TrafficLightPanelAdapter);
