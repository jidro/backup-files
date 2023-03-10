// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * API for host-list management.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/** @interface */
remoting.HostListApi = function() {
};

/**
 * Fetch the list of hosts for a user.
 *
 * @return {!Promise<!Array<!remoting.Host>>}
 */
remoting.HostListApi.prototype.get = function() {
};

/**
 * Update the information for a host.
 *
 * @param {string} hostId
 * @param {string} hostName
 * @param {string} hostPublicKey
 * @return {!Promise<void>}
 */
remoting.HostListApi.prototype.put =
    function(hostId, hostName, hostPublicKey) {
};

/**
 * Delete a host.
 *
 * @param {string} hostId
 * @return {!Promise<void>}
 */
remoting.HostListApi.prototype.remove = function(hostId) {
};

/**
 * Attempts to look up a host using an ID derived from its publicly
 * visible access code.
 *
 * @param {string} supportId The support ID of the host to connect to.
 * @return {!Promise<!remoting.Host>}
 */
remoting.HostListApi.prototype.getSupportHost = function(supportId) {
};

/**
 * @private {remoting.HostListApi}
 */
var instance = null;

/**
 * @return {!remoting.HostListApi}
 */
remoting.HostListApi.getInstance = function() {
  if (instance == null) {
      instance = new remoting.LegacyHostListApi();
  }
  return instance;
};

/**
 * For testing.
 * @param {remoting.HostListApi} newInstance
 */
remoting.HostListApi.setInstance = function(newInstance) {
  instance = newInstance;
};

})();

/**
 * Information returned from the registry/GCD server when registering
 * a device.
 *
 * The fields are:
 *
 * authCode: An OAuth2 authorization code that can be exchanged for a
 *     refresh token.
 *
 * email: The email/XMPP address of the robot account associated with
 *     this device.  The Chromoting directory sets this field to the
 *     empty string; GCD returns a real email address.
 *
 * hostId: The ID of the newly registered host.
 *
 * @typedef {{
 *   authCode: string,
 *   email: string,
 *   hostId: string
 * }}
 */
remoting.HostListApi.RegisterResult;
