const express = require('express');

const app = express();

const path = require('path');

const port = process.env.PORT || 3000;

const handlebars = require('express-handlebars');

app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine({
    defaultLayout: 'index',
    layoutsDir: __dirname + '/views/layouts', 
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials/' 
}));

app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const router = require('./routes/index.js');
const viabilidad = require('./routes/viabilidad.js');

app.use('/', router);
app.use('/viabilidad', viabilidad);

app.listen(port, () => console.log(`App listening to port ${port}`));