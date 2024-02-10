'use strict';

/**
 * Module Imports
 */

import type { Application } from 'express';
import { cookieParser } from 'cookieParser'
import { protonDB, protonUUID } from '@arlojay-studios/proton-atomic/'
import { electron } from '@arlojay-studios/electron-atomic/';

/**
 * Request Handler
 * @public
 */

export class neutron {
    private neutron: Application = require('express')()
    private protonDB: protonDB;
    private uuid: protonUUID;
    private electron: electron;

    /**
     * Create a new server instance
     * @param dbPath - Path of an existing database
     */

    constructor(dbPath: string) {
        this.protonDB = new protonDB(dbPath);
        this.uuid = new protonUUID();
        this.electron = new electron();
    }

    /**
     * Start the server and database
     * @param { number } port - Port the server should run on
     * @returns Server + Database handle
     */

    public async init(port: number): Promise<[Application, protonDB]> {

        try {
            await this.protonDB.open();
            await this.protonDB.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                uuid TEXT
            )`)
        } catch (error) {
            Promise.reject(error);
        } finally {
            await this.protonDB.close();
        }

        return new Promise((resolve, reject) => {

            // wip 
            this.neutron.use(cookieParser())

            this.electron.page(this.neutron)

            //wip
            this.neutron.get('/userlog', (req, res) => {
                console.log(req.cookies)
            });

            try {
                this.neutron.listen(port, () => {
                    console.log(`Neutron is running on ${port}`);
                    return resolve([this.neutron, this.protonDB]);
                });
            } catch (err) {
                reject(err);
            }
        }
        )
    }

    public async validateUUID(clientUUID: string) {
        
    }

    public async newUUID() {

    }
}
