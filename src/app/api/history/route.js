import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectMongoDB from "../../../../lib/mongodb";
import { ContentModel } from "../../../../lib/models/content";
import { UserModel } from "../../../../lib/models/user";

export async function GET(req, res) {
  const session = await getServerSession(authOptions);
  console.log("Session in api/history", session);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await connectMongoDB();

  const userEmail = session.user.email;
  const userId = await UserModel.findOne({ email: userEmail });

  const data = await ContentModel.find({ userId: userId }).sort({
    createdAt: -1,
  });

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
