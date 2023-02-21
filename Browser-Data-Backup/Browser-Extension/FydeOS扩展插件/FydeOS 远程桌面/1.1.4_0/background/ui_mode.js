// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Functions related to controlling the modal UI state of the app. UI states
 * are expressed as HTML attributes with a dotted hierarchy. For example, the
 * string 'host.shared' will match any elements with an associated attribute
 * of 'host' or 'host.shared', showing those elements and hiding all others.
 * Elements with no associated attribute are ignored.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @enum {string} */
// TODO(jamiewalch): Move 'in-session' to a separate web-page so that the
// 'home' state applies to all elements and can be removed.
remoting.AppMode = {
  HOME: 'home',
    TOKEN_REFRESH_FAILED: 'home.token-refresh-failed',
    HOST: 'home.host',
      HOST_WAITING_FOR_CODE: 'home.host.waiting-for-code',
      HOST_WAITING_FOR_CONNECTION: 'home.host.waiting-for-connection',
      HOST_WAITING_FOR_ACCEPT: 'home.host.waiting-for-accept',
      HOST_SHARED: 'home.host.shared',
      HOST_SHARE_FAILED: 'home.host.share-failed',
      HOST_SHARE_FINISHED: 'home.host.share-finished',
    CLIENT: 'home.client',
      CLIENT_UNCONNECTED: 'home.client.unconnected',
      CLIENT_PIN_PROMPT: 'home.client.pin-prompt',
      CLIENT_THIRD_PARTY_AUTH: 'home.client.third-party-auth',
      CLIENT_CONNECTING: 'home.client.connecting',
      CLIENT_CONNECT_FAILED_IT2ME: 'home.client.connect-failed.it2me',
      CLIENT_SESSION_FINISHED_IT2ME: 'home.client.session-finished.it2me',
  IN_SESSION: 'in-session'
};

/**
 * @type {remoting.AppMode} The current app mode
 */
remoting.currentMode = remoting.AppMode.HOME;

/**
 * Change the app's modal state to |mode|, determined by the data-ui-mode
 * attribute.
 *
 * @param {remoting.AppMode} mode The new modal state.
 */
remoting.setMode = function(mode) {
  console.log('App mode: ' + mode);
  remoting.currentMode = mode;
  if (mode.startsWith(remoting.AppMode.HOST)) {
    remoting.sendMessageToClient({
      hostStatus: mode
    })
  }
};

/**
 * Get the major mode that the app is running in.
 * @return {string} The app's current major mode.
 */
remoting.getMajorMode = function() {
  return remoting.currentMode.split('.')[0];
};