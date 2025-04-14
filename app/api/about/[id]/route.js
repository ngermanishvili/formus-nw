// app/api/about/[id]/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request, { params }) {
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
            WHERE id = $1
        `, [params.id]);

        if (!result.length) {
            return NextResponse.json(
                {
                    status: "error",
                    message: `ჩანაწერი ID ${params.id}-ით ვერ მოიძებნა`
                },
                { status: 404 }
            );
        }

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
                message: "მონაცემების მოძიებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        console.log('About update request started for ID:', params.id);

        // Parse the request body
        const requestData = await request.json();
        console.log('Request data received:', JSON.stringify(requestData));

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
        } = requestData;

        // ვალიდაცია
        if (!title_ge || !title_en || !description_ge || !description_en) {
            console.log('Validation failed: Missing required text fields');
            return NextResponse.json(
                {
                    status: "error",
                    message: "ყველა სავალდებულო ტექსტური ველი უნდა იყოს შევსებული"
                },
                { status: 400 }
            );
        }

        // Check if current record exists and get current image if needed
        const currentRecord = await db.query(`
            SELECT image_url FROM about_section WHERE id = $1
        `, [params.id]);

        if (!currentRecord.length) {
            console.log(`Record with ID ${params.id} not found`);
            return NextResponse.json(
                {
                    status: "error",
                    message: `ჩანაწერი ID ${params.id}-ით ვერ მოიძებნა`
                },
                { status: 404 }
            );
        }

        // Use existing image if new one is not provided
        const finalImageUrl = image_url || currentRecord[0].image_url;
        console.log('Using image URL:', finalImageUrl);

        // Update the record
        console.log('Executing database update query');
        const result = await db.query(`
            UPDATE about_section 
            SET 
                title_ge = $1,
                title_en = $2,
                description_ge = $3,
                description_en = $4,
                image_url = $5,
                map_url = $6,
                address_ge = $7,
                address_en = $8,
                phone = $9,
                email = $10,
                order_position = $11,
                is_active = $12,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $13
            RETURNING *
        `, [
            title_ge,
            title_en,
            description_ge,
            description_en,
            finalImageUrl,
            map_url,
            address_ge,
            address_en,
            phone,
            email,
            order_position || 1,  // Default to 1 if not provided
            is_active !== undefined ? is_active : true,  // Default to true if not provided
            params.id
        ]);

        if (!result.length) {
            console.log('Update failed: No rows returned');
            return NextResponse.json(
                {
                    status: "error",
                    message: `განახლება ვერ მოხერხდა: ჩანაწერი ვერ მოიძებნა`
                },
                { status: 404 }
            );
        }

        // Revalidate paths
        console.log('Update successful, revalidating paths');
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]/about');
        revalidatePath('/[locale]/about-formus');
        revalidatePath('/[locale]/about-2');
        revalidatePath('/api/about');
        revalidatePath('/admin/dashboard/about');
        revalidatePath(`/admin/dashboard/about/${params.id}/edit`);

        // Add cache control headers and return response
        const response = NextResponse.json({
            status: "success",
            data: result[0]
        });

        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        console.log('About update completed successfully');
        return response;
    } catch (error) {
        console.error('API Error in about update:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "მონაცემების განახლებისას დაფიქსირდა შეცდომა",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const result = await db.query(`
            DELETE FROM about_section 
            WHERE id = $1
            RETURNING *
        `, [params.id]);

        if (!result.length) {
            return NextResponse.json(
                {
                    status: "error",
                    message: `ჩანაწერი ID ${params.id}-ით ვერ მოიძებნა`
                },
                { status: 404 }
            );
        }

        // Revalidate paths
        console.log("Delete successful, revalidating paths");
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]/about');
        revalidatePath('/[locale]/about-formus');
        revalidatePath('/[locale]/about-2');
        revalidatePath('/api/about');
        revalidatePath('/admin/dashboard/about');

        const response = NextResponse.json({
            status: "success",
            message: "ჩანაწერი წარმატებით წაიშალა"
        });

        // Add cache control headers
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "მონაცემების წაშლისას დაფიქსირდა შეცდომა",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}