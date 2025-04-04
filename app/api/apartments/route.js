// app/api/apartments/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    const typeResult = await db.query(
      `INSERT INTO apartment_types (
                total_area,
                studio_area,
                bedroom_area,
                bedroom2_area,
                bedroom3_area,
                bathroom_area,
                bathroom2_area,
                living_room_area,
                balcony_area,
                balcony2_area,
                polygon_coords,
                type_name,
                room_details
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13
            )
            RETURNING type_id`,
      [
        parseFloat(data.total_area) || 0,
        parseFloat(data.studio_area) || null,
        parseFloat(data.bedroom_area) || null,
        parseFloat(data.bedroom2_area) || null,
        null, // bedroom3_area
        parseFloat(data.bathroom_area) || null,
        parseFloat(data.bathroom2_area) || null,
        parseFloat(data.living_room_area) || null,
        parseFloat(data.balcony_area) || null,
        parseFloat(data.balcony2_area) || null,
        null, // polygon_coords
        null, // type_name
        null, // room_details
      ]
    );

    console.log("Type creation result:", typeResult);

    // Get the type ID
    const typeId = typeResult[0]?.type_id;
    console.log("Created type with ID:", typeId);

    if (!typeId) {
      throw new Error("Failed to create apartment type");
    }

    // Find the maximum existing apartment_id
    const maxIdResult = await db.query(
      "SELECT MAX(CAST(apartment_id AS INTEGER)) as max_id FROM apartments"
    );
    const nextId = (maxIdResult[0]?.max_id || 0) + 1;
    const nextApartmentIdString = nextId.toString();

    if (nextApartmentIdString.length > 3) {
      // Handle potential overflow if ID exceeds varchar(3) limit
      // You might want to log this or reconsider the column type
      console.error("FATAL: Next apartment_id exceeds varchar(3) limit!");
      throw new Error("Cannot generate new apartment ID, limit reached.");
    }

    // Insert apartment without project_id
    const apartmentResult = await db.query(
      `INSERT INTO apartments (
                apartment_id,
                block_id,
                apartment_number,
                floor,
                type_id,
                status,
                home_2d,
                home_3d
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING apartment_id`,
      [
        nextApartmentIdString,
        data.block_id,
        data.apartment_number.toString(),
        parseInt(data.floor).toString(),
        typeId.toString(),
        data.status || "available",
        data.home_2d || null,
        data.home_3d || null,
      ]
    );

    console.log("Apartment creation result:", apartmentResult);

    const apartmentId = apartmentResult[0]?.apartment_id;
    console.log("Created apartment with ID:", apartmentId);
    console.log("Using type ID:", typeId);

    if (!apartmentId) {
      await db.query("DELETE FROM apartment_types WHERE type_id = $1", [
        typeId,
      ]);
      throw new Error("Failed to create apartment");
    }

    // Select the newly created apartment
    console.log(`Fetching details for apartment ID: ${apartmentId}`);
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
                t.balcony2_area,
                p.id as project_id,
                p.title_ge as project_name,
                bb.block_name
            FROM apartments a
            JOIN apartment_types t ON a.type_id = t.type_id::TEXT
            JOIN building_blocks bb ON a.block_id = bb.block_id::TEXT
            JOIN project_blocks pb ON a.block_id = pb.block_id::TEXT
            JOIN projects p ON pb.project_id::TEXT = p.id::TEXT
            WHERE a.apartment_id = $1
        `,
      [apartmentId]
    );
    console.log("Fetched apartment details result:", newApartment);

    const apartmentDetails = newApartment?.[0];
    console.log("Apartment details to return:", apartmentDetails);

    if (!apartmentDetails) {
      // Log a warning if details weren't found, but still return success as creation worked
      console.warn(
        `Could not fetch details for newly created apartment ID: ${apartmentId}. The apartment was created, but related data (block/project) might be missing.`
      );
    }

    revalidatePath("/admin/dashboard");
    console.log("Revalidated path: /admin/dashboard after POST");

    return NextResponse.json({
      status: "success",
      message: "ბინა წარმატებით დაემატა",
      data: {
        apartment_id: apartmentId,
        type_id: typeId,
        details: apartmentDetails || null,
      },
    });
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინის დამატებისას",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Log ALL received search params ---
    console.log(
      "API /api/apartments received searchParams:",
      Object.fromEntries(searchParams.entries())
    );

    const project_id = searchParams.get("project_id");
    const statuses = searchParams.get("statuses")?.split(",") || [];
    const totalAreaMin = Number(searchParams.get("totalAreaMin")) || 0;
    const totalAreaMax = Number(searchParams.get("totalAreaMax")) || Infinity;
    // --- Read blocks parameter ---
    const blockCodes =
      searchParams.get("blocks")?.split(",").filter(Boolean) || []; // Get blocks as an array

    console.log("API Request params:", {
      project_id,
      statuses,
      totalAreaMin,
      totalAreaMax,
      blocks: blockCodes, // Log the parsed blocks array
    });

    if (!project_id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Project ID is required for fetching apartments.",
        },
        { status: 400 }
      );
    }

    // Corrected Query Structure
    let query = `
            SELECT 
                a.apartment_id, 
                a.block_id as apartment_block_code, -- Keep original apartment block code
                a.apartment_number,
                a.floor,
                a.status,
                a.home_2d,
                a.home_3d,
                t.total_area, 
                bb.block_code, -- Block code from the main block table
                bb.block_name, 
                p.title_ge as project_name,
                p.id as project_id
            FROM apartments a
            LEFT JOIN apartment_types t ON a.type_id::TEXT = t.type_id::TEXT -- Join types (adjust cast if needed)
            JOIN building_blocks_idk bb ON a.block_id = bb.block_code -- Join apartments to blocks on text code
            JOIN project_blocks pb ON bb.id = pb.block_id -- Join blocks (via id) to project_blocks
            JOIN projects p ON pb.project_id = p.id -- Join project_blocks to projects
            WHERE p.id = $1 -- Filter by project ID
        `;

    const queryParams = [project_id];
    let paramIndex = 1;

    // Add status filter if provided
    if (statuses.length > 0) {
      const statusPlaceholders = statuses
        .map(() => `$${++paramIndex}`)
        .join(",");
      query += ` AND a.status IN (${statusPlaceholders})`;
      queryParams.push(...statuses);
    }

    // --- Add block filter if provided ---
    if (blockCodes.length > 0) {
      query += ` AND bb.block_code = ANY($${++paramIndex}::text[])`; // Use ANY for array comparison
      queryParams.push(blockCodes);
    }

    // Add area filters if provided
    if (totalAreaMin > 0) {
      query += ` AND t.total_area::numeric >= $${++paramIndex}`;
      queryParams.push(totalAreaMin);
    }

    if (totalAreaMax < Infinity) {
      query += ` AND t.total_area::numeric <= $${++paramIndex}`;
      queryParams.push(totalAreaMax);
    }

    query += ` ORDER BY bb.block_name, CAST(a.floor AS INTEGER), a.apartment_number`;

    // --- Log FINAL query and params before execution ---
    console.log("API /api/apartments executing SQL query:", query);
    console.log("API /api/apartments executing SQL params:", queryParams);

    const result = await db.query(query, queryParams);

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "შეცდომა ბინების წამოღებისას",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
