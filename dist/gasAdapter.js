/**
 * GOOGLE APPS SCRIPT HTTP ADAPTER (SHIM)
 * Dash Katalog — Amanah Safar
 * 
 * Modul ini menyediakan tiruan (mock) objek window.google.script.run
 * sehingga seluruh script frontend (56 titik pemanggilan) dapat berjalan
 * 100% PERSIS tanpa perlu mengubah satu baris pun kode di auth.js, catalog.js, dll.
 */

(function() {
  function getGasUrl() {
    if (window.GAS_CONFIG && window.GAS_CONFIG.API_URL) {
      return window.GAS_CONFIG.API_URL;
    }
    return '';
  }

  async function executeGasApi(actionName, args) {
    const url = getGasUrl();
    if (!url || url.includes('dummy')) {
      console.warn('[GAS Adapter] Peringatan: URL Google Apps Script belum dikonfigurasi di config.js!');
    }

    const payload = {
      action: actionName,
      params: args || []
    };

    try {
      // Menggunakan 'text/plain;charset=utf-8' untuk menghindari CORS Preflight OPTIONS
      // yang ditolak oleh Google Apps Script Web App
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error('HTTP Error: ' + response.status + ' ' + response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[GAS Adapter Error]', actionName, err);
      throw err;
    }
  }

  function createProxyHandler() {
    return new Proxy({}, {
      get: function(target, propKey) {
        let _onSuccess = function() {};
        let _onFailure = function(err) {
          console.error('[GAS Run Error]', err);
        };

        const runner = {
          withSuccessHandler: function(cb) {
            if (typeof cb === 'function') _onSuccess = cb;
            return runner;
          },
          withFailureHandler: function(cb) {
            if (typeof cb === 'function') _onFailure = cb;
            return runner;
          }
        };

        return new Proxy(function() {}, {
          get: function(t, p) {
            return runner[p];
          },
          apply: function(t, thisArg, argArray) {
            executeGasApi(propKey, argArray)
              .then(function(res) {
                _onSuccess(res);
              })
              .catch(function(err) {
                _onFailure(err);
              });
          }
        });
      }
    });
  }

  // Pasang objek tiruan ke window.google.script.run
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = createProxyHandler();

  console.log('[GAS Adapter] Inisialisasi google.script.run bridge aktif.');
})();
