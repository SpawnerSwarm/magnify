const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 80;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Database = require('./database.js');

const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.locals.db = new Database({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
});

const pubPath = path.join(__dirname, 'public');
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'src'),
    dest: pubPath,
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(pubPath));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/componenttest', function (req, res) {
    res.render('componenttest', { title: 'Component Test', nosidebar: true });
});

app.get('/dbtest', function (req, res) {
    app.locals.db.getListOfTasks().then((results) => {
        console.log(results);
        res.render('dbtest', { locals: app.locals, content: results.length, title: 'Database Test' });
    });
});

app.locals.db.getListOfTasks().then((results) => {
    app.locals.sidebar = [];
    for (let i = 0; i < results.length; i++) {
        app.locals.sidebar.push(results[i]);
        let task = require(`./tasks/${results[i].name}/${results[i].handler}`);
        (new task(app, express)).init();
        app.locals.db.getListOfSubTasks(results[i].name).then((results2) => {
            if (results2) {
                app.locals.sidebar[i].children = [];
                for (let j = 0; j < results2.length; j++) {
                    app.locals.sidebar[i].children.push(results2[j]);
                }
            }
        });
    }
}).then(() => {
    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error', { error: err, status: err.status || 500, nosidebar: true, title: 'Error' });
    });

    app.use(function (req, res) {
        res.status(400);
        res.render('error', { error: 'Page not found', status: 404, nosidebar: true, title: 'Error' });
    });

    http.listen(port, function () {
        console.log(`listening on *:${port}`);
    });
});

