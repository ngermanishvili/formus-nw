import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ყველა სოციალური ქსელის წამოღება
export async function GET() {
    try {
        const result = await db.query(`
            SELECT 
                id,
                platform,
                platform_key,
                url,
                is_visible,
                display_order
            FROM social_media_links 
            ORDER BY display_order
        `);

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
                message: "სოციალური ქსელების მოძიებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}

// ახალი სოციალური ქსელის დამატება
export async function POST(request) {
    try {
        const {
            platform,
            platform_key,
            url,
            is_visible,
            display_order
        } = await request.json();

        // ვალიდაცია
        if (!platform || !platform_key) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "პლატფორმა და platform_key სავალდებულოა"
                },
                { status: 400 }
            );
        }

        const result = await db.query(`
            INSERT INTO social_media_links (
                platform,
                platform_key,
                url,
                is_visible,
                display_order
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            platform,
            platform_key,
            url,
            is_visible || false,
            display_order || 0
        ]);

        // Revalidate paths
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/about');
        revalidatePath('/api/social-links');

        const response = NextResponse.json({
            status: "success",
            data: result[0]
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
                message: "სოციალური ქსელის დამატებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}

// სოციალური ქსელის განახლება
export async function PUT(request) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "ID პარამეტრი სავალდებულოა"
                },
                { status: 400 }
            );
        }

        const result = await db.query(`
            UPDATE social_media_links 
            SET 
                platform = $1,
                platform_key = $2,
                url = $3,
                is_visible = $4,
                display_order = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `, [
            data.platform,
            data.platform_key,
            data.url,
            data.is_visible !== undefined ? data.is_visible : true,
            data.display_order || 0,
            data.id
        ]);

        if (result.length === 0) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "სოციალური ქსელი ვერ მოიძებნა"
                },
                { status: 404 }
            );
        }

        // Revalidate paths
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/about');
        revalidatePath('/api/social-links');

        const response = NextResponse.json({
            status: "success",
            message: "სოციალური ქსელი წარმატებით განახლდა",
            data: result[0]
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
                message: "სოციალური ქსელის განახლებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
}
