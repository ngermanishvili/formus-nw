import { NextResponse } from "next/server";
import createProjectBlocksTable from "./create-project-blocks-table";
import handler from "./add-project-data";

export const dynamic = "force-dynamic";

/**
 * API endpoint to run all database migrations
 */
export async function GET(request) {
  try {
    // Run all migrations in sequence

    // 1. Create project_blocks table if it doesn't exist
    const projectBlocksResult = await createProjectBlocksTable();

    // 2. Add data to project 11
    // Create mock request and response objects
    const mockReq = {};
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          return { status: code, ...data };
        },
      }),
    };

    const projectDataResult = await handler(mockReq, mockRes);

    return NextResponse.json({
      status: "success",
      message: "All migrations completed successfully",
      message_ge: "ყველა მიგრაცია წარმატებით დასრულდა",
      results: {
        projectBlocks: projectBlocksResult,
        projectData: projectDataResult,
      },
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Error running migrations",
        message_ge: "მიგრაციის შესრულებისას მოხდა შეცდომა",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
