/** @jest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { renderHook, act } from "@testing-library/react-hooks";
import { useSnackbar } from "notistack";
import { PropsWithChildren } from "react";

import MockMessagePipelineProvider from "@foxglove/studio-base/components/MessagePipeline/MockMessagePipelineProvider";
import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
import CurrentUserContext, { User } from "@foxglove/studio-base/context/CurrentUserContext";
import { useLayoutManager } from "@foxglove/studio-base/context/LayoutManagerContext";
import PlayerSelectionContext, {
  PlayerSelection,
} from "@foxglove/studio-base/context/PlayerSelectionContext";
import {
  useInitialDeepLinkState,
  formatLayoutUrl,
} from "@foxglove/studio-base/hooks/useInitialDeepLinkState";
import { useSessionStorageValue } from "@foxglove/studio-base/hooks/useSessionStorageValue";
import EventsProvider from "@foxglove/studio-base/providers/EventsProvider";
import { LaunchPreferenceValue } from "@foxglove/studio-base/types/LaunchPreferenceValue";

jest.mock("@foxglove/studio-base/hooks/useSessionStorageValue");
jest.mock("@foxglove/studio-base/context/CurrentLayoutContext");
jest.mock("@foxglove/studio-base/context/LayoutManagerContext");
jest.mock("notistack");

global.fetch = jest.fn(
  async () =>
    await Promise.resolve({
      json: async () => await Promise.resolve({ test: 100 }),
      ok: true,
    }),
) as jest.Mock;

type WrapperProps = {
  currentUser?: User;
  playerSelection: PlayerSelection;
};

function makeWrapper(initialProps: WrapperProps) {
  const wrapperProps = initialProps;
  function setWrapperProps(props: Partial<WrapperProps>) {
    Object.assign(wrapperProps, props);
  }
  function wrapper({ children }: PropsWithChildren<unknown>) {
    const userContextValue = {
      currentUser: wrapperProps.currentUser,
      signIn: () => undefined,
      signOut: async () => undefined,
    };
    return (
      <MockMessagePipelineProvider
        topics={[]}
        datatypes={new Map()}
        capabilities={["hello"]}
        messages={[]}
        urlState={{ sourceId: "test", parameters: { url: "testurl", param: "one" } }}
        startTime={{ sec: 0, nsec: 1 }}
      >
        <CurrentUserContext.Provider value={userContextValue}>
          <EventsProvider>
            <PlayerSelectionContext.Provider value={wrapperProps.playerSelection}>
              {children}
            </PlayerSelectionContext.Provider>
          </EventsProvider>
        </CurrentUserContext.Provider>
      </MockMessagePipelineProvider>
    );
  }
  return { wrapper, setWrapperProps };
}

describe("Initial deep link state", () => {
  const selectSource = jest.fn();
  const setSelectedLayoutId = jest.fn();
  const saveNewLayout = jest.fn();
  const getLayouts = jest.fn();
  const emptyPlayerSelection = {
    selectSource,
    selectRecent: () => {},
    availableSources: [],
    recentSources: [],
    selectedSource: undefined,
  };

  beforeEach(() => {
    (useSessionStorageValue as jest.Mock).mockReturnValue([LaunchPreferenceValue.WEB, jest.fn()]);
    (useCurrentLayoutActions as jest.Mock).mockReturnValue({ setSelectedLayoutId });
    (useLayoutManager as jest.Mock).mockReturnValue({ saveNewLayout, getLayouts });
    (useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: jest.fn() });
    selectSource.mockClear();
    setSelectedLayoutId.mockClear();
    saveNewLayout.mockReturnValue(Promise.resolve({ id: 1234 }));
    getLayouts.mockReturnValue(Promise.resolve([]));
  });

  it("doesn't select a source without ds params", () => {
    const { wrapper } = makeWrapper({ playerSelection: emptyPlayerSelection });
    renderHook(() => useInitialDeepLinkState(["https://studio.foxglove.dev/?foo=bar"]), {
      wrapper,
    });

    expect(selectSource).not.toHaveBeenCalled();
  });

  it("selects the sample datasource from the link", () => {
    const { wrapper } = makeWrapper({ playerSelection: emptyPlayerSelection });
    renderHook(() => useInitialDeepLinkState(["https://studio.foxglove.dev/?ds=sample-nuscenes"]), {
      wrapper,
    });

    expect(selectSource).toHaveBeenCalledWith("sample-nuscenes", {
      params: undefined,
      type: "connection",
    });
    expect(setSelectedLayoutId).not.toHaveBeenCalled();
  });

  it("selects a connection datasource from the link", () => {
    const { wrapper } = makeWrapper({ playerSelection: emptyPlayerSelection });
    renderHook(
      () =>
        useInitialDeepLinkState([
          "http://localhost:8080/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2Flocalhost%3A9090&layoutId=a288e116-d177-4b57-8f30-6ada61919638",
        ]),
      { wrapper },
    );

    expect(selectSource).toHaveBeenCalledWith("rosbridge-websocket", {
      params: { url: "ws://localhost:9090" },
      type: "connection",
    });
    expect(setSelectedLayoutId).toHaveBeenCalledWith("a288e116-d177-4b57-8f30-6ada61919638");
  });

  it("waits for a current user to select a data platform source", () => {
    const { wrapper, setWrapperProps } = makeWrapper({
      currentUser: undefined,
      playerSelection: emptyPlayerSelection,
    });
    const { result, rerender } = renderHook(
      () =>
        useInitialDeepLinkState([
          "https://studio.foxglove.dev/?ds=foxglove-data-platform&ds.deviceId=dev&layoutId=12345",
        ]),
      { wrapper },
    );

    expect(result.current.currentUserRequired).toBeTruthy();

    expect(selectSource).not.toHaveBeenCalled();

    const org: User["org"] = {
      id: "fake-orgid",
      slug: "fake-org",
      displayName: "Fake Org",
      isEnterprise: false,
      allowsUploads: false,
      supportsEdgeSites: false,
    };

    setWrapperProps({
      currentUser: {
        id: "id",
        email: "email",
        orgId: org.id,
        orgDisplayName: org.displayName,
        orgSlug: org.slug,
        orgPaid: true,
        org,
      },
      playerSelection: emptyPlayerSelection,
    });
    rerender();

    expect(selectSource).toHaveBeenCalledWith("foxglove-data-platform", {
      params: { deviceId: "dev" },
      type: "connection",
    });

    expect(setSelectedLayoutId).toHaveBeenCalledWith("12345");
  });

  it("opens and saves a layout from url and opens it", async () => {
    const { wrapper } = makeWrapper({ playerSelection: emptyPlayerSelection });
    renderHook(
      () =>
        useInitialDeepLinkState([
          "https://studio.foxglove.dev/?layoutUrl=http%3A%2F%2Flocalhost%2flayout.json",
        ]),
      {
        wrapper,
      },
    );

    // Required to wait for the async callback to have completed
    await act(async () => {
      await new Promise((resolve) => process.nextTick(resolve));
    });

    expect(fetch).toHaveBeenCalled();
    expect(saveNewLayout).toHaveBeenCalledWith({
      name: "layout",
      data: { test: 100 },
      permission: "CREATOR_WRITE",
    });
    expect(setSelectedLayoutId).toHaveBeenCalledWith(1234);

    return;
  });

  it("formats layoutUrls into the correct style when naming layouts", () => {
    const simpleUrl = new URL("http://localhost/layout.json");
    expect(formatLayoutUrl(simpleUrl)).toBe("layout");

    const urlWithFolder = new URL("http://localhost/layout/demo.json");
    expect(formatLayoutUrl(urlWithFolder)).toBe("demo");

    const s3PreSignedUrl = new URL(
      "https://im-a-bucket.s3.amazonaws.com/folder/debug.json?AWSAccessKeyId=xxxxxx&Signature=xxxxxx&x-amz-security-token=xxxx&Expires=0",
    );
    expect(formatLayoutUrl(s3PreSignedUrl)).toBe("debug");
  });
});
