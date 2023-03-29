// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { fireEvent, screen } from "@testing-library/dom";

import MultiProvider from "@foxglove/studio-base/components/MultiProvider";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import LayoutManagerContext from "@foxglove/studio-base/context/LayoutManagerContext";
import PanelCatalogContext, {
  PanelCatalog,
  PanelInfo,
} from "@foxglove/studio-base/context/PanelCatalogContext";
import MockCurrentLayoutProvider from "@foxglove/studio-base/providers/CurrentLayoutProvider/MockCurrentLayoutProvider";
import EventsProvider from "@foxglove/studio-base/providers/EventsProvider";
import { ILayoutStorage, Layout, LayoutID } from "@foxglove/studio-base/services/ILayoutStorage";
import LayoutManager from "@foxglove/studio-base/services/LayoutManager/LayoutManager";
import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import Workspace from "./Workspace";

export default {
  title: "Workspace",
  component: Workspace,
  parameters: {
    colorScheme: "light",
  },
};

class MockPanelCatalog implements PanelCatalog {
  static #fakePanel: PanelInfo = {
    title: "Fake Panel",
    type: "Fake",
    module: async () => {
      return {
        default: Panel(
          Object.assign(
            () => (
              <>
                <PanelToolbar />
                <div>I’m a fake panel</div>
              </>
            ),
            { panelType: "Fake", defaultConfig: {} },
          ),
        ),
      };
    },
  };
  public getPanels(): readonly PanelInfo[] {
    return [MockPanelCatalog.#fakePanel];
  }
  public getPanelByType(_type: string): PanelInfo | undefined {
    return MockPanelCatalog.#fakePanel;
  }
}

class MockLayoutStorage implements ILayoutStorage {
  private storage: { [namespace: string]: { [id: LayoutID]: Layout } };

  public constructor() {
    this.storage = {};
  }

  public async list(namespace: string): Promise<readonly Layout[]> {
    return Object.values(this.storage[namespace] ?? {});
  }
  public async get(namespace: string, id: LayoutID): Promise<Layout | undefined> {
    return this.storage[namespace]?.[id];
  }
  public async put(namespace: string, layout: Layout): Promise<Layout> {
    const namespaceStorage = this.storage[namespace] ?? {};
    namespaceStorage[layout.id] = layout;
    this.storage[namespace] = namespaceStorage;

    return layout;
  }
  public async delete(namespace: string, id: LayoutID): Promise<void> {
    delete this.storage[namespace]?.[id];
  }

  public async importLayouts(params: {
    fromNamespace: string;
    toNamespace: string;
  }): Promise<void> {
    const fromNamespaceStorage = this.storage[params.fromNamespace] ?? {};
    const toNamespaceStorage = this.storage[params.toNamespace] ?? {};

    const newToNamespaceStorage = {
      ...toNamespaceStorage,
      ...JSON.parse(JSON.stringify(fromNamespaceStorage) ?? "{}"),
    };
    this.storage[params.toNamespace] = newToNamespaceStorage;
  }
}

export function Basic(): JSX.Element {
  const providers = [
    /* eslint-disable react/jsx-key */
    <PanelSetup>{undefined}</PanelSetup>,
    <EventsProvider />,
    <PanelCatalogContext.Provider value={new MockPanelCatalog()} />,
    <MockCurrentLayoutProvider initialState={{ layout: "Fake" }} />,
    <LayoutManagerContext.Provider
      value={new LayoutManager({ local: new MockLayoutStorage(), remote: undefined })}
    />,
    /* eslint-enable react/jsx-key */
  ];
  return (
    <MultiProvider providers={providers}>
      <Workspace />
    </MultiProvider>
  );
}

export const FullscreenPanel = Basic.bind({});
Object.assign(FullscreenPanel, {
  play: async () => {
    fireEvent.click(await screen.findByTestId("panel-menu"));
    fireEvent.click(await screen.findByTestId("panel-menu-fullscreen"));
  },
});
