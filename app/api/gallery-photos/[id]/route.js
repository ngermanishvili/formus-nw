import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// კონკრეტული სლაიდერის ფოტოს წამოღება
export async function GET(request, { params }) {
  try {
    const result = await db.query(
      `
            SELECT 
                id,
                title,
                description,
                image_path,
                project_link,
                category,
                display_order,
                is_active
            FROM gallery_photos 
            WHERE id = $1
        `,
      [params.id]
    );

    if (!result.length) {
      return NextResponse.json(
        {
          status: "error",
          message: `სლაიდერის ფოტო ID ${params.id}-ით ვერ მოიძებნა`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: result[0],
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "სლაიდერის ფოტოს მოძიებისას დაფიქსირდა შეცდომა",
      },
      { status: 500 }
    );
  }
}

// გალერეის ფოტოს განახლება
export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    const currentData = await db.query(
      `
            SELECT * FROM gallery_photos WHERE id = $1
        `,
      [params.id]
    );

    if (!currentData.length) {
      return NextResponse.json(
        {
          status: "error",
          message: `სლაიდერის ფოტო ID ${params.id}-ით ვერ მოიძებნა`,
        },
        { status: 404 }
      );
    }

    const title = body.title ?? currentData[0].title;
    const description = body.description ?? currentData[0].description;
    const image_path = body.image_path ?? currentData[0].image_path;
    const project_link = body.project_link ?? currentData[0].project_link;
    const category = "exterior"; // Always use exterior for consistency
    const display_order = body.display_order ?? currentData[0].display_order;
    const is_active =
      body.is_active !== undefined ? body.is_active : currentData[0].is_active;

    const result = await db.query(
      `
            UPDATE gallery_photos 
            SET 
                title = $1,
                description = $2,
                image_path = $3,
                project_link = $4,
                category = $5,
                display_order = $6,
                is_active = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `,
      [
        title,
        description,
        image_path,
        project_link,
        category,
        display_order,
        is_active,
        params.id,
      ]
    );

    return NextResponse.json({
      status: "success",
      data: result[0],
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          "სლაიდერის ფოტოს განახლებისას დაფიქსირდა შეცდომა: " + error.message,
      },
      { status: 500 }
    );
  }
}

// სლაიდერის ფოტოს წაშლა
export async function DELETE(request, { params }) {
  try {
    // Check if the photo exists first
    const checkResult = await db.query(
      `SELECT id FROM gallery_photos WHERE id = $1`,
      [params.id]
    );

    if (!checkResult.length) {
      return NextResponse.json(
        {
          status: "error",
          message: `სლაიდერის ფოტო ID ${params.id}-ით ვერ მოიძებნა`,
        },
        { status: 404 }
      );
    }

    // If the photo exists, delete it
    const result = await db.query(
      `DELETE FROM gallery_photos WHERE id = $1`,
      [params.id]
    );

    return NextResponse.json({
      status: "success",
      message: "სლაიდერის ფოტო წარმატებით წაიშალა",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "სლაიდერის ფოტოს წაშლისას დაფიქსირდა შეცდომა: " + error.message,
      },
      { status: 500 }
    );
  }
}
