// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * REST API for host-list management.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @constructor
 * @implements {remoting.HostListApi}
 */
remoting.LegacyHostListApi = function() {
};

/**
 * Registers a support host with the Chromoting directory
 *
 * @param {string} jabberId The jabber ID of the host.
 * @param {string} publicKey The public half of the host's key pair.
 * @return {!Promise<remoting.HostListApi.RegisterResult>}
 */
remoting.LegacyHostListApi.prototype.registerSupportHost = function(
  jabberId, publicKey) {
  return new remoting.Xhr({
    method: 'POST',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/support-hosts',
    formContent: {
      jabberId, publicKey
    },
    acceptJson: true,
    useIdentity: true
  }).start().then(function(response) {
    if (response.status == 200) {
      var result = /** @type {!Object} */ (response.getJson());

      return result;
    } else {
      console.error(
          'Failed to register the support host. Status: ' + response.status +
          ' response: ' + response.getText());
      throw new remoting.Error(remoting.Error.Tag.REGISTRATION_FAILED);
    }
  });
};

/**
 * Handle the results of the host list request.  A success response will
 * include a JSON-encoded list of host descriptions, which is parsed and
 * passed to the callback.
 *
 * @param {!remoting.Xhr.Response} response
 * @return {!Array<!remoting.Host>}
 * @private
 */
remoting.LegacyHostListApi.prototype.parseHostListResponse_ =
    function(response) {
  if (response.status == 200) {
    var obj = /** @type {{data: {items: Array}}} */
        (base.jsonParseSafe(response.getText()));
    if (!obj || !obj.data) {
      console.error('Invalid "hosts" response from server.');
      throw remoting.Error.unexpected();
    } else {
      var items = obj.data.items || [];
      var hosts = items.map(
        function(/** Object */ item) {
          var host = new remoting.Host(base.getStringAttr(item, 'hostId', ''));
          host.hostName = base.getStringAttr(item, 'hostName', '');
          host.status = base.getStringAttr(item, 'status', '');
          host.jabberId = base.getStringAttr(item, 'jabberId', '');
          host.publicKey = base.getStringAttr(item, 'publicKey', '');
          host.hostVersion = base.getStringAttr(item, 'hostVersion', '');
          host.hostOs = remoting.ChromotingEvent.toOs(
              base.getStringAttr(item, 'hostOs', ''));
          host.hostOsVersion = base.getStringAttr(item, 'hostOsVersion', '');
          host.tokenUrlPatterns =
              base.getArrayAttr(item, 'tokenUrlPatterns', []);
          host.updatedTime = base.getStringAttr(item, 'updatedTime', '');
          host.hostOfflineReason =
              base.getStringAttr(item, 'hostOfflineReason', '');
          return host;
      });
      return hosts;
    }
  } else {
    throw remoting.Error.fromHttpStatus(response.status);
  }
};

/**
 * Generic success/failure response proxy.
 *
 * @param {Array<remoting.Error.Tag>=} opt_ignoreErrors
 * @return {function(!remoting.Xhr.Response):void}
 * @private
 */
remoting.LegacyHostListApi.defaultResponse_ = function(opt_ignoreErrors) {
  /** @param {!remoting.Xhr.Response} response */
  var result = function(response) {
    var error = remoting.Error.fromHttpStatus(response.status);
    if (error.isNone()) {
      return;
    }

    if (opt_ignoreErrors && error.hasTag.apply(error, opt_ignoreErrors)) {
      return;
    }

    throw error;
  };
  return result;
};

/** @override */
remoting.LegacyHostListApi.prototype.getSupportHost = function(supportId) {
  return new remoting.Xhr({
    method: 'GET',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/support-hosts/' +
        encodeURIComponent(supportId),
    useIdentity: true
  }).start().then(function(xhrResponse) {
    if (xhrResponse.status == 200) {
      var response =
          /** @type {{data: {jabberId: string, publicKey: string}}} */
          (base.jsonParseSafe(xhrResponse.getText()));
      if (response && response.data &&
          response.data.jabberId && response.data.publicKey) {
        var host = new remoting.Host(supportId);
        host.jabberId = base.getStringAttr(response.data, 'jabberId', '');
        host.publicKey = base.getStringAttr(response.data, 'publicKey', '');
        host.hostName = host.jabberId.split('/')[0];
        return host;
      } else {
        console.error('Invalid "support-hosts" response from server.');
        throw remoting.Error.unexpected();
      }
    } else if (xhrResponse.status == 404) {
      throw new remoting.Error(remoting.Error.Tag.INVALID_ACCESS_CODE);
    } else {
      throw remoting.Error.fromHttpStatus(xhrResponse.status);
    }
  });
};

})();
