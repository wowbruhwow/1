// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Universal WebSocket client (browser)
// - Auto reconnect with exponential backoff
// - Heartbeat (ping) to keep connection alive
// - JSON event parsing + callbacks
//
// Usage example:
//   const client = new CityLegendsWsClient('ws://localhost:8081/ws/match/demo?token=dev-token&playerId=p_demo_you', {
//     heartbeatIntervalMs: 15000,
//     onEvent(event) {
//       // event: { type, matchId, timestamp, payload }
//       console.log('[WS EVENT]', event.type, event.payload);
//     },
//     onOpen() {
//       console.log('[WS] connected');
//     },
//     onClose(info) {
//       console.log('[WS] closed', info);
//     },
//   });
//   client.connect();
//
// This client is intentionally framework-agnostic and attached to window as
//   window.CityLegendsWsClient
// so it can be used from any script on pages like playable-window.

(function (global) {
  'use strict';

  var DEFAULTS = {
    autoReconnect: true,
    reconnectDelayMs: 1000,
    maxReconnectDelayMs: 15000,
    heartbeatIntervalMs: 15000,
    heartbeatPayload: { type: 'ping' },
    parseJson: true,
    logPrefix: '[WS-Client]',
  };

  function CityLegendsWsClient(url, options) {
    if (!url) {
      throw new Error('CityLegendsWsClient: url is required');
    }
    this.url = url;
    this.options = options || {};

    this.socket = null;
    this._shouldReconnect = !!(this.options.autoReconnect != null ? this.options.autoReconnect : DEFAULTS.autoReconnect);
    this._reconnectDelay = this.options.reconnectDelayMs || DEFAULTS.reconnectDelayMs;
    this._maxReconnectDelay = this.options.maxReconnectDelayMs || DEFAULTS.maxReconnectDelayMs;
    this._heartbeatInterval = this.options.heartbeatIntervalMs || DEFAULTS.heartbeatIntervalMs;
    this._heartbeatTimer = null;
    this._reconnectTimer = null;
    this._manualClose = false;
  }

  CityLegendsWsClient.prototype._log = function () {
    if (!this.options.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.options.logPrefix || DEFAULTS.logPrefix);
    // eslint-disable-next-line no-console
    console.log.apply(console, args);
  };

  CityLegendsWsClient.prototype.connect = function () {
    var self = this;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this._log('connect() called but socket already open or connecting');
      return;
    }

    this._manualClose = false;
    this._clearReconnect();

    this._log('Connecting to', this.url);
    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      this._log('Failed to create WebSocket', err);
      this._scheduleReconnect();
      return;
    }

    this.socket.onopen = function () {
      self._log('WebSocket open');
      self._resetReconnectDelay();
      self._startHeartbeat();
      if (typeof self.options.onOpen === 'function') {
        self.options.onOpen();
      }
    };

    this.socket.onmessage = function (event) {
      self._handleMessage(event);
    };

    this.socket.onerror = function (event) {
      self._log('WebSocket error', event);
      if (typeof self.options.onError === 'function') {
        self.options.onError(event);
      }
    };

    this.socket.onclose = function (event) {
      self._log('WebSocket close', event.code, event.reason);
      self._stopHeartbeat();
      if (typeof self.options.onClose === 'function') {
        self.options.onClose({
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
      }
      self.socket = null;
      if (!self._manualClose && self._shouldReconnect) {
        self._scheduleReconnect();
      }
    };
  };

  CityLegendsWsClient.prototype._handleMessage = function (event) {
    var data = event.data;

    if (typeof this.options.onRawMessage === 'function') {
      this.options.onRawMessage(data);
    }

    var parsed = null;
    if (this.options.parseJson === false || DEFAULTS.parseJson === false) {
      // If JSON parsing is disabled, forward raw data.
      if (typeof this.options.onEvent === 'function') {
        this.options.onEvent(data);
      }
      return;
    }

    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        this._log('Failed to parse WS message as JSON', e, data);
        return;
      }
    } else {
      // Binary / Blob — skip automatic JSON parsing.
      if (typeof this.options.onEvent === 'function') {
        this.options.onEvent(data);
      }
      return;
    }

    if (typeof this.options.onEvent === 'function') {
      this.options.onEvent(parsed);
    }
  };

  CityLegendsWsClient.prototype._startHeartbeat = function () {
    var self = this;
    if (!this._heartbeatInterval || this._heartbeatInterval <= 0) return;

    this._stopHeartbeat();
    this._heartbeatTimer = setInterval(function () {
      if (!self.socket || self.socket.readyState !== WebSocket.OPEN) return;
      var payload = self.options.heartbeatPayload || DEFAULTS.heartbeatPayload;
      try {
        self.socket.send(JSON.stringify(payload));
      } catch (e) {
        self._log('Failed to send heartbeat', e);
      }
    }, this._heartbeatInterval);
  };

  CityLegendsWsClient.prototype._stopHeartbeat = function () {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  };

  CityLegendsWsClient.prototype._resetReconnectDelay = function () {
    this._reconnectDelay = this.options.reconnectDelayMs || DEFAULTS.reconnectDelayMs;
  };

  CityLegendsWsClient.prototype._scheduleReconnect = function () {
    var self = this;
    if (!this._shouldReconnect) return;

    this._clearReconnect();
    var delay = this._reconnectDelay;
    this._log('Scheduling reconnect in', delay, 'ms');
    this._reconnectTimer = setTimeout(function () {
      self.connect();
    }, delay);

    // Exponential backoff with cap
    var next = this._reconnectDelay * 2;
    this._reconnectDelay = next > this._maxReconnectDelay ? this._maxReconnectDelay : next;
  };

  CityLegendsWsClient.prototype._clearReconnect = function () {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  };

  CityLegendsWsClient.prototype.send = function (payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this._log('send() called while socket not open');
      return;
    }
    var data = payload;
    if (typeof payload !== 'string') {
      try {
        data = JSON.stringify(payload);
      } catch (e) {
        this._log('Failed to stringify payload, sending as-is', e);
      }
    }
    this.socket.send(data);
  };

  CityLegendsWsClient.prototype.close = function () {
    this._manualClose = true;
    this._shouldReconnect = false;
    this._clearReconnect();
    this._stopHeartbeat();
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        this._log('Error while closing socket', e);
      }
      this.socket = null;
    }
  };

  // Export to global namespace
  global.CityLegendsWsClient = CityLegendsWsClient;
})(window);
