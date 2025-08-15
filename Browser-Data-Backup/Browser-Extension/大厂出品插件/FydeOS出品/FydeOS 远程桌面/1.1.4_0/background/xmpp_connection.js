// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * A connection to an XMPP server.
 *
 * @constructor
 * @implements {remoting.SignalStrategy}
 */
remoting.XmppConnection = function() {
  /** @private */
  this.server_ = '';
  /** @private {?function(remoting.SignalStrategy.State):void} */
  this.onStateChangedCallback_ = null;
  /** @private {?function(Element):void} */
  this.onIncomingStanzaCallback_ = null;
  /** @type {?Strophe.Connection} @private */
  this.conn_ = null;
  /** @private */
  this.state_ = remoting.SignalStrategy.State.NOT_CONNECTED;
  /** @private */
  this.jid_ = '';
  /** @private */
  this.error_ = remoting.Error.none();
};

/**
 * @param {function(remoting.SignalStrategy.State):void} onStateChangedCallback
 */
remoting.XmppConnection.prototype.setStateChangedCallback = function(
    onStateChangedCallback) {
  this.onStateChangedCallback_ = onStateChangedCallback;
};

/**
 * @param {?function(Element):void} onIncomingStanzaCallback Callback to call on
 *     incoming messages.
 */
remoting.XmppConnection.prototype.setIncomingStanzaCallback =
    function(onIncomingStanzaCallback) {
  this.onIncomingStanzaCallback_ = onIncomingStanzaCallback;
};

/**
 * @param {string} server
 * @param {string} username
 * @param {string} authToken
 */
remoting.XmppConnection.prototype.connect =
    function(server, username, authToken) {
  console.assert(this.state_ == remoting.SignalStrategy.State.NOT_CONNECTED,
                'connect() called in state ' + this.state_ + '.');
  console.assert(this.onStateChangedCallback_ != null,
                 'No state-change callback registered.');

  this.error_ = remoting.Error.none();
  this.server_ = server;

  this.conn_ = new Strophe.Connection(this.server_, { mechanisms: [ Strophe.SASLXOAuth2 ] })
  this.conn_.addHandler(this.onReceive_.bind(this), 'urn:xmpp:jingle:1', 'iq', null, null, null)
  this.conn_.connect(username, authToken, this.onConnected_.bind(this))
};

/** @param {string} message */
remoting.XmppConnection.prototype.sendMessage = function(message) {
  console.assert(this.state_ == remoting.SignalStrategy.State.CONNECTED,
                'sendMessage() called in state ' + this.state_ + '.');
  this.sendString_(message);
};

/** @return {remoting.SignalStrategy.State} Current state */
remoting.XmppConnection.prototype.getState = function() {
  return this.state_;
};

/** @return {!remoting.Error} Error when in FAILED state. */
remoting.XmppConnection.prototype.getError = function() {
  return this.error_;
};

/** @return {string} Current JID when in CONNECTED state. */
remoting.XmppConnection.prototype.getJid = function() {
  return this.jid_;
};

/** @return {remoting.SignalStrategy.Type} The signal strategy type. */
remoting.XmppConnection.prototype.getType = function() {
  return remoting.SignalStrategy.Type.XMPP;
};

remoting.XmppConnection.prototype.dispose = function() {
  this.conn_ && this.conn_.disconnect();
  this.conn_ = null;
  this.setState_(remoting.SignalStrategy.State.CLOSED);
};

/** @private */
remoting.XmppConnection.prototype.onConnected_ = function(status) {
  if (status === Strophe.Status.CONNECTING) {
    this.setState_(remoting.SignalStrategy.State.CONNECTING)
  } else if (status === Strophe.Status.CONNFAIL) {
    this.setState_(remoting.SignalStrategy.State.FAILED)
  } else if (status === Strophe.Status.DISCONNECTING) {
    this.setState_(remoting.SignalStrategy.State.DISCONNECTING)
  } else if (status === Strophe.Status.DISCONNECTED) {
    this.setState_(remoting.SignalStrategy.State.DISCONNECTED)
  } else if (status === Strophe.Status.CONNECTED) {
    this.setState_(remoting.SignalStrategy.State.CONNECTED);

    this.jid_ = this.conn_.jid;
  }
};

/**
 * @param {ArrayBuffer} data
 * @private
 */
remoting.XmppConnection.prototype.onReceive_ = function(data) {
  console.assert(this.state_ == remoting.SignalStrategy.State.HANDSHAKE ||
                 this.state_ == remoting.SignalStrategy.State.CONNECTED,
                'onReceive_() called in state ' + this.state_ + '.');

  this.onIncomingStanza_(data);
  return true;
};

/**
 * @param {number} errorCode
 * @private
 */
remoting.XmppConnection.prototype.onReceiveError_ = function(errorCode) {
  this.onError_(new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE),
                'Failed to receive from XMPP socket: ' + errorCode);
};

/**
 * @param {string} text
 * @private
 */
remoting.XmppConnection.prototype.sendString_ = function(text) {
  const parser = new DOMParser();
  const iq = parser.parseFromString(text, 'text/xml').firstChild;
  this.conn_.sendIQ(iq, this.onReceive_.bind(this), this.onReceiveError_.bind(this));
};

/**
 * @param {Element} stanza
 * @private
 */
remoting.XmppConnection.prototype.onIncomingStanza_ = function(stanza) {
  if (this.onIncomingStanzaCallback_) {
    this.onIncomingStanzaCallback_(stanza);
  }
};

/**
 * @param {!remoting.Error} error
 * @param {string} text
 * @private
 */
remoting.XmppConnection.prototype.onError_ = function(error, text) {
  console.error(text);
  this.error_ = error;
  this.conn_ && this.conn_.disconnect()
  this.conn_ = null;
  this.setState_(remoting.SignalStrategy.State.FAILED);
};

/**
 * @param {remoting.SignalStrategy.State} newState
 * @private
 */
remoting.XmppConnection.prototype.setState_ = function(newState) {
  if (this.state_ != newState) {
    this.state_ = newState;
    this.onStateChangedCallback_(this.state_);
  }
};
