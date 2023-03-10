// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Functions related to the 'host screen' for Chromoting.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function(){

'use strict';

/** @type {remoting.HostSession} */
var hostSession_ = null;

/**
 * @type {boolean} Whether or not the last share was cancelled by the user.
 *     This controls what screen is shown when the host signals completion.
 */
var lastShareWasCancelled_ = false;

/**
 * Start a host session. This is the main entry point for the host screen,
 * called directly from the onclick action of a button on the home screen.
 * It first verifies that the native host components are installed and asks
 * to install them if necessary.
 */
remoting.tryShare = function() {
  /** @type {remoting.It2MeHostFacade} */
  var hostFacade = new remoting.It2MeHostFacade();
  remoting.hostFacade = hostFacade;

  var onFacadeInitialized = function () {
    // Host already installed.
    remoting.startHostUsingFacade_(hostFacade);
  };

  var onFacadeInitializationFailed = function() {
  };

  hostFacade.initialize(onFacadeInitialized, onFacadeInitializationFailed);
};

/**
 * @param {remoting.It2MeHostFacade} hostFacade An initialized It2MeHostFacade.
 */
remoting.startHostUsingFacade_ = function(hostFacade) {
  remoting.identity.getToken().then(
    remoting.tryShareWithToken_.bind(null, hostFacade),
    remoting.Error.handler(showShareError_));
};

/**
 * @return {Promise} Promise for fresh IceConfig.
 * @private
 */
remoting.fetchIceConfig_ = function() {
  var kDefaultIceConfig = {
    'iceServers': [
      {
        urls: ['stun:52.80.252.193:3478']
      },
      {
        urls: ['turn:52.80.252.193:3478'],
        username: 'remoting',
        credential: 'feepoh7ohS'
      }
    ],
    lifetimeDuration: "86400s"
  };
  return kDefaultIceConfig;
}

/**
 * @param {remoting.It2MeHostFacade} hostFacade An initialized
 *     It2MeHostFacade.
 * @param {string} token The OAuth access token.
 * @private
 */
remoting.tryShareWithToken_ = function(hostFacade, token) {
  lastShareWasCancelled_ = false;
  remoting.setMode(remoting.AppMode.HOST_WAITING_FOR_CODE);
  disableTimeoutCountdown_();

  console.assert(hostSession_ === null, '|hostSession_| already exists.');
  hostSession_ = new remoting.HostSession();
  var emailPromise = remoting.identity.getEmail();
  var iceConfigPromise = remoting.fetchIceConfig_();
  Promise.all([emailPromise, iceConfigPromise]).then(
      function(values) {
        /** string */
        var email = values[0];
        /** Object */
        var iceConfig = values[1];
        hostSession_.connect(
            hostFacade, email, token, iceConfig, onHostStateChanged_,
            onNatTraversalPolicyChanged_, logDebugInfo_, showShareError_);
      });
};

/**
 * Callback for the host plugin to notify the web app of state changes.
 * @param {remoting.HostSession.State} state The new state of the plugin.
 * @return {void} Nothing.
 */
function onHostStateChanged_(state) {
  if (state == remoting.HostSession.State.STARTING) {
    // Nothing to do here.

  } else if (state == remoting.HostSession.State.REQUESTED_ACCESS_CODE) {
    // Nothing to do here.

  } else if (state == remoting.HostSession.State.RECEIVED_ACCESS_CODE) {
    var accessCode = hostSession_.getAccessCode();
    accessCodeExpiresIn_ = hostSession_.getAccessCodeLifetime();
    if (remoting.onAccessCodeReceived) {
      remoting.onAccessCodeReceived(accessCode, accessCodeExpiresIn_);
    }
    if (accessCodeExpiresIn_ > 0) {  // Check it hasn't expired.
      accessCodeTimerId_ = setInterval(decrementAccessCodeTimeout_, 1000);
      timerRunning_ = true;
      updateAccessCodeTimeoutElement_();
      remoting.setMode(remoting.AppMode.HOST_WAITING_FOR_CONNECTION);
    } else {
      // This can only happen if the cloud tells us that the code lifetime is
      // <= 0s, which shouldn't happen so we don't care how clean this UX is.
      console.error('Access code already invalid on receipt!');
      remoting.cancelShare();
    }

  } else if (state == remoting.HostSession.State.CONNECTING) {
    remoting.setMode(remoting.AppMode.HOST_WAITING_FOR_ACCEPT);
    disableTimeoutCountdown_();

  } else if (state == remoting.HostSession.State.CONNECTED) {
    // var element = document.getElementById('host-shared-message');
    // var client = hostSession_.getClient();
    // l10n.localizeElement(element, client);
    remoting.setMode(remoting.AppMode.HOST_SHARED);
    disableTimeoutCountdown_();

  } else if (state == remoting.HostSession.State.DISCONNECTING) {

  } else if (state == remoting.HostSession.State.DISCONNECTED) {
    if (remoting.currentMode != remoting.AppMode.HOST_SHARE_FAILED) {
      // If an error is being displayed, then the plugin should not be able to
      // hide it by setting the state. Errors must be dismissed by the user
      // clicking OK, which puts the app into mode HOME.
      if (lastShareWasCancelled_) {
        remoting.setMode(remoting.AppMode.HOME);
      } else {
        remoting.setMode(remoting.AppMode.HOST_SHARE_FINISHED);
      }
    }
    cleanUp();
  } else if (state == remoting.HostSession.State.ERROR) {
    // The processing of this message is identical to that of the "error"
    // message (see it2me_host_facade.js); it is included only to support
    // old native components that send errors as a host state message.
    // TODO(jamiewalch): Remove this once there are sufficiently few old
    //     installations deployed.
    console.error('Host state: ERROR');
    showShareError_(remoting.Error.unexpected());
  } else if (state == remoting.HostSession.State.INVALID_DOMAIN_ERROR) {
    console.error('Host state: INVALID_DOMAIN_ERROR');
    showShareError_(new remoting.Error(remoting.Error.Tag.INVALID_HOST_DOMAIN));
  } else {
    console.error('Unknown state -> ' + state);
  }
}

/**
 * This is the callback that the host plugin invokes to indicate that there
 * is additional debug log info to display.
 * @param {string} msg The message (which will not be localized) to be logged.
 */
function logDebugInfo_(msg) {
  console.log('plugin: ' + msg);
}

/**
 * Show a host-side error message.
 *
 * @param {!remoting.Error} error The error to be localized and displayed.
 * @return {void} Nothing.
 */
function showShareError_(error) {
  if (error.hasTag(remoting.Error.Tag.CANCELLED)) {
    remoting.setMode(remoting.AppMode.HOME);
  } else {
    // var errorDiv = document.getElementById('host-plugin-error');
    // l10n.localizeElementFromTag(errorDiv, error.getTag());
    console.error('Sharing error: ' + error.toString());
    remoting.setMode(remoting.AppMode.HOST_SHARE_FAILED);
  }

  cleanUp();
}

function cleanUp() {
  base.dispose(hostSession_);
  hostSession_ = null;
}

/**
 * Cancel an active or pending it2me share operation.
 *
 * @return {void} Nothing.
 */
remoting.cancelShare = function() {
  // document.getElementById('cancel-share-button').disabled = true;
  remoting.lastShareWasCancelled = true;
  try {
    hostSession_.disconnect();
  } catch (/** @type {*} */ error) {
    console.error('Error disconnecting: ' + error +
                  '. The host probably crashed.');
    // TODO(jamiewalch): Clean this up. We should have a class representing
    // the host plugin, like we do for the client, which should handle crash
    // reporting and it should use a more detailed error message than the
    // default 'generic' one. See crbug.com/94624
    showShareError_(remoting.Error.unexpected());
  }
  disableTimeoutCountdown_();
};

/**
 * @type {boolean} Whether or not the access code timeout countdown is running.
 */
var timerRunning_ = false;

/**
 * @type {number} The id of the access code expiry countdown timer.
 */
var accessCodeTimerId_ = 0;

/**
 * @type {number} The number of seconds until the access code expires.
 */
var accessCodeExpiresIn_ = 0;

/**
 * The timer callback function
 * @return {void} Nothing.
 */
function decrementAccessCodeTimeout_() {
  --accessCodeExpiresIn_;
  updateAccessCodeTimeoutElement_();
}

/**
 * Stop the access code timeout countdown if it is running.
 * @return {void} Nothing.
 */
function disableTimeoutCountdown_() {
  if (timerRunning_) {
    clearInterval(accessCodeTimerId_);
    timerRunning_ = false;
    updateTimeoutStyles_();
  }
}

/**
 * Constants controlling the access code timer countdown display.
 */
var ACCESS_CODE_TIMER_DISPLAY_THRESHOLD_ = 30;
var ACCESS_CODE_RED_THRESHOLD_ = 10;

/**
 * Show/hide or restyle various elements, depending on the remaining countdown
 * and timer state.
 *
 * @return {boolean} True if the timeout is in progress, false if it has
 * expired.
 */
function updateTimeoutStyles_() {
  if (timerRunning_) {
    if (accessCodeExpiresIn_ <= 0) {
      remoting.cancelShare();
      return false;
    }
    // var accessCode = document.getElementById('access-code-display');
    // if (accessCodeExpiresIn_ <= ACCESS_CODE_RED_THRESHOLD_) {
    //   accessCode.classList.add('expiring');
    // } else {
    //   accessCode.classList.remove('expiring');
    // }
  }
  // document.getElementById('access-code-countdown').hidden =
  //     (accessCodeExpiresIn_ > ACCESS_CODE_TIMER_DISPLAY_THRESHOLD_) ||
  //     !timerRunning_;
  return true;
}

/**
 * Update the text and appearance of the access code timeout element to
 * reflect the time remaining.
 * @return {void} Nothing.
 */
function updateAccessCodeTimeoutElement_() {
  // var pad = (accessCodeExpiresIn_ < 10) ? '0:0' : '0:';
  // l10n.localizeElement(document.getElementById('seconds-remaining'),
  //                      pad + accessCodeExpiresIn_);
  // if (!updateTimeoutStyles_()) {
  //   disableTimeoutCountdown_();
  // }
}

/**
 * Callback to show or hide the NAT traversal warning when the policy changes.
 * @param {boolean} enabled True if NAT traversal is enabled.
 * @return {void} Nothing.
 */
function onNatTraversalPolicyChanged_(enabled) {
  // var natBox = document.getElementById('nat-box');
  // if (enabled) {
  //   natBox.classList.add('traversal-enabled');
  // } else {
  //   natBox.classList.remove('traversal-enabled');
  // }
}

})();
