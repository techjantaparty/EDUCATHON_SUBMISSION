import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { ApiSuccess } from "@/utils/ApiSuccess";
import { ApiError } from "@/utils/ApiError";
import { SummaryModel } from "@/models/summary.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = session.user._id;

    const formData = await req.formData();
    const notebookId = formData.get("notebookId") as string;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const mediaPath = formData.get("mediaPath") as File;
    const buffer = Buffer.from(await mediaPath.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const prompt = `
    You are an expert in analyzing notes and extracting key points. Analyze the image and generate concise summary. Focus on all the key points. The output should be formatted as given in the example, an array in which the first element is the topic and the rest are the key points.
  
    **Example:**

    ["The Solar System", "The Sun is at the center", "There are eight planets", "The planets are divided into two groups: terrestrial and gas giants"]
  
    **End of Example:**
  
    If the image does not contain any educational content return null in the response like this: null
    `;

    const imagePart = fileToGenerativePart(base64Data, mediaPath.type);

    const result = await model.generateContent([prompt, imagePart]);
    const cleanedData = result.response
      .text()
      .replace(/```json\s*|\s*```/g, "");

    if (result.response.text() !== "null") {
      await SummaryModel.create({
        content: cleanedData,
        generatedBy: userId,
        notebook: notebookId,
      });
    }

    return NextResponse.json(new ApiSuccess(200, "Success", cleanedData));
  } catch (error: any) {
    return NextResponse.json(new ApiError(500, error.message), {
      status: 500,
    });
  }
}
