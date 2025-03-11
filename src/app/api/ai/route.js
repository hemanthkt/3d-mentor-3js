import OpenAI from "openai";
import { use } from "react";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env["DEEPSEEK_API_KEY"],
});

export async function GET(req) {
  try {
    // const { userMessage } = await req.json();
    const question = req.nextUrl.searchParams.get("question");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a conversational Teacher for students.Use short and presice answers only. do not use any emojis or Asterisk signs in your response. ",
        },
        {
          role: "user",
          content: question,
        },
      ],
      model: "deepseek-chat",
    });

    console.log(completion.choices[0].message.content);
    const responseMessage = completion.choices[0].message.content;
    return Response.json({ message: responseMessage });
  } catch (error) {
    console.log("Error call API");

    return Response.json(
      { error: "Failed to fetch response" },
      { status: 500 }
    );
  }
}
