// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Contains all the settings that may need massaging by the build script.
// Keeping all that centralized here allows us to use symlinks for the other
// files making for a faster compile/run cycle when only modifying HTML/JS.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @type {remoting.Settings} */
remoting.settings = null;
/** @constructor */
remoting.Settings = function() {};

// The settings on this file are automatically substituted by build-webapp.py.
// Do not override them manually, except for running local tests.

/** @type {string} API client ID.*/
remoting.Settings.prototype.OAUTH2_CLIENT_ID = 'dummytoken';
/** @type {string} API client secret.*/
remoting.Settings.prototype.OAUTH2_CLIENT_SECRET = 'dummytoken';
/** @type {string} Google API Key.*/
remoting.Settings.prototype.GOOGLE_API_KEY = 'API_KEY';

/** @type {string} Base URL for OAuth2 authentication. */
remoting.Settings.prototype.OAUTH2_BASE_URL = 'https://accounts.fydeos.com/o/oauth2';
/** @type {string} Base URL for the OAuth2 API. */
remoting.Settings.prototype.OAUTH2_API_BASE_URL = 'https://apis.fydeos.com/oauth2';
/** @type {string} Base URL for the Remoting Directory REST API. */
remoting.Settings.prototype.DIRECTORY_API_BASE_URL = 'https://apis.fydeos.com/remoting/v1';
/** @type {string} Base URL for the telemetry REST API. */
remoting.Settings.prototype.TELEMETRY_API_BASE_URL = 'https://apis.fydeos.com/remoting/v1/events';

/** @type {string} XMPP JID for the remoting directory server bot. */
remoting.Settings.prototype.DIRECTORY_BOT_JID = 'remoting-bot@rtc.fydeos.com';

// XMPP server connection settings.
/** @type {string} XMPP over BOSH server name and port. */
remoting.Settings.prototype.XMPP_SERVER = 'https://rtc.fydeos.com:5443/bosh';
/** @type {boolean} Whether to use TLS on connections to the XMPP server. */
remoting.Settings.prototype.XMPP_SERVER_USE_TLS = false;

/** @const {boolean} If true, use GCD instead of Chromoting registry. */
remoting.Settings.prototype.USE_GCD = false;
