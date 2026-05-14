"use server";

import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { toUserDTO } from "@/lib/mappers";

/**
 * สร้าง User record ใน MongoDB หลังจาก Firebase Auth สำเร็จ
 * เรียกใช้จาก Client Component หลัง signInWithEmailAndPassword / signInWithPopup
 */
export async function createUserInDB(data: {
  uid: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  console.log("--- Action Started ---", data.uid);

  try {
    // บีบให้พังถ้าต่อ DB ไม่ติดใน 5 วินาที (ป้องกันอาการ Hang)
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB Connection Timeout")), 5000),
      ),
    ]);

    // ใช้ findOne เพราะเราคุม _id เอง
    const existing = await User.findOne({ _id: data.uid }).lean();

    if (existing) {
      console.log("User exists");
      return { success: true };
    }

    console.log("Creating user...");
    await User.create({
      _id: data.uid, // ยัด Firebase UID ลงไปตรงๆ
      email: data.email,
      name: data.name || "",
      image: data.image || "",
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ DB Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * ดึงข้อมูล User จาก MongoDB ด้วย Firebase UID
 */
export async function getUserByUid(uid: string) {
  try {
    await dbConnect();
    const user = await User.findById(uid).lean();
    return { success: true, user: user ? toUserDTO(user) : null };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}
