// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// What each connection from a devtools page is debugging.
let portToTargets = new Map();

// Which devtools page cares about a particular tab or target. These are keyed
// by just the respective ID.
let tabIdToPort = new Map();
let targetIdToPort = new Map();

function enableInterestGroupTracking(debuggee) {
  chrome.debugger.sendCommand(debuggee, 'Storage.setInterestGroupTracking', {
    enable: true,
  });
}

function enableInterestGroupAuctionTracking(debuggee) {
  chrome.debugger.sendCommand(debuggee, 'Storage.setInterestGroupAuctionTracking', { enable: true });
}

function enableNetworkEvents(debuggee) {
  chrome.debugger.sendCommand(debuggee, 'Network.enable', {});
}

chrome.runtime.onConnect.addListener(connectListener);

function connectListener(devtoolsPagePort) {
  function onMessage(message, sender) {
    let debuggee = { tabId: message.tabId };
    connectToTab(devtoolsPagePort, debuggee);
  }

  devtoolsPagePort.onMessage.addListener(onMessage);
  devtoolsPagePort.onDisconnect.addListener(() => {
    disconnectFromTab(devtoolsPagePort);
    devtoolsPagePort.onMessage.removeListener(onMessage);
  });
}

function connectToTab(devtoolsPagePort, debuggee) {
  portToTargets.set(devtoolsPagePort, [debuggee]);
  tabIdToPort.set(debuggee.tabId, devtoolsPagePort);
  chrome.debugger.attach(debuggee, '1.3', () => {
    // Pay attention to child frames, to enable auction events on them.
    // Using flatten: true here would simplify things, but sadly the
    // 'debugger' extension API doesn't appear to understand it.
    //
    // waitForDebuggerOnStart gives us a window to enable tracking before any
    // auctions run.
    chrome.debugger.sendCommand(debuggee, 'Target.setAutoAttach', {
      autoAttach: true,
      flatten: false,
      waitForDebuggerOnStart: true,
      filter: [{ type: 'iframe' }],
    });
    enableInterestGroupTracking(debuggee);
    enableInterestGroupAuctionTracking(debuggee);
    enableNetworkEvents(debuggee);
  });
}

function disconnectFromTab(devtoolsPagePort, onMessage) {
  let debuggees = portToTargets.get(devtoolsPagePort);
  for (let debuggee of debuggees) {
    chrome.debugger.detach(debuggee);
    if (debuggee.tabId) {
      tabIdToPort.delete(debuggee.tabId);
    } else {
      targetIdToPort.delete(debuggee.targetId);
    }
  }
  portToTargets.delete(devtoolsPagePort);
}

chrome.debugger.onEvent.addListener((source, method, params) => {
  // This is useful for debugging things:
  // console.log(
  //    method + "/" + JSON.stringify(params) + " /" + JSON.stringify(source));
  let port = null;
  if (source.tabId) {
    port = tabIdToPort.get(source.tabId);
  } else if (source.targetId) {
    port = targetIdToPort.get(source.targetId);
  }

  if (port) {
    // Forward the messages extension cares about.
    if (
      method === 'Storage.interestGroupAccessed' ||
      method === 'Storage.interestGroupAuctionEventOccurred' ||
      method === 'Storage.interestGroupAuctionNetworkRequestCreated' ||
      method === 'Network.requestWillBeSent' ||
      method === 'Network.loadingFinished' ||
      method === 'Network.loadingFailed'
    ) {
      port.postMessage({ method: method, params: params });
    }

    // Pay attention to frames.
    if (method === 'Target.attachedToTarget') {
      let targetId = params.targetInfo.targetId;
      let childDebuggee = { targetId: targetId };
      targetIdToPort.set(targetId, port);
      portToTargets.get(port).push(childDebuggee);
      chrome.debugger.attach(childDebuggee, '1.3', () => {
        // Child frames don't need setInterestGroupTracking since
        // interestGroupAccessed is global anyway.
        enableInterestGroupAuctionTracking(childDebuggee);
        enableNetworkEvents(childDebuggee);

        // In non-flat mode, we must send runIfWaitingForDebugger via
        // sendMessageToTarget for it to actually work.
        const message = {
          id: 0,
          method: 'Runtime.runIfWaitingForDebugger',
          params: {},
        };
        chrome.debugger.sendCommand(source, 'Target.sendMessageToTarget', {
          message: JSON.stringify(message),
          targetId: targetId,
        });
      });
    }

    if (method === 'Target.detachedFromTarget') {
      let targetId = params.targetId;
      let childDebuggee = { targetId: targetId };
      // If seems like the extension API doesn't detach on some iframes, so
      // try to be sure.
      chrome.debugger.detach(childDebuggee);
      targetIdToPort.delete(targetId);
      // This is pretty awful complexity-wise; it would be better to use a set,
      // but that would require encoding target down to a string key.
      let remainingTargets = portToTargets.get(port).filter((t) => {
        return t.tabId || t.targetId !== targetId;
      });
      portToTargets.set(port, remainingTargets);
    }
  }
});
