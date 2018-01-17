'use strict';

const mysql = require('mysql2');
const SQL = require('sql-template-strings');
const Promise = require('bluebird');

class Database {
    constructor(dbOptions) {
        const opts = {
            supportBigNumbers: true,
            bigNumberStrings: true,
            Promise
        };
        Object.assign(opts, dbOptions);
        this.db = mysql.createConnection(opts);
    }

    getListOfTasks() {
        return new Promise((resolve) => {
            this.db.query(SQL`SELECT * FROM tasks WHERE subtaskOf IS NULL;`, function (err, results) {
                resolve(results);
            });
        });
    }

    getListOfSubTasks(parent) {
        return new Promise((resolve) => {
            this.db.query(SQL`SELECT * FROM tasks WHERE subtaskOf=${parent}`, function (err, results) {
                resolve(results);
            });
        });
    }
}

module.exports = Database;