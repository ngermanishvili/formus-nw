import { NextResponse } from "next/server";

export async function GET() {
    try {
        // გავგზავნოთ მოთხოვნა migrate-db ენდპოინტზე
        const response = await fetch(new URL('/api/migrate-db', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: 'add_map_url_to_projects' }),
        });

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error running migration:', error);
        return NextResponse.json(
            {
                status: "error",
                message: "მიგრაციის შესრულებისას დაფიქსირდა შეცდომა"
            },
            { status: 500 }
        );
    }
} 