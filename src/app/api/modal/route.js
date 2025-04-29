import { NextResponse } from "next/server";
import connectMongoDB from "../../../../lib/mongodb";
import { ContentModel } from "../../../../lib/models/content";
import { getServerSession } from "next-auth/next";
// import { getServerSession } from "next-auth";
import { UserModel } from "../../../../lib/models/user";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSession } from "next-auth/react";

export async function POST(request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Use POST method" }, { status: 405 });
  }

  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const userEmail = session.user.email;
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User NOt found" }, { status: 400 });
    }

    const { question, answer } = await request.json();
    await connectMongoDB();

    await ContentModel.create({ question, answer, userId: user._id });
    return NextResponse.json({ message: "Content added" }, { status: 201 });
  } catch (error) {
    console.error("Error while creating content:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
