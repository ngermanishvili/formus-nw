// app/api/about/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const result = await db.query(`
            SELECT 
                id,
                title_ge,
                title_en,
                description_ge,
                description_en,
                image_url,
                map_url,
                address_ge,
                address_en,
                phone,
                email,
                order_position,
                is_active,
                created_at,
                updated_at
            FROM about_section 
            ORDER BY order_position ASC
        `);

        // Create response with proper cache headers
        const response = NextResponse.json({
            status: "success",
            data: result
        });

        // Add cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "მონაცემების მოძიებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const {
            title_ge,
            title_en,
            description_ge,
            description_en,
            image_url,
            map_url,
            address_ge,
            address_en,
            phone,
            email,
            order_position,
            is_active
        } = await request.json();

        // ვალიდაცია
        if (!title_ge || !title_en || !description_ge || !description_en || !image_url) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "ყველა სავალდებულო ველი უნდა იყოს შევსებული"
                },
                { status: 400 }
            );
        }

        const result = await db.query(`
            INSERT INTO about_section (
                title_ge,
                title_en,
                description_ge,
                description_en,
                image_url,
                map_url,
                address_ge,
                address_en,
                phone,
                email,
                order_position,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            title_ge,
            title_en,
            description_ge,
            description_en,
            image_url,
            map_url,
            address_ge,
            address_en,
            phone,
            email,
            order_position,
            is_active
        ]);

        // Revalidate paths to ensure fresh data
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]/about');
        revalidatePath('/api/about');
        revalidatePath('/admin/dashboard/about');

        // Create response with proper cache headers
        const response = NextResponse.json({
            status: "success",
            data: result[0]
        });

        // Add cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "მონაცემების დამატებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}