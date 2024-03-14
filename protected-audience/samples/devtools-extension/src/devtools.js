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

let queuedMessages = [];
let panelDocument = null;
let globalStateInited = false;

// Contains: {startTime:, childAuctionsBox:, eventTable:, configBox:};
// keyed by return value of auctionStateKey().
let auctionState = new Map();

// Contains: {auction:, type:}
let auctionsForRequestId = new Map();
// Contains {wallTime:, timestamp:}
let timeInfoForRequestId = new Map();

// Since requestWillBeSent and interestGroupAuctionNetworkEvent can happen
// in any order, we have to hang on to messages for a bit to see if their
// relevance to auctions is simply not yet known.
let deferredRequestWillBeSentForRequestId = new Map();

// The events are displayed in 3 different kinds of tables:
const kGlobalTable = 'globals';
const kComponentAuctionTable = 'component_auction';
const kTopAuctionTable = 'top_auction';

// Classifies the kind of table a given event is relevant to.
function messageTable(message) {
  if (!message.params.uniqueAuctionId) {
    return kGlobalTable;
  }

  if (message.params.parentAuctionId) {
    return kComponentAuctionTable;
  }

  return kTopAuctionTable;
}

// Returns timestamp for an interest-group related event `message`.
function messageTime(message) {
  if (message.method === 'Storage.interestGroupAuctionEventOccurred') {
    return message.params.eventTime;
  }
  return message.params.accessTime;
}

// Helps decode timestamps in network-related events, which are only convertible
// to global time in context of corresponding Network.requestWillBeSent.
function networkTime(requestId, timestamp) {
  let timeInfo = timeInfoForRequestId.get(requestId);
  // Somehow missed the start event?
  if (!timeInfo) {
    return undefined;
  }
  return timeInfo.wallTime + (timestamp - timeInfo.timestamp);
}

function messageAuctionId(message) {
  return message.params.uniqueAuctionId;
}

// Computes a key for the `auctionState` map.
function auctionStateKey(maybeAuctionId) {
  return maybeAuctionId ? 'auction_' + maybeAuctionId : 'Global';
}

function createEventsTable(tableKind) {
  const table = panelDocument.createElement('table');
  table.border = '1';
  table.rules = 'cols';
  table.cellPadding = '5';

  const tHead = table.createTHead();
  tHead.style.borderBottom = '1px solid black';

  const headRow = panelDocument.createElement('tr');
  tHead.appendChild(headRow);

  const columns = ['Time', 'Event', 'IG Origin', 'IG Name', 'Component Seller', 'Bid', 'Bid Currency'].filter((c) => {
    if (tableKind === kTopAuctionTable) return true;
    if (c === 'Component Seller') return false;
    if (tableKind === kGlobalTable && (c === 'Bid' || c === 'Bid Currency')) {
      return false;
    }
    return true;
  });

  for (const column of columns) {
    const header = panelDocument.createElement('th');
    header.textContent = column;
    headRow.appendChild(header);
  }

  table.createTBody();
  return table;
}

function formatTime(auctionInfo, message) {
  const timeVal = messageTime(message);

  return auctionInfo.startTime
    ? `${((timeVal - auctionInfo.startTime) * 1000).toFixed(2)}ms`
    : new Date(timeVal * 1000);
}

function initGlobalState() {
  if (globalStateInited) {
    return;
  }
  globalStateInited = true;

  const eventContainer = panelDocument.getElementById('global');
  const table = createEventsTable(kGlobalTable);
  eventContainer.appendChild(table);

  const globalState = {
    eventTable: table,
  };
  auctionState.set('Global', globalState);
}

function handleAuctionStart(message) {
  const auctionId = messageAuctionId(message);
  const auctionContainer = panelDocument.createElement('div');
  auctionContainer.classList.add('auction');
  const headerBox = panelDocument.createElement('div');
  const header = panelDocument.createElement('h3');

  header.textContent = message.params.parentAuctionId
    ? `Component auction by ${message.params.auctionConfig.seller}`
    : `Auction by ${message.params.auctionConfig.seller} at ${new Date(messageTime(message) * 1000)}`;

  headerBox.appendChild(header);
  auctionContainer.appendChild(headerBox);

  const nestedBox = panelDocument.createElement('div');
  const messagesBox = createEventsTable(message.params.parentAuctionId ? kComponentAuctionTable : kTopAuctionTable);
  const configBox = panelDocument.createElement('pre');

  auctionContainer.appendChild(configBox);
  auctionContainer.appendChild(nestedBox);
  auctionContainer.appendChild(messagesBox);

  const auctionInfo = {
    startTime: messageTime(message),
    childAuctionsBox: nestedBox,
    eventTable: messagesBox,
    configBox: configBox,
  };
  auctionState.set(auctionStateKey(auctionId), auctionInfo);

  if (message.params.parentAuctionId) {
    let parentState = auctionState.get(auctionStateKey(message.params.parentAuctionId));
    parentState.childAuctionsBox.appendChild(auctionContainer);
  } else {
    panelDocument.getElementById('auctions').appendChild(auctionContainer);
  }
}

function handleNetworkMessage(message) {
  let requestId = message.params.requestId;
  let auctionInfo = auctionsForRequestId.get(requestId);

  if (!auctionInfo) {
    // Probably an unrelated request, but maybe we just don't know of its relevance yet.
    if (message.method === 'Network.requestWillBeSent') {
      deferredRequestWillBeSentForRequestId.set(requestId, message);
    } else {
      // Request is finished; at this point it's clearly unrelated.
      deferredRequestWillBeSentForRequestId.delete(requestId);
    }
    return;
  }
  let { auctions, type } = auctionInfo;
  let prefix;
  let time;
  let cleanup = false;

  switch (message.method) {
    case 'Network.requestWillBeSent':
      prefix = 'Start fetch ';
      time = message.params.wallTime;
      timeInfoForRequestId.set(requestId, {
        wallTime: message.params.wallTime,
        timestamp: message.params.timestamp,
      });
      break;
    case 'Network.loadingFinished':
      prefix = 'Finish fetch ';
      time = networkTime(requestId, message.params.timestamp);
      cleanup = true;
      break;
    case 'Network.loadingFailed':
      prefix = 'Fail fetch ';
      time = networkTime(requestId, message.params.timestamp);
      cleanup = true;
      break;
  }
  if (cleanup) {
    auctionsForRequestId.delete(requestId);
    timeInfoForRequestId.delete(requestId);
  }
  // Synthesize fake `auction messages` for each relevant auction, and handle them.
  for (const auctionId of auctions) {
    const fakeMessage = {
      method: 're-formated network event',
      params: {
        type: prefix + type,
        uniqueAuctionId: auctionId,
        accessTime: time,
      },
    };
    handleMessage(fakeMessage);
  }
}

function handleMessage(message) {
  if (message.method === 'Storage.interestGroupAuctionEventOccurred' && message.params.type === 'started') {
    handleAuctionStart(message);
    // Not returning since we do want to print it to the log.
  }

  if (message.method === 'Storage.interestGroupAuctionNetworkRequestCreated') {
    const requestId = message.params.requestId;
    auctionsForRequestId.set(requestId, {
      auctions: message.params.auctions,
      type: message.params.type,
    });
    const deferredMessage = deferredRequestWillBeSentForRequestId.get(requestId);
    if (deferredMessage) {
      handleNetworkMessage(deferredMessage);
      deferredRequestWillBeSentForRequestId.delete(requestId);
    }
    return;
  }

  if (message.method.startsWith('Network.')) {
    handleNetworkMessage(message);
    return;
  }

  const state = auctionState.get(auctionStateKey(messageAuctionId(message)));
  const tableKind = messageTable(message);

  if (
    message.method === 'Storage.interestGroupAuctionEvent' &&
    (message.params.type === 'started' || message.params.type === 'configResolved')
  ) {
    state.configBox.textContent = JSON.stringify(message.params.auctionConfig, null, 2);
  }

  const eventRow = panelDocument.createElement('tr');
  eventRow.insertCell(-1).textContent = formatTime(state, message);

  const type = panelDocument.createElement('b');
  type.textContent = message.params.type;
  eventRow.insertCell(-1).appendChild(type);

  eventRow.insertCell(-1).textContent = message.params.ownerOrigin;
  eventRow.insertCell(-1).textContent = message.params.name;

  if (tableKind === kTopAuctionTable) {
    eventRow.insertCell(-1).textContent = message.params.componentSellerOrigin;
  }

  if (tableKind !== kGlobalTable) {
    eventRow.insertCell(-1).textContent = message.params.bid;
    eventRow.insertCell(-1).textContent = message.params.bidCurrency;
  }

  state.eventTable.tBodies[0].appendChild(eventRow);
}

chrome.devtools.panels.create('Protected Audience', 'icon.png', 'panel.html', (newPanel) => {
  newPanel.onShown.addListener((newPanelWindow) => {
    panelDocument = newPanelWindow.document;
    initGlobalState();
    for (const message of queuedMessages) {
      handleMessage(message);
    }
    queuedMessages = [];
  });

  newPanel.onHidden.addListener(() => {
    panelDocument = null;
  });
});

// Connect to background page and relay the tab ID.
var backgroundPageConnection = chrome.runtime.connect();
backgroundPageConnection.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId,
});

// Receive devtools messages from service worker, and either save them for later
// if our panel is not active, or decode and plug them into appropriate table.
backgroundPageConnection.onMessage.addListener(function (message) {
  if (panelDocument) {
    handleMessage(message);
  } else {
    queuedMessages.push(message);
  }
});
