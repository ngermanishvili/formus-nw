// app/api/apartments/[id]/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // 1. Retrieve type_id
    const typeResult = await db.query(
      `SELECT type_id FROM apartments WHERE apartment_id = $1`,
      [id]
    );
    console.log("Type Result:", typeResult);

    if (!typeResult || typeResult.length === 0) {
      return NextResponse.json(
        { status: "error", message: "ბინა ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    const typeId = typeResult[0].type_id;
    if (!typeId) {
      return NextResponse.json(
        { status: "error", message: "type_id ვერ მოიძებნა" },
        { status: 500 }
      );
    }

    // 2. Update apartment_types
    await db.query(
      `
      UPDATE apartment_types
      SET 
        total_area = $1,
        studio_area = $2,
        bedroom_area = $3,
        bedroom2_area = $4,
        bathroom_area = $5,
        bathroom2_area = $6,
        living_room_area = $7,
        balcony_area = $8,
        balcony2_area = $9
      WHERE type_id = $10
    `,
      [
        data.total_area || null,
        data.studio_area || null,
        data.bedroom_area || null,
        data.bedroom2_area || null,
        data.bathroom_area || null,
        data.bathroom2_area || null,
        data.living_room_area || null,
        data.balcony_area || null,
        data.balcony2_area || null,
        typeId,
      ]
    );

    // 3. Update apartments
    await db.query(
      `
      UPDATE apartments
      SET 
        apartment_number = $1,
        floor = $2,
        status = $3,
        home_2d = $4,
        home_3d = $5,
        block_id = $6
      WHERE apartment_id::TEXT = $7::TEXT
    `,
      [
        data.apartment_number || null,
        data.floor?.toString() || null,
        data.status || null,
        data.home_2d || null,
        data.home_3d || null,
        data.block_id?.toString() || null,
        id,
      ]
    );

    // 4. Fetch updated apartment data
    const updatedApartment = await db.query(
      `
      SELECT 
        a.*,
        t.total_area,
        t.studio_area,
        t.bedroom_area,
        t.bedroom2_area,
        t.bathroom_area,
        t.bathroom2_area,
        t.living_room_area,
        t.balcony_area,
        t.balcony2_area
      FROM apartments a
      JOIN apartment_types t ON a.type_id::TEXT = t.type_id::TEXT
      WHERE a.apartment_id::TEXT = $1::TEXT
    `,
      [id]
    );

    if (!updatedApartment || updatedApartment.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "განახლებული ბინის მონაცემები ვერ მოიძებნა",
        },
        { status: 500 }
      );
    }

    revalidatePath("/admin/dashboard");
    console.log("Revalidated path: /admin/dashboard after PUT");

    return NextResponse.json({
      status: "success",
      message: "ბინა წარმატებით განახლდა",
      data: updatedApartment[0],
    });
  } catch (error) {
    console.error("Error updating apartment:", {
      message: error.message,
      stack: error.stack,
      detail: error.detail,
    });

    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინის განახლებისას",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await db.query(
      `
      SELECT 
        a.*,
        t.total_area,
        t.studio_area,
        t.bedroom_area,
        t.bedroom2_area,
        t.bathroom_area,
        t.bathroom2_area,
        t.living_room_area,
        t.balcony_area,
        t.balcony2_area,
        pb.project_id,
        p.title_ge as project_name
      FROM apartments a
      JOIN apartment_types t ON a.type_id::TEXT = t.type_id::TEXT
      LEFT JOIN project_blocks pb ON a.block_id::TEXT = pb.block_id::TEXT
      LEFT JOIN projects p ON pb.project_id::TEXT = p.id::TEXT
      WHERE a.apartment_id::TEXT = $1::TEXT
    `,
      [id.toString()]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "ბინა ვერ მოიძებნა",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching apartment:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });

    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინის მოძიებისას",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// app/api/apartments/route.js
export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    // Insert apartment type and return its ID
    const typeResult = await db.query(
      `INSERT INTO apartment_types (
        total_area,
        studio_area,
        bedroom_area,
        bedroom2_area,
        bathroom_area,
        bathroom2_area,
        living_room_area,
        balcony_area,
        balcony2_area
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING type_id`,
      [
        parseFloat(data.total_area) || 0,
        parseFloat(data.studio_area) || 0,
        parseFloat(data.bedroom_area) || 0,
        parseFloat(data.bedroom2_area) || 0,
        parseFloat(data.bathroom_area) || 0,
        parseFloat(data.bathroom2_area) || 0,
        parseFloat(data.living_room_area) || 0,
        parseFloat(data.balcony_area) || 0,
        parseFloat(data.balcony2_area) || 0,
      ]
    );

    console.log("Type creation result:", typeResult);

    const typeId = typeResult[0]?.type_id;
    console.log("Created type with ID:", typeId);

    if (!typeId) {
      throw new Error("Failed to create apartment type");
    }

    // Insert apartment and return its ID
    const apartmentResult = await db.query(
      `INSERT INTO apartments (
        block_id,
        apartment_number,
        floor,
        type_id,
        status,
        home_2d,
        home_3d
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING apartment_id`,
      [
        data.block_id,
        data.apartment_number.toString(),
        parseInt(data.floor),
        typeId,
        "available",
        data.home_2d || null,
        data.home_3d || null,
      ]
    );

    console.log("Apartment creation result:", apartmentResult);

    const apartmentId = apartmentResult[0]?.apartment_id;
    console.log("Created apartment with ID:", apartmentId);

    if (!apartmentId) {
      // If apartment creation failed, delete the recently created type
      await db.query("DELETE FROM apartment_types WHERE type_id = $1", [
        typeId,
      ]);
      throw new Error("Failed to create apartment");
    }

    // Fetch complete information about the new apartment
    const newApartment = await db.query(
      `
      SELECT 
        a.*,
        t.total_area,
        t.studio_area,
        t.bedroom_area,
        t.bedroom2_area,
        t.bathroom_area,
        t.bathroom2_area,
        t.living_room_area,
        t.balcony_area,
        t.balcony2_area
      FROM apartments a
      JOIN apartment_types t ON a.type_id::TEXT = t.type_id::TEXT
      WHERE a.apartment_id::TEXT = $1::TEXT
    `,
      [apartmentId.toString()]
    );

    return NextResponse.json({
      status: "success",
      message: "ბინა წარმატებით დაემატა",
      data: {
        apartment_id: apartmentId,
        type_id: typeId,
        details: newApartment[0],
      },
    });
  } catch (error) {
    console.error("Error creating apartment:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });

    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინის დამატებისას",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error.message,
                code: error.code,
                detail: error.detail,
                hint: error.hint,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { status: "error", message: "Apartment ID is required" },
      { status: 400 }
    );
  }

  try {
    // Start a transaction
    await db.query("BEGIN");

    // 1. Find the type_id associated with the apartment
    const typeResult = await db.query(
      `SELECT type_id FROM apartments WHERE apartment_id::TEXT = $1::TEXT`,
      [id]
    );

    const typeId = typeResult?.[0]?.type_id;

    // 2. Delete the apartment
    const apartmentDeleteResult = await db.query(
      `DELETE FROM apartments WHERE apartment_id::TEXT = $1::TEXT RETURNING *`,
      [id]
    );

    // Check if the apartment was actually deleted
    if (apartmentDeleteResult.length === 0) {
      await db.query("ROLLBACK"); // Rollback if apartment not found
      return NextResponse.json(
        { status: "error", message: "ბინა ვერ მოიძებნა წასაშლელად" }, // Apartment not found for deletion
        { status: 404 }
      );
    }

    // 3. Delete the associated apartment type if it exists
    if (typeId) {
      await db.query(
        `DELETE FROM apartment_types WHERE type_id::TEXT = $1::TEXT`,
        [typeId]
      );
      console.log(`Deleted associated apartment type: ${typeId}`);
    } else {
      console.warn(
        `No associated type_id found for apartment ${id}. Type not deleted.`
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    revalidatePath("/admin/dashboard"); // Revalidate the dashboard path
    console.log("Revalidated path: /admin/dashboard after DELETE");

    return NextResponse.json({
      status: "success",
      message: "ბინა და მისი მონაცემები წარმატებით წაიშალა", // Apartment and its data deleted successfully
    });
  } catch (error) {
    // Rollback in case of any error
    await db.query("ROLLBACK");

    console.error("Error deleting apartment:", {
      message: error.message,
      stack: error.stack,
      detail: error.detail,
      code: error.code,
    });

    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინის წაშლისას", // Error deleting apartment
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
