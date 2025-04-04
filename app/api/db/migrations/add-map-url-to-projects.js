import { db } from "@/lib/db";

export async function addMapUrlToProjects() {
    try {
        // Check if the column already exists
        const columnExists = await db.query(`
      SELECT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'map_url'
      );
    `);

        if (columnExists[0]?.exists) {
            console.log('map_url column already exists in projects table');
            return {
                status: "success",
                message: "map_url ველი უკვე არსებობს projects ცხრილში",
                created: false
            };
        }

        // Add the column
        await db.query(`
      ALTER TABLE projects ADD COLUMN map_url TEXT;
    `);

        console.log('Successfully added map_url column to projects table');

        return {
            status: "success",
            message: "map_url ველი წარმატებით დაემატა projects ცხრილში",
            created: true
        };
    } catch (error) {
        console.error('Error adding map_url column to projects table:', error);
        throw error;
    }
}

export default addMapUrlToProjects; 