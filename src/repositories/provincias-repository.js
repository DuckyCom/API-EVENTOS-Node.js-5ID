import pg from "pg";
import { config } from "./db.js";

const client = new pg.Client(config);
console.log('config', config)
client.connect();
console.log('config 2', config)

const sql = "SELECT * FROM provinces";

export class ProvinciasRespository{
    


}








