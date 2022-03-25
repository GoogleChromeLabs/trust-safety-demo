if (document.featurePolicy.allowsFeature('attribution-reporting')) {
  Toastify({
    text: `The conversion pixel makes a request to the adtech endpoint (attributionsrc). \n The adtech endpoint then instructs the browser to trigger an attribution. \n If the browser finds a source event that matches this trigger, it generates an attribution report. \n You can see the report in chrome://attribution-internals.`,
    duration: -1, // infinity
    close: true,
    gravity: 'bottom',
    position: 'center',
    stopOnFocus: true, // Prevents dismissing of toast on hover
    offset: {
      y: 60
    },
    style: {
      cursor: 'default',
      background: '#000000d6',
      cursor: 'pointer',
      fontFamily: "'Lucida Console', Monaco, monospace",
      fontSize: '.8rem',
      boxShadow:
        'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;',
      borderRadius: '6px'
    }
  }).showToast()
}
