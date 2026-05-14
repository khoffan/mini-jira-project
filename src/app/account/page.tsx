import { redirect } from "next/navigation";
import AccountForm from "./account-form";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { toUserDTO } from "@/lib/mappers";

export default async function Account() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const authUser = await User.findById(session.uid).lean();

  if (!authUser) {
    redirect("/login");
  }

  return <AccountForm user={toUserDTO(authUser)} />;
}
