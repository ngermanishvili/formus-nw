// app/api/sliders/[id]/route.js
import { db } from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { NextResponse } from "next/server";

// სლაიდერის წაშლა
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await db.query(
            'DELETE FROM landing_sliders WHERE id = $1',
            [id]
        );

        // Revalidate paths to ensure changes are reflected immediately
        revalidatePath("/");
        revalidatePath("/api/sliders");
        revalidatePath("/[locale]");

        const response = NextResponse.json({
            status: "success",
            message: "სლაიდერი წაიშალა"
        });

        // Add cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა სლაიდერის წაშლისას"
            },
            { status: 500 }
        );
    }
}

// სლაიდერის განახლება
export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();

        const result = await db.query(
            `UPDATE landing_sliders 
             SET title_ge = $1, 
                 title_en = $2, 
                 description_ge = $3, 
                 description_en = $4,
                 image_url = $5,
                 order_position = $6
             WHERE id = $7
             RETURNING *`,
            [
                data.title_ge,
                data.title_en,
                data.description_ge,
                data.description_en,
                data.image_url,
                data.order_position,
                id
            ]
        );

        // Revalidate paths to ensure changes are reflected immediately
        revalidatePath("/");
        revalidatePath("/api/sliders");
        revalidatePath("/[locale]");

        const response = NextResponse.json({
            status: "success",
            message: "სლაიდერი განახლდა",
            data: result[0]
        });

        // Add cache control headers to prevent caching
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა სლაიდერის განახლებისას"
            },
            { status: 500 }
        );
    }
}

// სლაიდერის წამოღება
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const result = await db.query(
            'SELECT * FROM landing_sliders WHERE id = $1',
            [id]
        );

        if (result.length === 0) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "სლაიდერი ვერ მოიძებნა"
                },
                { status: 404 }
            );
        }

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
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა სლაიდერის მოძიებისას",
                detail: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// სლაიდერის პოზიციის განახლება
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { direction } = data;

        // ჯერ ვიპოვოთ მიმდინარე სლაიდერი
        const currentSlider = await db.query(
            'SELECT order_position FROM landing_sliders WHERE id = $1',
            [id]
        );

        if (currentSlider.length === 0) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "სლაიდერი ვერ მოიძებნა"
                },
                { status: 404 }
            );
        }

        const currentPosition = currentSlider[0].order_position;
        let newPosition;

        if (direction === "up") {
            newPosition = currentPosition - 1;
        } else {
            newPosition = currentPosition + 1;
        }

        // ვიპოვოთ სლაიდერი ახალ პოზიციაზე
        const swapSlider = await db.query(
            'SELECT id FROM landing_sliders WHERE order_position = $1',
            [newPosition]
        );

        if (swapSlider.length > 0) {
            // თუ არსებობს სლაიდერი ახალ პოზიციაზე, გავცვალოთ პოზიციები
            await db.query(
                `UPDATE landing_sliders 
         SET order_position = CASE 
           WHEN id = $1 THEN $2 
           WHEN id = $3 THEN $4 
         END
         WHERE id IN ($1, $3)`,
                [id, newPosition, swapSlider[0].id, currentPosition]
            );
        }

        return NextResponse.json({
            status: "success",
            message: "სლაიდერის პოზიცია განახლდა"
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: "შეცდომა სლაიდერის პოზიციის განახლებისას"
            },
            { status: 500 }
        );
    }
}