console.info("💁🏻‍♀️ You've converted again! Now:")
console.info(
  "11. Observe how the conversion took place: open the DevTools Network panel and you'll see that the red pixel 🟥 on this page has sent a request to adtech. On the server, adtech decided this was a conversion, and then responded with something like /.well-known/attribution-reporting/trigger-attribution?data={OTHERDATA}. You can see this in the Network panel, in the request's Response Header 'Location'."
)
console.info(
  "12. Now that you've converted, reload chrome://conversion-internals and see how a new conversion report with a conversion data of {OTHERDATA} was created."
)
console.info(
  "13. In chrome://conversion-internals, click 'Send All Reports'. (Normally, the report would be sent by the browser with a delay, but for debugging/demo purposes we're force-sending it.)"
)
console.info(
  '14. Open or reload the reporting endpoint (adtech-dot-peacock-demo...) and see the new report appear.'
)
console.info('✨ Done!')
console.log(
  "%c👆 What's logged above makes sense and is correct only if you're following the demo steps.",
  'color: #ff8900'
)
