const _HINTS = [
  'UA-Arch',
  'UA-Full-Version',
  'UA-Mobile',
  'UA-Model',
  'UA-Platform-Version',
  'UA-Platform',
  'UA',
];

const express = require('express');
const app = express();

const mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
 
app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.set('view cache', true);


app.enable('trust proxy');
app.use(function (req, res, next) {
  if (req.secure) {
    res.set('Strict-Transport-Security', 'max-age=63072000; inlcudeSubdomains; preload');
    return next();
  }
  
  res.redirect(301, 'https://' + req.headers.host + req.url);
});

app.get('/', (req, res) => {
  let header = '[not set]';
  
  if (req.query.noheader != 'noheader') {
    let rawCH = [];
    
    if (typeof req.query.uach === 'string') {
      rawCH = [req.query.uach];
    } else if (Array.isArray(req.query.uach)) {
      rawCH = req.query.uach;
    }

    const acceptCH = [];

    rawCH.forEach((uach) => {
      if (_HINTS.indexOf(uach) >= 0) {
        acceptCH.push(uach);
      }
    });

    res.set('Accept-CH', acceptCH.join(', '));
    header = 'Accept-CH: ' + acceptCH.join(', ');
  }

  res.render('index', { header: header });
});

app.get('/show-headers.json', (req, res) => {
  res.json({
    'Accept-CH': res.get('Accept-CH'),
    'Sec-CH': {
      'UA-Arch': req.get('Sec-CH-UA-Arch'),
      'UA-Model': req.get('Sec-CH-UA-Model'),
      'UA-Platform': req.get('Sec-CH-UA-Platform'),
      'UA-Platform-Version': req.get('Sec-CH-UA-Platform-Version'),
      'UA': req.get('Sec-CH-UA'),
      'UA-Full-Version': req.get('Sec-CH-UA-Full-Version'),
      'UA-Mobile': req.get('Sec-CH-UA-Mobile'),
    }
  });  
});

app.use(express.static('public', { maxAge: '1d' } ));

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
