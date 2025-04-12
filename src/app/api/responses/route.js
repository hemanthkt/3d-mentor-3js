import User from "../lib/models/models";
import connectMongoDB from "../lib/mongodbConnection";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, question, answer } = await request.json();
    await connectMongoDB();
    await User.create({ email, question, answer });
    return NextResponse.json({ message: "Response created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
