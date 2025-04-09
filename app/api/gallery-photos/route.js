import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ყველა გალერეის ფოტოს წამოღება
export async function GET(request) {
  try {
    // SQL მოთხოვნა მონაცემების წამოსაღებად
    let query = `
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
      ORDER BY display_order
    `;

    const result = await db.query(query);

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "სლაიდერის ფოტოების მოძიებისას დაფიქსირდა შეცდომა",
      },
      { status: 500 }
    );
  }
}

// ახალი ფოტოს დამატება
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      image_path,
      project_link,
      category,
      display_order,
      is_active,
    } = body;

    // ვალიდაცია
    if (!title || !image_path || !project_link) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "სათაური, ფოტოს მისამართი და პროექტის ბმული სავალდებულოა",
        },
        { status: 400 }
      );
    }

    // ყოველთვის "exterior" კატეგორიას ვიყენებთ
    const defaultCategory = "exterior";

    const result = await db.query(
      `
      INSERT INTO gallery_photos (
        title,
        description,
        image_path,
        project_link,
        category,
        display_order,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        title,
        description || null,
        image_path,
        project_link,
        defaultCategory,
        display_order || 0,
        is_active !== undefined ? is_active : true,
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
        message: "სლაიდერის ფოტოს დამატებისას დაფიქსირდა შეცდომა",
      },
      { status: 500 }
    );
  }
}
