// app/api/contactinfo/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request) {
    try {
        const data = await request.json();

        const result = await db.query(
            `INSERT INTO contact (
                address_line_ge,
                address_line_en,
                phone_number,
                email,
                map_url
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                data.address_line_ge,
                data.address_line_en,
                data.phone_number,
                data.email,
                data.map_url
            ]
        );

        // Revalidate paths to ensure fresh data
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/about');
        revalidatePath('/api/contactinfo');

        const response = NextResponse.json({
            status: "success",
            message: "კონტაქტის ინფორმაცია წარმატებით დაემატა",
            data: result[0]
        });

        // Add cache control headers
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('Error creating contact info:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა კონტაქტის ინფორმაციის დამატებისას",
                detail: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Add timestamp to query to bypass potential database query caching
        const result = await db.query(
            `SELECT * FROM contact ORDER BY id DESC LIMIT 1`
        );

        // Create response with data
        const response = NextResponse.json({
            status: "success",
            data: result[0]
        });

        // Add cache control headers to prevent browser caching
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('Error fetching contact info:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა კონტაქტის ინფორმაციის მოძიებისას"
            },
            { status: 500 }
        );
    }
}

// Add a PUT endpoint to update contact info
export async function PUT(request) {
    try {
        const data = await request.json();
        console.log("Updating contact info with data:", data);

        const result = await db.query(
            `UPDATE contact 
             SET address_line_ge = $1, 
                 address_line_en = $2, 
                 phone_number = $3, 
                 email = $4, 
                 map_url = $5, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6
             RETURNING *`,
            [
                data.address_line_ge,
                data.address_line_en,
                data.phone_number,
                data.email,
                data.map_url,
                data.id
            ]
        );

        if (result.length === 0) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "კონტაქტის ინფორმაცია ვერ მოიძებნა"
                },
                { status: 404 }
            );
        }

        // Revalidate paths to ensure fresh data
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/about');
        revalidatePath('/api/contactinfo');

        const response = NextResponse.json({
            status: "success",
            message: "კონტაქტის ინფორმაცია წარმატებით განახლდა",
            data: result[0]
        });

        // Add cache control headers
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('Error updating contact info:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა კონტაქტის ინფორმაციის განახლებისას",
                detail: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}