"use server";

import { getCoursePrice, type CoursePrice } from "@/lib/pricing";

export async function getCoursePriceAction(): Promise<CoursePrice> {
  return getCoursePrice();
}