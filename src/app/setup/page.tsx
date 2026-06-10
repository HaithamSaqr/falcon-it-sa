import { redirect } from "next/navigation";
import { isInstalled } from "@/lib/db/config";
import SetupForm from "./setup-form";

export const metadata = {
  title: "Quick Setup — Falcon",
};

// Always evaluate install state at request time.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await isInstalled()) {
    redirect("/admin/login");
  }
  return <SetupForm />;
}
