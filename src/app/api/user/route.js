import { NextResponse } from "next/server";
import connectMongoDB from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/models/user";

export async function POST(request) {
  const { name, email } = await request.json();
  await connectMongoDB();
  await UserModel.create({ name, email });
  return NextResponse.json({ message: "User Registered" }, { status: 201 });
}
