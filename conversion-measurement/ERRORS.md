// DEVELOPER ERROR SIMULATION
//- const adLink1 = document.getElementById('ad1')
//- adLink1.setAttribute(
//- 'impressiondata',
//- Math.floor(Math.random() \* 1000000)
//- )

//- const adLink2 = document.getElementById('ad2')
//- adLink2.setAttribute(
//- 'impressiondata',
//- Math.floor(Math.random() \* 1000000000000000000000000000000000)
//- )

    //- div Ad1: OK

//- // 864000000 = 10 days in milliseconds
//- a#ad1(href=href conversiondestination=conversiondestination impressiondata='' reportingorigin=reportingorigin impressionexpiry='864000000' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')
//- div Ad2: 🧨 dev mistake: impressiondata over 64 bits
//- a#ad2(href=href conversiondestination=conversiondestination impressiondata='' reportingorigin=reportingorigin impressionexpiry='864000000' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')
//- div Ad3: 🧨 dev mistake: impressiondata not a number
//- a(href=href conversiondestination=conversiondestination impressiondata='hello' reportingorigin=reportingorigin impressionexpiry='864000000' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')
//- div Ad3: 🧨 dev mistake: impressiondata not an integer
//- a(href=href conversiondestination=conversiondestination impressiondata=0.2 reportingorigin=reportingorigin impressionexpiry='864000000' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')
//- div Ad5: 🧨 dev mistake: required attribute missing
//- a(href=href conversiondestination=conversiondestination reportingorigin=reportingorigin impressionexpiry='864000000' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')
//- div Ad6: 🧨 dev mistake: wrong format for reportingOrigin (hostname instead of an origin)
//- a(href=href conversiondestination=conversiondestination reportingorigin=wrongReportingOrigin impressionexpiry='864000000' impressiondata='123' target='\_parent')
//- img(width='50' src='/blue-shoes.png' alt='blue shoes')

      // const reportingOrigin = process.env.ADTECH_URL

// wrong: const reportingOrigin = process.env.REPORTING_URL
// DEVELOPER ERROR SIMULATION:
// ; document.write("<div>dev mistake: iframe without policy:</div><iframe src='${adUrl}' width=190 height=500 scrolling=no frameborder=1 padding=0></iframe>");
