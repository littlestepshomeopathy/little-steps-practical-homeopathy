/**
 * Form PDF Generator
 * Generates a PDF from the form on submit, downloads it for the client,
 * and attaches it to the Formspree submission.
 */
(function () {
  var form = document.querySelector('form[action*="formspree.io"]');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var submitBtn = form.querySelector('.form-submit');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating PDF...';

    // Determine filename from the form type or page title
    var formType = form.querySelector('input[name="_form_type"]');
    var nameField = form.querySelector('input[name="First Name"], input[name="Full Name"], input[name="Name"]');
    var clientName = nameField ? nameField.value.trim().replace(/\s+/g, '-') : 'form';
    var docTitle = formType ? formType.value : document.title.split('|')[0].trim();
    var filename = clientName + '-' + docTitle.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() + '.pdf';

    // Get the form content area
    var formSection = document.querySelector('.section');

    // Show print-only elements
    var printTitle = document.querySelector('.print-title');
    var printSubtitle = document.querySelector('.print-subtitle');
    if (printTitle) printTitle.style.display = 'block';
    if (printSubtitle) printSubtitle.style.display = 'block';

    // Hide elements we don't want in the PDF
    var infoBox = formSection.querySelector('.info-box');
    var submitArea = form.querySelector('.text-center:last-child');
    if (infoBox) infoBox.style.display = 'none';
    if (submitArea) submitArea.style.display = 'none';

    // Replace inputs with their values for clean PDF rendering
    var replacements = [];

    // Text/email/tel/date/number inputs
    var inputs = formSection.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"]');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if (input.value) {
        var span = document.createElement('span');
        span.textContent = input.value;
        span.style.cssText = 'display:inline-block;padding:4px 2px;border-bottom:1px solid #999;min-width:' + input.offsetWidth + 'px;font-family:inherit;font-size:inherit;color:#333;';
        if (input.style.fontFamily) span.style.fontFamily = input.style.fontFamily;
        if (input.style.fontStyle) span.style.fontStyle = input.style.fontStyle;
        replacements.push({ original: input, replacement: span, parent: input.parentNode });
        input.parentNode.replaceChild(span, input);
      }
    }

    // Textareas
    var textareas = formSection.querySelectorAll('textarea');
    for (var j = 0; j < textareas.length; j++) {
      var ta = textareas[j];
      if (ta.value) {
        var div = document.createElement('div');
        div.textContent = ta.value;
        div.style.cssText = 'padding:8px;border:1px solid #999;border-radius:4px;min-height:60px;white-space:pre-wrap;font-family:inherit;font-size:inherit;color:#333;';
        replacements.push({ original: ta, replacement: div, parent: ta.parentNode });
        ta.parentNode.replaceChild(div, ta);
      }
    }

    // Checkboxes - replace with checked/unchecked indicator
    var checkboxes = formSection.querySelectorAll('input[type="checkbox"]');
    for (var k = 0; k < checkboxes.length; k++) {
      var cb = checkboxes[k];
      var indicator = document.createElement('span');
      indicator.textContent = cb.checked ? '\u2611 ' : '\u2610 ';
      indicator.style.cssText = 'font-size:1.2em;vertical-align:middle;margin-right:4px;';
      replacements.push({ original: cb, replacement: indicator, parent: cb.parentNode });
      cb.parentNode.replaceChild(indicator, cb);
    }

    // Radio buttons - replace with selected/unselected indicator
    var radios = formSection.querySelectorAll('input[type="radio"]');
    for (var r = 0; r < radios.length; r++) {
      var radio = radios[r];
      var rIndicator = document.createElement('span');
      rIndicator.textContent = radio.checked ? '\u25C9 ' : '\u25CB ';
      rIndicator.style.cssText = 'font-size:1.1em;vertical-align:middle;margin-right:4px;';
      replacements.push({ original: radio, replacement: rIndicator, parent: radio.parentNode });
      radio.parentNode.replaceChild(rIndicator, radio);
    }

    var opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(formSection).outputPdf('blob').then(function (pdfBlob) {
      // Restore the form to original state
      for (var n = replacements.length - 1; n >= 0; n--) {
        var r = replacements[n];
        r.parent.replaceChild(r.original, r.replacement);
      }
      if (infoBox) infoBox.style.display = '';
      if (submitArea) submitArea.style.display = '';
      if (printTitle) printTitle.style.display = '';
      if (printSubtitle) printSubtitle.style.display = '';

      // Download PDF for the client
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Submit to Formspree with PDF attachment
      submitBtn.textContent = 'Submitting...';
      var formData = new FormData(form);
      formData.append('_attachment', pdfBlob, filename);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          // Show success message
          var container = form.parentNode;
          form.style.display = 'none';
          var msg = document.createElement('div');
          msg.className = 'form-section';
          msg.style.textAlign = 'center';
          msg.style.padding = '60px 30px';
          msg.innerHTML = '<h2 style="color:#3a6b57;">Thank You!</h2>' +
            '<p style="font-size:1.1em;margin:20px 0;">Your ' + docTitle.toLowerCase() + ' has been submitted successfully.</p>' +
            '<p>A PDF copy has been downloaded to your device for your records.</p>' +
            '<p style="margin-top:30px;"><a href="work-with-me.html" class="btn-primary">Back to Work With Me</a></p>';
          container.appendChild(msg);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          alert('There was an issue submitting the form. Your PDF has been downloaded. Please try again or email the form to littlestepshomeopathy@gmail.com.');
        }
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert('There was an issue submitting the form. Your PDF has been downloaded. Please try again or email the form to littlestepshomeopathy@gmail.com.');
      });
    }).catch(function (err) {
      // Restore on error
      for (var n = replacements.length - 1; n >= 0; n--) {
        var r = replacements[n];
        if (r.replacement.parentNode === r.parent) {
          r.parent.replaceChild(r.original, r.replacement);
        }
      }
      if (infoBox) infoBox.style.display = '';
      if (submitArea) submitArea.style.display = '';
      if (printTitle) printTitle.style.display = '';
      if (printSubtitle) printSubtitle.style.display = '';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      console.error('PDF generation failed:', err);
      // Fall back to normal form submit
      form.submit();
    });
  });
})();
