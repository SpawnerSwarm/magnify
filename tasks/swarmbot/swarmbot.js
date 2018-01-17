'use strict';
const path = require('path');

class SwarmBot {
    constructor(app, express) {
        this.app = app;
        this.express = express;
    }

    init(){
        this.app.use('/swarmbot', this.express.static(path.join(__dirname, 'public')));
        
        this.app.get('/swarmbot/status', function (req, res) {
            res.redirect('.');
        }.bind(this));

        this.app.get('/swarmbot/console', function (req, res) {
            console.log(__dirname);
            res.render(path.join(__dirname, 'console.jade'), { locals: this.app.locals, title: 'SwarmBot' });
        }.bind(this));

        console.log(__dirname);
    }
}

module.exports = SwarmBot;