import pg from "pg";
import { config } from "./db.js"; 
// import { generarLimitOffset } from "../utils/paginaion.js";

const client = new pg.Client(config);
console.log('config', config)
client.connect();
console.log('config 2', config)

const sql = "SELECT * FROM events";
const respuesta = await client.query(sql);

//tercera parte de la travesia, aquí se ingresa la query y se obtiene la respuesta en rows
export class EventRepository{
    async getEventsByFilters(name, category, startDate, tag, pageSize, page) {
        let sqlQuery = "SELECT * FROM events WHERE 1=1";
        
        if (name) {
            sqlQuery += ` AND "name" ILIKE '%${name}%'`; // Utilizamos ILIKE para una búsqueda insensible a mayúsculas y minúsculas
        }
        if (category) { //CHEQUEAR
            const categoryIdQuery = `SELECT id FROM event_categories WHERE "name" = '${category}'`;
            const { rows: categoryRows } = await client.query(categoryIdQuery);
            const categoryId = categoryRows[0]?.id;
            if (categoryId) {
                sqlQuery += ` AND id_event_category = ${categoryId}`;
            }
        }
        if (startDate) {
            sqlQuery += ` AND start_date::date = '${startDate}'::date`;
        }        
        if (tag) { //CHEQUEAR
            const tagIdQuery = `SELECT id FROM tags WHERE "name" = '${tag}'`;
            const { rows: tagRows } = await client.query(tagIdQuery);
            const tagId = tagRows[0]?.id;
            if (tagId) {
                // Luego, necesitamos verificar la tabla de relaciones event_tags para obtener eventos asociados con este tag
                sqlQuery += ` AND id IN (SELECT id_event FROM event_tags WHERE id_tag = ${tagId})`;
            }
        }
        
        // Agregar paginación utilizando la función
        sqlQuery += " " + generarLimitOffset(pageSize, page);
    
        try {
            const { rows } = await client.query(sqlQuery);
            return rows;
        } catch (error) {
            console.error("Error al ejecutar la consulta SQL:", error);
            throw new Error('Error al obtener eventos por filtros');
        }
    }
    
    
    
    
    
    
   async getEventById(id) {
        var sqlQuery = `SELECT * FROM events WHERE id = ${id}`;
        const values = client.query(sqlQuery);
        console.log(values);
        return values;
    }
    getParticipantesEvento(id, first_name, last_name, userName, attended) {
        var sqlQuery = `SELECT * FROM event_enrollment WHERE id_event = ${id}`;
        const values = client.query(sqlQuery);
        return values;
    }
    postInscripcionEvento(id_event,id_user) { 
        var vectorValores = [id_event, id_user];
        var sqlQuery = `INSERT INTO event_enrollments(id_event,id_user,registration_date_time) VALUES ($1, $2) `;
        const values = client.query(sqlQuery, vectorValores);
        return values;
    }
    async patchEnrollment(rating, description, attended, observation, id_event, id_user) {
        const existe = await client.query((`SELECT ee.id, e.start_date FROM event_enrollments ee INNER JOIN events e ON ee.id_event = e.id_event WHERE ee.id_event =${id_event} AND ee.id_user = ${id_user}`));
        const hoy = new Date();
        if(existe != null && existe.start_date < hoy){
            const query = `UPDATE event_enrollments SET description = ${description}, attended = ${attended}, observations = ${observation}, rating = ${rating} WHERE id_event = ${id_event} AND id_user = ${id_user}`;
            console.log("entró a la query update");
            return await client.query(query);
        }
        return false;
    }
    



}
