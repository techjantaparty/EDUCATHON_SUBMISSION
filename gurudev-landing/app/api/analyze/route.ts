import { GoogleGenerativeAI } from "@google/generative-ai";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

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
    const formData = await req.formData();
    const pdfFile = formData.get("pdfFile") as File;
    const tips = (formData.get("tips") as string) || "";
    const jobRole = formData.get("jobRole") as string;

    if (!pdfFile || !jobRole) {
      throw new Error("Please provide a PDF file and job role");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const prompt = `
        You are an expert in analyzing resume. Analyze the resume and provide a concise summary and insights about the candidate's experience and skills according to the job role: ${jobRole}, carefully 
        analyzing each section of the resume, highlighting any key points and give some suggestions for improving the resume as per the job role and provide any additional tips for the candidate according to ${tips}. Also rate it on scale of 1 to 100 as per ATS standards and structure the output in the following format:
  
    Structure the output as an object with the following fields:
    - "content": An object containing the resume content.
    - "score": A number between 1 and 100 indicating the resume score as per the job role and not according to skills already mentioned.
    - "error": A boolean indicating if an error occurred.
    - "errorMessage": If "error" is true, provide a brief message describing the error; otherwise, leave this empty.
    - "summary": The summary of the resume
    - "suggestions": An array of suggestions as strings for improving the resume. (Don't inlcude any special characters in the suggestions)
    - "additonal_tips": A string containing any additional tips or suggestions for the candidate to improve their resume.
  
    Example output for successful extraction:
    {
      "error": false,
      "errorMessage": "",
      "content": {
        "score": 80,
        "summary": "write summary here",
        "suggestions": ["write suggestions here"],
        "additional_tips": "write additional tips here"
      }
    }
  
    Example output if an error occurs:
    {
      "error": true,
      "errorMessage": "An error occurred while analyzing the resume",
      "content": {
        "score": 0,
        "summary": "",
        "suggestions": [],
        "additional_tips": ""
      }
    }
  `;

    const pdfPart = fileToGenerativePart(base64Data, pdfFile.type);

    const result = await model.generateContent([prompt, pdfPart]);

    const content = JSON.parse(
      result.response
        .text()
        .replace(/^\s*```json/, "")
        .replace(/```$/, "")
    );

    if (content.error) {
      throw new Error(content.errorMessage);
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
