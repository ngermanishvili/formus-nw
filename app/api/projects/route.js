import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent caching at the route level
export const revalidate = 0; // Prevent caching at the route level

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const isActive = url.searchParams.get('isActive');

        let query = `
           SELECT * FROM projects 
        `;

        if (isActive === 'true') {
            query += ` WHERE is_active = true `;
        }

        query += ` ORDER BY COALESCE(display_order, 999), created_at DESC`;

        const result = await db.query(query);

        // Add cache control headers to prevent caching
        const response = NextResponse.json({
            status: "success",
            data: result,
            timestamp: Date.now() // Add timestamp for cache busting
        });

        // Set cache control headers
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');

        return response;
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "პროექტების მოძიებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const {
            title_en,
            title_ge,
            description_en,
            description_ge,
            main_image_url,
            location_en,
            location_ge,
            features_en,
            features_ge,
            second_section_img,
            second_section_title_en,
            second_section_title_ge,
            second_section_description_en,
            second_section_description_ge,
            display_order,
            is_active,
            map_url
        } = await request.json();

        if (!title_ge || !title_en || !description_ge || !description_en || !main_image_url) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "ყველა აუცილებელი ველი უნდა იყოს შევსებული"
                },
                { status: 400 }
            );
        }

        const result = await db.query(`
           INSERT INTO projects (
               title_en,
               title_ge,
               description_en,
               description_ge,
               main_image_url,
               location_en,
               location_ge,
               features_en,
               features_ge,
               second_section_img,
               second_section_title_en,
               second_section_title_ge,
               second_section_description_en,
               second_section_description_ge,
               display_order,
               is_active,
               map_url
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING *
       `, [
            title_en,
            title_ge,
            description_en,
            description_ge,
            main_image_url,
            location_en,
            location_ge,
            features_en,
            features_ge,
            second_section_img,
            second_section_title_en,
            second_section_title_ge,
            second_section_description_en,
            second_section_description_ge,
            display_order || null,
            is_active || false,
            map_url || null
        ]);

        // Add cache control headers to prevent caching
        const response = NextResponse.json({
            status: "success",
            data: result[0],
            timestamp: Date.now() // Add timestamp for cache busting
        });

        // Set cache control headers
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');

        return response;
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "პროექტის დამატებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}