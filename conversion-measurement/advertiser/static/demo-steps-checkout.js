console.info("💁🏻‍♀️ You've converted your click! Now:")
console.info(
  "6. Observe how the conversion took place: open the DevTools Network panel and you'll see that the red pixel 🟥 on this page has sent a request to adtech. On the server, adtech decided this was a conversion, and then responded with something like /.well-known/attribution-reporting/trigger-attribution?data={DATA}. You can see this in the Network panel, in the request's Response Header 'Location'."
)
console.info(
  "7. Now that you've converted, reload chrome://conversion-internals and see how a new conversion report with a conversion data of {DATA} was created."
)
console.info(
  "8. In chrome://conversion-internals, click 'Send All Reports'. (Normally, the report would be sent by the browser with a delay, but for debugging/demo purposes we're force-sending it.)"
)
console.info(
  '9. Open or reload the reporting endpoint (adtech-dot-peacock-demo...) and see the new report appear.'
)
console.info(
  "10. (Optional) To see the same flow play out for a different conversion data value ({DATA}), click the 'Sign up' button here on this page."
)
console.log(
  "%c👆 What's logged above makes sense and is correct only if you're following the demo steps.",
  'color: #ff8900'
)
