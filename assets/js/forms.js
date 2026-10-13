/* Avighna Infrasmart — enquiry forms
 *
 * The original site's forms are WPForms (#15 "Send Request", #13 "Get A Free Quote")
 * on the WordPress install at avighnainfrasmart.com. Field names and hidden fields
 * are kept identical so submissions land in the same WPForms entries/notifications.
 *
 * WPForms needs a fresh anti-spam token on every submit, so the script first reads
 * the live form from WordPress, then posts to WordPress's own AJAX handler. That
 * only works when this static site is served from the same origin as WordPress
 * (the WordPress server sends no CORS headers). Otherwise — or on any error — the
 * visitor is told plainly that the message was NOT sent and is offered email,
 * phone and WhatsApp alternatives pre-filled with what they typed.
 */
(function () {
  'use strict';

  var PHONE = '+919980993995';
  var EMAIL = 'avighnainfrasmart@gmail.com';
  var WHATSAPP = '919980993995';
  var MSG_REQUIRED = 'This field is required.';          // original WPForms wording
  var MSG_EMAIL = 'Please enter a valid email address.';  // original WPForms wording
  var TIMEOUT = 10000;

  function fieldError(field, message) {
    var wrap = field.closest('.field');
    var out = wrap && wrap.querySelector('.field__error');
    if (wrap) wrap.classList.toggle('has-error', !!message);
    if (out) out.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate(form) {
    var firstInvalid = null;
    form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(function (field) {
      var value = field.value.trim();
      var message = '';
      if (field.required && !value) message = MSG_REQUIRED;
      else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = MSG_EMAIL;
      fieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function summary(form) {
    var lines = [];
    form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(function (field) {
      var label = form.querySelector('label[for="' + field.id + '"]');
      var name = label ? label.textContent.replace('*', '').trim() : field.name;
      if (field.value.trim()) lines.push(name + ': ' + field.value.trim());
    });
    return lines.join('\n');
  }

  function showStatus(form, type, html) {
    var status = form.querySelector('.form__status');
    status.className = 'form__status form__status--' + type;
    status.innerHTML = html;
    status.focus();
  }

  function showFallback(form) {
    var title = form.getAttribute('data-form-title') || 'Enquiry';
    var body = summary(form);
    var mail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(title + ' – website enquiry') + '&body=' + encodeURIComponent(body);
    var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(title + '\n' + body);
    showStatus(form, 'error',
      '<p><strong>Your request could not be sent online right now.</strong> Please contact us directly — your details are pre-filled:</p>' +
      '<div class="form__fallback">' +
      '<a href="' + mail + '">Email us</a>' +
      '<a href="tel:' + PHONE + '">Call +91 9980993995</a>' +
      '<a href="' + wa + '" target="_blank" rel="noopener noreferrer">WhatsApp us</a>' +
      '</div>');
  }

  function textFromHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').trim();
  }

  function submitToWpforms(form) {
    var base = form.getAttribute('data-wpforms-base');
    var formId = form.getAttribute('data-wpforms-id');
    var tokenPage = form.getAttribute('data-wpforms-page') || '';

    // Give up after TIMEOUT so a blocked or slow request never leaves the form stuck.
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT);

    // 1. Load the live WordPress page to obtain a current anti-spam token.
    return fetch(base + tokenPage, { credentials: 'same-origin', signal: controller.signal })
      .then(function (res) {
        if (!res.ok) throw new Error('token page ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var live = new DOMParser().parseFromString(html, 'text/html').getElementById('wpforms-form-' + formId);
        if (!live || !live.getAttribute('data-token')) throw new Error('live form not found');

        var data = new FormData(form);
        // Take server-issued fields (e.g. time_token) but keep this page's own page_* values.
        live.querySelectorAll('input[type="hidden"]').forEach(function (h) { if (!data.has(h.name)) data.set(h.name, h.value); });
        data.set('wpforms[token]', live.getAttribute('data-token'));
        data.set('action', 'wpforms_submit');

        // 2. Submit through WPForms' own AJAX handler.
        return fetch(base + 'wp-admin/admin-ajax.php', { method: 'POST', body: data, credentials: 'same-origin', signal: controller.signal });
      })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json && json.success) {
          var msg = json.data && json.data.confirmation ? textFromHtml(json.data.confirmation) : '';
          return msg || 'Thanks for contacting us! We will be in touch with you shortly.';
        }
        throw new Error('rejected');
      })
      .finally(function () { clearTimeout(timer); });
  }

  document.querySelectorAll('form[data-wpforms-id]').forEach(function (form) {
    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.has-error')) fieldError(e.target, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var button = form.querySelector('[type="submit"]');
      var label = button.innerHTML;
      button.disabled = true;
      button.textContent = 'Sending…';

      submitToWpforms(form)
        .then(function (message) {
          showStatus(form, 'success', '<p>' + message.replace(/</g, '&lt;') + '</p>');
          form.reset();
        })
        .catch(function () { showFallback(form); })
        .then(function () {
          button.disabled = false;
          button.innerHTML = label;
        });
    });
  });
})();
