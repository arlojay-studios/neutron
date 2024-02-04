'use strict';

/**
 * Module Imports
 */

import {Response, Request, Application} from 'express';
import { protonDB, protonUUID } from '@arlojay-studios/proton-atomic/core'
import { electron } from '@arlojay-studios/electron-atomic/web';

/**
 * Request Handler
 * @public
 */

export class protonServer {
    private server: Application = require('express')()

    public async init(port: number, dbPath: string): Promise<typeof db> {

        const db = new protonDB(dbPath);
        const validatior = new protonUUID();

        try {
            await db.open();
            await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY
                uuid TEXT
            )`)
        } catch (error) {
            console.error();
            return error;
        } finally {
            await db.close();
        }

        return new Promise((resolve, reject) => {
            this.server.use(async (req: Request, res: Response, next) => {
                const clientUUID = req.get('client-uuid');
                try {
                    await db.open();
                    if (clientUUID) {
                        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientUUID)) {
                            if (!await validatior.isClientInProtonDB(db, clientUUID)) {
                                validatior.storeClientIdInProtonDB(db, clientUUID);
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
                        validatior.storeClientIdInProtonDB(db, clientUUID);
                        res.send(/* Send user their new uuid */)
                    }
                } catch (err) {
                    res.status(500).json({ error: 'Internal Server Error' });
                    reject(err);
                } finally {
                    await db.close();
                }
                next();
            });

            this.server.get('/', (req: Request, res: Response) => {
                const clientUUID = req.get('client-uuid')
                electron.mainPage(res);
            });

            this.server.get('/web.ts', (req: Request, res: Response) => {
                electron.script(res);
            });

            this.server.listen(port, () => {
                console.log(`Neutron is running on ${port}`);
                resolve(db);
            });
        }
        )
    }
}