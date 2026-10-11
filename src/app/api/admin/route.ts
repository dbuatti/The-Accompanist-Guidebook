import { NextRequest, NextResponse } from "next/server";
import { syncLessonContent, restructureCourse, fixCourseStructure, scaffoldAuditionGuidebook, stripModuleNumberPrefixes, mergeDuplicateLessons } from "@/app/actions";
import { auth } from "@/lib/auth/server";
import { isAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing 'action' field" }, { status: 400 });
    }

    let result: unknown;

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
      case "mergeDuplicates":
        result = await mergeDuplicateLessons();
        break;
      case "stripPrefixes":
        result = await stripModuleNumberPrefixes();
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("API admin error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
