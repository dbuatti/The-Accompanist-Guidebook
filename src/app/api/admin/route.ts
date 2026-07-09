import { NextRequest, NextResponse } from "next/server";
import { syncLessonContent, restructureCourse, fixCourseStructure, scaffoldAuditionGuidebook, stripModuleNumberPrefixes } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing 'action' field" }, { status: 400 });
    }

    let result: any;

    switch (action) {
      case "syncLessons":
        result = await syncLessonContent();
        break;
      case "restructureCourse":
        result = await restructureCourse();
        break;
      case "fixCourseStructure":
        result = await fixCourseStructure();
        break;
      case "scaffold":
        result = await scaffoldAuditionGuidebook();
        break;
      case "stripPrefixes":
        result = await stripModuleNumberPrefixes();
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("API admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
