document.addEventListener('DOMContentLoaded', function () {
  const serviceConfig = {
    in_person: {
      formHeading: 'Request an in-person notary appointment.',
      formSubheading: 'Complete the form below to request in-person or mobile notary service, or join the remote online notary notification list.',
      buttonText: 'Request In-Person Appointment',
      summaryHeading: 'Estimated in-person pricing',
      ackCopy: 'I understand that appointments are by request only, that no rush service is offered, and that the appointment is not final until availability is confirmed.',
      autoResponse: 'Thank you for your in-person notary request. We have received your intake form and will follow up shortly from notary.service@ralwyn.com with availability, confirmation, and next steps.',
      successCopy: 'Your in-person notary request has been submitted successfully. We will review your details and follow up shortly from notary.service@ralwyn.com with appointment confirmation.',
      estimateValue: '$50 minimum',
      requestType: 'In-Person Notary',
      note: 'Submitting this form creates a stored intake record through Formspree for follow-up and confirmation.'
    },
    mobile: {
      formHeading: 'Request a mobile notary appointment.',
      formSubheading: 'Complete the form below to request in-person or mobile notary service, or join the remote online notary notification list.',
      buttonText: 'Request Mobile Notary',
      summaryHeading: 'Estimated mobile pricing',
      ackCopy: 'I understand that appointments are by request only, that no rush service is offered, and that the appointment is not final until availability is confirmed.',
      autoResponse: 'Thank you for your mobile notary request. We have received your intake form and will follow up shortly from notary.service@ralwyn.com with availability, travel pricing, and next steps.',
      successCopy: 'Your mobile notary request has been submitted successfully. We will review your details and follow up shortly from notary.service@ralwyn.com with availability and travel confirmation.',
      estimateValue: '$50 before extra mileage',
      requestType: 'Mobile Notary',
      note: 'Submitting this form creates a stored intake record through Formspree for follow-up, travel confirmation, and scheduling.'
    },
    ron_waitlist: {
      formHeading: 'Join the remote online notary notification list.',
      formSubheading: 'Complete the form below to request in-person or mobile notary service, or join the remote online notary notification list.',
      buttonText: 'Join Remote Notary Waitlist',
      summaryHeading: 'Remote online notary status',
      ackCopy: 'I understand that Remote Online Notary service is not active yet and that this submission places me on the notification list only. No remote appointment is being booked at this time.',
      autoResponse: 'Thank you for your interest in Remote Online Notary service. Tennessee approval is still in progress. We have added your information to the notification list and will follow up once remote service becomes available.',
      successCopy: 'Your Remote Online Notary interest request has been submitted successfully. We will notify you from notary.service@ralwyn.com when remote service becomes available.',
      estimateValue: 'RON coming soon',
      requestType: 'Remote Online Notary Waitlist',
      note: 'Submitting this form joins the remote online notary waitlist only. No remote booking is being confirmed at this time.'
    }
  };

  const state = { current: 'in_person' };
  const PREMIUM_LOCATION = 'Customer Suggested Location Premium Tier (Increased Mileage Cost)';

  const ack = document.getElementById('notaryAck');
  const requestButton = document.getElementById('requestButton');
  const submittedAt = document.getElementById('submitted_at');
  const formError = document.getElementById('form-error');
  const summaryAlert = document.getElementById('summary-alert');
  const formShell = document.getElementById('form-shell');
  const successBox = document.getElementById('success-box');
  const successCopy = document.getElementById('success-copy');
  const notaryForm = document.getElementById('notary-form');
  const estimateTotal = document.getElementById('estimate_total');
  const serviceRequestType = document.getElementById('service_request_type');
  const autoResponse = document.getElementById('autoresponse');
  const formHeading = document.getElementById('form-heading');
  const formSubheading = document.getElementById('form-subheading');
  const summaryHeading = document.getElementById('summary-heading');
  const ackCopy = document.getElementById('ack-copy');
  const formNote = document.getElementById('form-note');

  const stampCount = document.getElementById('stamp_count');
  const mobileStampCount = document.getElementById('mobile_stamp_count');
  const preferredDate = document.getElementById('preferred_date');
  const preferredTime = document.getElementById('preferred_time');
  const mobilePreferredDate = document.getElementById('mobile_preferred_date');
  const mobilePreferredTime = document.getElementById('mobile_preferred_time');
  const meetingLocation = document.getElementById('meeting_location');
  const premiumLocationFields = document.getElementById('premium-location-fields');
  const premiumAddress = document.getElementById('premium_address');
  const premiumCity = document.getElementById('premium_city');
  const premiumZip = document.getElementById('premium_zip');
  const idReady = document.getElementById('id_ready');
  const mobileIdReady = document.getElementById('mobile_id_ready');
  const idReadyAlert = document.getElementById('id-ready-alert');
  const mobileIdReadyAlert = document.getElementById('mobile-id-ready-alert');

  const summaryStampFee = document.getElementById('summary-stamp-fee');
  const summaryLocationTier = document.getElementById('summary-location-tier');
  const summaryPremiumLine = document.getElementById('summary-premium-line');
  const summaryTotal = document.getElementById('summary-total');
  const summaryMobileStampFee = document.getElementById('summary-mobile-stamp-fee');
  const summaryMobileTotal = document.getElementById('summary-mobile-total');

  const cardInPerson = document.getElementById('card-inperson');
  const cardMobile = document.getElementById('card-mobile');
  const cardRon = document.getElementById('card-ron');

  if (!notaryForm) return;

  submittedAt.value = new Date().toISOString();

  function dollars(v) { return '$' + v; }

  function syncButtonState() {
    requestButton.setAttribute('aria-disabled', ack.checked ? 'false' : 'true');
  }

  function setRequiredState(containerId, isRequired) {
    document.querySelectorAll('#' + containerId + ' input, #' + containerId + ' select, #' + containerId + ' textarea').forEach(function(field) {
      if (isRequired) {
        field.setAttribute('required', 'required');
      } else {
        field.removeAttribute('required');
        field.setCustomValidity('');
      }
    });
  }

  function toggleVisible(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    if (show) {
      el.classList.add('is-visible');
      el.classList.remove('hidden-block');
    } else {
      el.classList.remove('is-visible');
      el.classList.add('hidden-block');
    }
  }

  function togglePremiumAddressFields(show) {
    toggleVisible('premium-location-fields', show);
    premiumAddress.required = show;
    premiumCity.required = show;
    premiumZip.required = show;
    if (!show) {
      premiumAddress.value = '';
      premiumCity.value = '';
      premiumZip.value = '';
    }
  }

  function validateWeekdayDate(field, message) {
    if (!field.value) {
      field.setCustomValidity('');
      return;
    }
    const chosen = new Date(field.value + 'T12:00:00');
    const day = chosen.getDay();
    if (day === 0 || day === 6) {
      field.setCustomValidity(message);
      summaryAlert.hidden = false;
      summaryAlert.textContent = 'Weekends are not offered for live appointment paths. Please choose a weekday.';
    } else {
      field.setCustomValidity('');
    }
  }

  function validateBusinessTime(field, message) {
    if (!field.value) {
      field.setCustomValidity('Please choose one of the available appointment times.');
      summaryAlert.hidden = false;
      summaryAlert.textContent = 'Please choose one of the available appointment times.';
      return;
    }
    const parts = field.value.split(':');
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    if (![0, 15, 30, 45].includes(minute)) {
      field.setCustomValidity('Accepted times must end in :00, :15, :30, or :45.');
      summaryAlert.hidden = false;
      summaryAlert.textContent = 'Accepted times must end in :00, :15, :30, or :45.';
      return;
    }
    if (hour < 8 || hour > 16 || (hour === 16 && minute > 0)) {
      field.setCustomValidity(message);
      summaryAlert.hidden = false;
      summaryAlert.textContent = 'Business hours for live appointment paths are Monday–Friday, 8:00 AM–4:00 PM.';
    } else {
      field.setCustomValidity('');
    }
  }

  function validateIdReady(field, alertEl) {
    if (!field) return;
    if (!field.value) {
      field.setCustomValidity('');
      if (alertEl) toggleVisible(alertEl.id, false);
      return;
    }
    if (field.value === 'No') {
      field.setCustomValidity('Valid government-issued ID is required before notarization can be confirmed.');
      if (alertEl) toggleVisible(alertEl.id, true);
      summaryAlert.hidden = false;
      summaryAlert.innerHTML = 'Valid government-issued ID is required before notarization can be confirmed. Please review the <a href="faq.html">FAQ</a> for ID requirements.';
      return;
    }
    field.setCustomValidity('');
    if (alertEl) toggleVisible(alertEl.id, false);
  }

  function updateInPersonSummary() {
    const stamps = Math.max(1, parseInt(stampCount.value || '1', 10));
    const stampFee = stamps * 25;
    const minimumTravelFee = 25;
    const isPremium = meetingLocation.value === PREMIUM_LOCATION;
    const premiumServiceCharge = isPremium ? 25 : 0;
    const total = stampFee + minimumTravelFee + premiumServiceCharge;
    summaryStampFee.textContent = dollars(stampFee);
    summaryLocationTier.textContent = meetingLocation.value || 'Not selected';
    toggleVisible('summary-premium-line', isPremium);
    summaryTotal.textContent = dollars(total);
    estimateTotal.value = dollars(total) + (isPremium ? ' before extra mileage review' : ' minimum');
    togglePremiumAddressFields(isPremium);
  }

  function updateMobileSummary() {
    const stamps = Math.max(1, parseInt(mobileStampCount.value || '1', 10));
    const stampFee = stamps * 25;
    summaryMobileStampFee.textContent = dollars(stampFee);
    summaryMobileTotal.textContent = dollars(stampFee + 25);
    estimateTotal.value = dollars(stampFee + 25) + ' before extra mileage';
  }

  function applyMode(mode) {
    state.current = mode;
    const cfg = serviceConfig[mode];
    formHeading.textContent = cfg.formHeading;
    formSubheading.textContent = cfg.formSubheading;
    summaryHeading.textContent = cfg.summaryHeading;
    ackCopy.textContent = cfg.ackCopy;
    requestButton.textContent = cfg.buttonText;
    autoResponse.value = cfg.autoResponse;
    serviceRequestType.value = cfg.requestType;
    successCopy.innerHTML = cfg.successCopy;
    formNote.textContent = cfg.note;
    estimateTotal.value = cfg.estimateValue;

    cardInPerson.classList.toggle('is-active', mode === 'in_person');
    cardMobile.classList.toggle('is-active', mode === 'mobile');
    cardRon.classList.toggle('is-active', mode === 'ron_waitlist');

    toggleVisible('fields-inperson', mode === 'in_person');
    toggleVisible('fields-mobile', mode === 'mobile');
    toggleVisible('fields-ron', mode === 'ron_waitlist');
    toggleVisible('summary-inperson', mode === 'in_person');
    toggleVisible('summary-mobile', mode === 'mobile');
    toggleVisible('summary-ron', mode === 'ron_waitlist');
    toggleVisible('pricing-inperson', mode === 'in_person');
    toggleVisible('pricing-mobile', mode === 'mobile');
    toggleVisible('pricing-ron', mode === 'ron_waitlist');
    toggleVisible('details-inperson', mode === 'in_person');
    toggleVisible('details-mobile', mode === 'mobile');
    toggleVisible('details-ron', mode === 'ron_waitlist');
    toggleVisible('process-inperson', mode === 'in_person');
    toggleVisible('process-mobile', mode === 'mobile');
    toggleVisible('process-ron', mode === 'ron_waitlist');

    setRequiredState('fields-inperson', mode === 'in_person');
    setRequiredState('fields-mobile', mode === 'mobile');
    setRequiredState('fields-ron', mode === 'ron_waitlist');

    summaryAlert.hidden = true;
    summaryAlert.textContent = '';

    if (mode === 'in_person') updateInPersonSummary();
    if (mode === 'mobile') updateMobileSummary();
    if (mode !== 'in_person') togglePremiumAddressFields(false);
    validateIdReady(idReady, idReadyAlert);
    validateIdReady(mobileIdReady, mobileIdReadyAlert);
  }

  cardInPerson.addEventListener('click', function(){ applyMode('in_person'); });
  cardMobile.addEventListener('click', function(){ applyMode('mobile'); });
  cardRon.addEventListener('click', function(){ applyMode('ron_waitlist'); });
  ack.addEventListener('change', syncButtonState);

  stampCount.addEventListener('input', updateInPersonSummary);
  meetingLocation.addEventListener('change', updateInPersonSummary);
  mobileStampCount.addEventListener('input', updateMobileSummary);
  idReady.addEventListener('change', function(){ validateIdReady(idReady, idReadyAlert); });
  mobileIdReady.addEventListener('change', function(){ validateIdReady(mobileIdReady, mobileIdReadyAlert); });

  preferredDate.addEventListener('change', function(){ validateWeekdayDate(preferredDate, 'In-person appointments are available Monday through Friday only.'); });
  preferredTime.addEventListener('change', function(){ validateBusinessTime(preferredTime, 'In-person appointments must fall between 8:00 AM and 4:00 PM Monday through Friday.'); });
  mobilePreferredDate.addEventListener('change', function(){ validateWeekdayDate(mobilePreferredDate, 'Mobile appointments are available Monday through Friday only.'); });
  mobilePreferredTime.addEventListener('change', function(){ validateBusinessTime(mobilePreferredTime, 'Mobile appointments must fall between 8:00 AM and 4:00 PM Monday through Friday.'); });

  notaryForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    formError.hidden = true;
    formError.textContent = '';
    summaryAlert.hidden = true;
    summaryAlert.textContent = '';
    submittedAt.value = new Date().toISOString();

    if (state.current === 'in_person') {
      validateWeekdayDate(preferredDate, 'In-person appointments are available Monday through Friday only.');
      validateBusinessTime(preferredTime, 'In-person appointments must fall between 8:00 AM and 4:00 PM Monday through Friday.');
      validateIdReady(idReady, idReadyAlert);
      updateInPersonSummary();
    }
    if (state.current === 'mobile') {
      validateWeekdayDate(mobilePreferredDate, 'Mobile appointments are available Monday through Friday only.');
      validateBusinessTime(mobilePreferredTime, 'Mobile appointments must fall between 8:00 AM and 4:00 PM Monday through Friday.');
      validateIdReady(mobileIdReady, mobileIdReadyAlert);
      updateMobileSummary();
    }

    if (!notaryForm.reportValidity()) {
      formError.hidden = false;
      formError.innerHTML = 'Please review the highlighted fields shown in red and correct any errors before submitting. If ID is not ready, please review the <a href="faq.html">FAQ</a> before requesting service.';
      return;
    }

    requestButton.disabled = true;
    requestButton.textContent = 'Submitting...';

    try {
      const response = await fetch(notaryForm.action, {
        method: 'POST',
        body: new FormData(notaryForm),
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      formShell.style.display = 'none';
      successBox.classList.add('is-visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      formError.hidden = false;
      formError.textContent = 'We could not submit your request right now. Please try again in a moment.';
      requestButton.disabled = false;
      requestButton.textContent = serviceConfig[state.current].buttonText;
    }
  });

  document.querySelectorAll('a[href="#book-now"]').forEach(function(link){
    link.addEventListener('click', function(event){
      event.preventDefault();
      document.getElementById('book-now').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  syncButtonState();
  applyMode('in_person');
});
