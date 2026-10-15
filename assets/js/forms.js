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
 *
 * Forms with a data-api-endpoint attribute (the contact page) instead POST JSON to
 * the Contact Form API: { firstName, email, phoneNumber, message }. The API answers
 * { success, data, errors[] } and only accepts registered website origins; anything
 * other than HTTP 2xx with success === true is treated as NOT sent.
 */
(function () {
  'use strict';

  var PHONE = '+919980993995';
  var EMAIL = 'avighnainfrasmart@gmail.com';
  var WHATSAPP = '919980993995';
  var MSG_REQUIRED = 'This field is required.';          // original WPForms wording
  var MSG_EMAIL = 'Please enter a valid email address.';  // original WPForms wording
  var MSG_PHONE = 'Please enter a valid phone number.';
  var MSG_SENT = 'Thank you! Your message has been sent successfully. Our team will get back to you.';
  var MSG_FAILED = 'We couldn’t send your message right now. Please try again in a moment.';
  var TIMEOUT = 10000;
  var API_TIMEOUT = 15000;

  function fieldError(field, message) {
    var wrap = field.closest('.field');
    var out = wrap && wrap.querySelector('.field__error');
    if (wrap) wrap.classList.toggle('has-error', !!message);
    if (out) out.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  // Any country: optional leading +, then digits with common separators, 7–15 digits (E.164 max).
  function isPhone(value) {
    var digits = value.replace(/\D/g, '');
    return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }

  function validate(form) {
    var firstInvalid = null;
    form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(function (field) {
      var value = field.value.trim();
      var message = '';
      if (field.required && !value) message = MSG_REQUIRED;
      else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = MSG_EMAIL;
      else if (field.type === 'tel' && value && !isPhone(value)) message = MSG_PHONE;
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

  function showFallback(form, lead) {
    var title = form.getAttribute('data-form-title') || 'Enquiry';
    var body = summary(form);
    var mail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(title + ' – website enquiry') + '&body=' + encodeURIComponent(body);
    var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(title + '\n' + body);
    showStatus(form, 'error',
      (lead
        ? '<p><strong>' + lead + '</strong> You can also contact us directly — your details are pre-filled:</p>'
        : '<p><strong>Your request could not be sent online right now.</strong> Please contact us directly — your details are pre-filled:</p>') +
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

  function value(form, name) {
    var field = form.elements[name];
    return field ? field.value.trim() : '';
  }

  function submitToApi(form) {
    var service = value(form, 'serviceDescription');
    // The API documents four fields only, so the optional service description travels inside the message.
    var payload = {
      firstName: value(form, 'firstName'),
      email: value(form, 'email'),
      phoneNumber: value(form, 'phoneNumber'),
      message: (service ? 'Service Description: ' + service + '\n\n' : '') + value(form, 'message')
    };

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, API_TIMEOUT);

    // The browser adds the Origin header itself; the API uses it to check the site is registered.
    return fetch(form.getAttribute('data-api-endpoint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (json) {
          if (res.ok && json && json.success === true) return MSG_SENT;
          // Details are for developers only (e.g. "Domain 'x' is not allowed"), never shown to visitors.
          console.warn('[contact form] Submission not accepted (HTTP ' + res.status + '):', json && json.errors);
          throw new Error('rejected');
        });
      })
      .finally(function () { clearTimeout(timer); });
  }

  document.querySelectorAll('form[data-wpforms-id], form[data-api-endpoint]').forEach(function (form) {
    var useApi = form.hasAttribute('data-api-endpoint');
    var sending = false;

    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.has-error')) fieldError(e.target, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending || !validate(form)) return;

      var button = form.querySelector('[type="submit"]');
      var label = button.innerHTML;
      sending = true;
      button.disabled = true;
      button.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span>Sending…';
      form.setAttribute('aria-busy', 'true');

      (useApi ? submitToApi(form) : submitToWpforms(form))
        .then(function (message) {
          showStatus(form, 'success', '<p>' + message.replace(/</g, '&lt;') + '</p>');
          form.reset();
        })
        .catch(function () { showFallback(form, useApi ? MSG_FAILED : null); })
        .then(function () {
          sending = false;
          button.disabled = false;
          button.innerHTML = label;
          form.removeAttribute('aria-busy');
        });
    });
  });
})();
