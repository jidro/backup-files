// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class to communicate with the It2me Host component via Native Messaging.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @constructor
 * @implements {base.Disposable}
 */
remoting.It2MeHostFacade = function() {
  /** @private {number} */
  this.nextId_ = 0;

  /** @private {?Port} */
  this.port_ = null;

  /** @private {string} */
  this.accessCode_ = '';

  /** @private {number} */
  this.accessCodeLifetime_ = 0;

  /** @private {string} */
  this.clientId_ = '';

  /** @private {boolean} */
  this.initialized_ = false;

  /** @private {base.Disposables} */
  this.eventHooks_ = null;

  /** @private {?function():void} */
  this.onInitialized_ = function() {};

  /**
   * Called if Native Messaging host has failed to start.
   * @private
   * */
  this.onInitializationFailed_ = function() {};

  /**
   * Called if the It2Me Native Messaging host sends a malformed message:
   * missing required attributes, attributes with incorrect types, etc.
   * @private {?function(!remoting.Error):void}
   */
  this.onError_ = function(error) {};

  /** @private {?function(remoting.HostSession.State):void} */
  this.onStateChanged_ = function() {};

  /** @private {?function(boolean):void} */
  this.onNatPolicyChanged_ = function() {};

  /** @private */
  this.hostVersion_ = '';
};

remoting.It2MeHostFacade.prototype.dispose = function() {
  base.dispose(this.eventHooks_);
  base.dispose(this.signalStrategy_);
  this.eventHooks_ = null;
  if (this.port_) {
    this.port_.disconnect();
    this.port_ = null;
  }
};

/**
 * Sets up connection to the Native Messaging host process and exchanges
 * 'hello' messages. If Native Messaging is not supported or if the it2me
 * native messaging host is not installed, onInitializationFailed is invoked.
 * Otherwise, onInitialized is invoked.
 *
 * @param {function(*=):void} onInitialized Called after successful
 *     initialization.
 * @param {function(*=):void} onInitializationFailed Called if cannot connect to
 *     the native messaging host.
 * @return {void}
 */
remoting.It2MeHostFacade.prototype.initialize =
    function(onInitialized, onInitializationFailed) {
  this.onInitialized_ = onInitialized;
  this.onInitializationFailed_ = onInitializationFailed;

  try {
    this.port_ = chrome.runtime.connectNative(
        'com.google.chrome.remote_assistance');
    this.eventHooks_ = new base.Disposables(
        new base.ChromeEventHook(this.port_.onMessage,
                                 this.onIncomingMessage_.bind(this)),
        new base.ChromeEventHook(this.port_.onDisconnect,
                                 this.onHostDisconnect_.bind(this)));
    this.postNativeMessage({type: 'hello'});
  } catch (/** @type {*} */ err) {
    console.error('Native Messaging initialization failed: ', err);
    this.dispose();
    onInitializationFailed();
    return;
  }
};

/**
 * @param {string} email
 * @param {string} token
 * @return {Promise<!remoting.SignalStrategy>}
 */
function connectSignaling(email, token) {
  var signalStrategy = remoting.SignalStrategy.create();
  var deferred = new base.Deferred();
  function onSignalingState(/** remoting.SignalStrategy.State */ state) {
    switch (state) {
      case remoting.SignalStrategy.State.CONNECTED:
        deferred.resolve(signalStrategy);
        break;

      case remoting.SignalStrategy.State.FAILED:
        var error = signalStrategy.getError();
        signalStrategy.dispose();
        deferred.reject(error);
        break;
    }
  }
  signalStrategy.setStateChangedCallback(onSignalingState);
  signalStrategy.connect(remoting.settings.XMPP_SERVER, email, token);
  return deferred.promise();
}

/**
 * @param {string} email The user's email address.
 * @param {string} authServiceWithToken Concatenation of the auth service
 *     (e.g. oauth2) and the access token.
 * @param {Object} iceConfig ICE config for the host.
 * @param {function(remoting.HostSession.State):void} onStateChanged Callback to
 *     invoke when the host state changes.
 * @param {function(boolean):void} onNatPolicyChanged Callback to invoke when
 *     the nat traversal policy changes.
 * @param {function(string):void} logDebugInfo Callback allowing the plugin
 *     to log messages to the debug log.
 * @param {string} xmppServerAddress XMPP server host name (or IP address) and
 *     port.
 * @param {boolean} xmppServerUseTls Whether to use TLS on connections to the
 *     XMPP server
 * @param {string} directoryBotJid XMPP JID for the remoting directory server
 *     bot.
 * @param {function(!remoting.Error):void} onError Callback to invoke in case of
 *     an error.
 * @return {void}
 */
remoting.It2MeHostFacade.prototype.connect = function(
    email, accessToken, iceConfig, onStateChanged, onNatPolicyChanged,
    logDebugInfo, xmppServerAddress, xmppServerUseTls, directoryBotJid,
    onError) {
  if (!this.port_) {
    console.error(
        'remoting.It2MeHostFacade.connect() without initialization.');
    onError(remoting.Error.unexpected());
    return;
  }

  this.onStateChanged_ = onStateChanged;
  this.onNatPolicyChanged_ = onNatPolicyChanged;
  this.onError_ = onError;
  var that = this;
  var localJid = email + '/remoting-' + uuidv4();
  connectSignaling(localJid, accessToken).then(function(/** remoting.SignalStrategy */ strategy) {
    that.signalStrategy_ = strategy;

    strategy.setIncomingStanzaCallback(that.onIncomingStanza_.bind(that));

    var message = {
      type: 'connect',
      userName: email,
      useSignalingProxy: true,
      localJid,
      xmppServerAddress,
      xmppServerUseTls,
      directoryBotJid,
      iceConfig
    }
    that.postNativeMessage(message);
  }).catch(
    remoting.Error.handler(function (error) {
      console.error('SignalStrategy of it2me host connect failed', error);
      base.dispose(that.signalStrategy_);
      throw error;
    })
  );
};

/**
 * Unhooks the |onStateChanged|, |onError|, |onNatPolicyChanged| and
 * |onInitalized| callbacks.  This is called when the client shuts down so that
 * the callbacks will not be invoked on a disposed client.
 *
 * @return {void}
 */
remoting.It2MeHostFacade.prototype.unhookCallbacks = function() {
  this.onStateChanged_ = null;
  this.onNatPolicyChanged_ = null;
  this.onError_ = null;
  this.onInitialized_ = null;
};

/**
 * @return {void}
 */
remoting.It2MeHostFacade.prototype.disconnect = function() {
  if (this.port_)
    this.postNativeMessage({type: 'disconnect'});
};

/**
 * @return {void}
 */
remoting.It2MeHostFacade.prototype.postNativeMessage = function(message) {
  this.port_.postMessage(message);
};

/**
 * @return {boolean}
 */
remoting.It2MeHostFacade.prototype.initialized = function() {
  return this.initialized_;
};

/**
 * @return {string}
 */
remoting.It2MeHostFacade.prototype.getAccessCode = function() {
  return this.accessCode_;
};

/**
 * @return {number}
 */
remoting.It2MeHostFacade.prototype.getAccessCodeLifetime = function() {
  return this.accessCodeLifetime_;
};

/**
 * @return {string}
 */
remoting.It2MeHostFacade.prototype.getClient = function() {
  return this.clientId_;
};

/**
 * @return {string}
 */
remoting.It2MeHostFacade.prototype.getHostVersion = function() {
  return this.hostVersion_;
};


/**
 * Handler for incoming messages.
 *
 * @param {Object} message The received message.
 * @return {void}
 * @private
 */
remoting.It2MeHostFacade.prototype.onIncomingMessage_ = function(message) {
  var type = base.getStringAttr(message, 'type');

  switch (type) {
    case 'helloResponse':
      this.hostVersion_ = base.getStringAttr(message, 'version');
      this.initialized_ = true;
      // A "hello" request is sent immediately after the native messaging host
      // is started. We can proceed to the next task once we receive the
      // "helloReponse".
      if (this.onInitialized_) {
        this.onInitialized_();
      }
      break;

    case 'incomingIqResponse':
      // No action is needed.
      break;

    case 'connectResponse':
      // Response to the "connect" request. No action is needed until we
      // receive the corresponding "hostStateChanged" message.
      break;

    case 'disconnectResponse':
      // Response to the "disconnect" request. No action is needed until we
      // receive the corresponding "hostStateChanged" message.
      break;

    case 'hostStateChanged':
      var stateString = base.getStringAttr(message, 'state');
      var errorMessage = base.getStringAttr(message, 'error_message', '');
      var state = remoting.HostSession.State.fromString(stateString);

      switch (state) {
        case remoting.HostSession.State.RECEIVED_ACCESS_CODE:
          var accessCode = base.getStringAttr(message, 'accessCode');
          console.log('AccessCode', accessCode);
          var accessCodeLifetime =
              base.getNumberAttr(message, 'accessCodeLifetime');
          this.onReceivedAccessCode_(accessCode, accessCodeLifetime);
          break;

        case remoting.HostSession.State.CONNECTED:
          var client = base.getStringAttr(message, 'client');
          this.onConnected_(client);
          break;
      }
      if (this.onStateChanged_) {
        this.onStateChanged_(state);
      }
      break;

    case 'natPolicyChanged':
      if (this.onNatPolicyChanged_) {
        var natTraversalEnabled =
            base.getBooleanAttr(message, 'natTraversalEnabled');
        this.onNatPolicyChanged_(natTraversalEnabled);
      }
      break;

    case 'policyError':
      if (this.onError_) {
        this.onError_(new remoting.Error(remoting.Error.Tag.POLICY_ERROR));
      }
      break;

    case 'sendOutgoingIq':
      this.sendIq_(base.getStringAttr(message, 'iq'));
      break;

    case 'error':
      console.error(base.getStringAttr(message, 'description'));
      if (this.onError_) {
        this.onError_(remoting.Error.unexpected());
      }
      break;

    default:
      throw 'Unexpected native message: ' + JSON.stringify(message);
  }
};

/**
 * Sends a signaling message.
 *
 * @param {string} message XML string of IQ stanza to send to server.
 * @return {void} Nothing.
 * @private
 */
remoting.It2MeHostFacade.prototype.onIncomingStanza_ = function(stanza) {
  return this.postNativeMessage({ type: 'incomingIq', iq: stanza.outerHTML });
};

/**
 * Sends a signaling message.
 *
 * @param {string} message XML string of IQ stanza to send to server.
 * @return {void} Nothing.
 * @private
 */
remoting.It2MeHostFacade.prototype.sendIq_ = function(message) {
  // Extract the session id, so we can close the session later.
  var parser = new DOMParser();
  var iqNode = parser.parseFromString(message, 'text/xml').firstChild;
  var jingleNode = iqNode.firstChild;
  if (jingleNode) {
    var action = jingleNode.getAttribute('action');
    if (jingleNode.nodeName == 'jingle' && action == 'session-initiate') {
      this.sessionId_ = jingleNode.getAttribute('sid');
    }

    if (jingleNode.nodeName === 'rem:register-support-host') {
      var iqId = iqNode.id;
      var from = iqNode.getAttribute('from');
      var to = iqNode.getAttribute('to');
      var publicKey;
      for (var i = 0; i < jingleNode.childElementCount; i++) {
        if (jingleNode.childNodes[i].nodeName === 'rem:public-key') {
          publicKey = jingleNode.childNodes[i].textContent;
        }
      }
      var that = this;
      return remoting.HostListApi.getInstance().registerSupportHost(from, publicKey).then(function (registerResult) {
        var {supportId, lifetime} = registerResult;

        var responseIq = parser.parseFromString("<cli:iq from=\"FROM\" to=\"TO\" id=\"ID\" type=\"result\" xmlns:cli=\"jabber:client\"><rem:register-support-host-result xmlns:rem=\"google:remoting\"><rem:support-id>SUPPORT_ID</rem:support-id><rem:support-id-lifetime>300</rem:support-id-lifetime></rem:register-support-host-result></cli:iq>", 'text/xml').firstChild;
        responseIq.firstChild.childNodes[0].textContent = new String(supportId);
        responseIq.firstChild.childNodes[1].textContent = new String(lifetime);
        responseIq.id = iqId;
        responseIq.setAttribute('from', to);
        responseIq.setAttribute('to', from);

        return that.postNativeMessage({ type: 'incomingIq', iq: responseIq.outerHTML });  
      });
    }
  }

  if (this.signalStrategy_.getState() !=
      remoting.SignalStrategy.State.CONNECTED) {
    console.error("Message above is dropped because signaling is not connected.");
    return;
  }

  this.signalStrategy_.sendMessage(message);
};

/**
 * @param {string} accessCode
 * @param {number} accessCodeLifetime
 * @return {void}
 * @private
 */
remoting.It2MeHostFacade.prototype.onReceivedAccessCode_ =
    function(accessCode, accessCodeLifetime) {
  this.accessCode_ = accessCode;
  this.accessCodeLifetime_ = accessCodeLifetime;
};

/**
 * @param {string} clientId
 * @return {void}
 * @private
 */
remoting.It2MeHostFacade.prototype.onConnected_ = function(clientId) {
  this.clientId_ = clientId;
};

/**
 * @return {void}
 * @private
 */
remoting.It2MeHostFacade.prototype.onHostDisconnect_ = function() {
  if (!this.initialized_) {
    // If the host is disconnected before it is initialized, it probably means
    // the host is not propertly installed (or not installed at all).
    // E.g., if the host manifest is not present we get "Specified native
    // messaging host not found" error. If the host manifest is present but
    // the host binary cannot be found we get the "Native host has exited"
    // error.
    console.error('Native Messaging initialization failed: ' +
                chrome.runtime.lastError.message);
    this.onInitializationFailed_();
  } else {
    this.port_ = null;
    this.onError_(remoting.Error.unexpected());
  }
};

})();
