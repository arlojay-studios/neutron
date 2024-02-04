'use strict';

/**
 * Init
 * @param {Number} port: Which port the server will run on.
 * Usage: --port [port]
 * @param {Boolean} parity: Whether or not the server will be used as a backup. Data retention is 7 days.
 * Usage: --parity [true|false]
 * @param {String} dbPath: Where the DB resides on the file system
 * Usage: --db ['/path/to/db']
 * @private
 */

import {Database, uuidChecker} from '../proton/core';
import {Request, Response, Next} from 'express';
import * as fs from 'fs';
const argv = require('minimist')(process.argv.slice(1), {
    'default': {
        'port': 3000,
        'parity': false,
        'db': '../db/users.db'
    }
});
const server = require('express')();

/**
 * API Initialization
 */

const db = new Database(argv.db);
const validatior = new uuidChecker();

try {
    await db.open();
    await db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY
        uuid Text
    )`)
} catch(error) {
    console.error(error)
} finally {
    await db.close();
}

/**
 * Request Handler
 * @public
 */

 server.use(async (req: Request, res: Response, next: Next) => {
    const clientUUID = req.get('client-uuid');
    try {
    await db.open();
    if (clientUUID) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientUUID)) {
            if (!await validatior.isClientInDatabase(db, clientUUID)) {
                validatior.storeClientIdInDatabase(db, clientUUID);
                res.send(/* Notify user data needs to be fetched from upstream, as
                if client id valid
                but not in server
                fetch from master */)
            }
        } else {
            res.status(400).json({ error: ">:l don't spoof ClientIDs." })
        }
    } else {
        const clientUUID = validatior.generateClientId()
        validatior.storeClientIdInDatabase(db, clientUUID);
        res.send(/* Send user their new uuid */)
    }
    } catch(err) {
        res.status(500).json({error: 'Internal Server Error'});
        return;
    } finally {
        await db.close();
    }

    next();
});

server.get('/', (req: Request, res: Response) => {
    const clientUUID = req.get('client-uuid')
    res.sendFile( '../electron/bootstrap.html')
})

server.get('/web.ts', (req: Request, res: Response) => {
    res.sendFile('../electron/web.ts')
})

server.listen(argv.port, () => {
    const version = `${fs.readdir('../proton/', (err, files) => { return files.length })}.1}` /* should eventually be neutrons + proton modules dot neutrons */
    console.log(`Neutron ${version} is running on ${argv.port}`)
})