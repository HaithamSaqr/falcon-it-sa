import { redirect } from "next/navigation";
import { isInstalled } from "@/lib/db/config";
import { isSetupComplete } from "@/lib/auth";
import SetupForm from "./setup-form";

export const metadata = {
  title: "Quick Setup — Falcon",
};

// Always evaluate install state at request time.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // Only skip setup once the DB is configured AND an admin exists.
  if ((await isInstalled()) && (await isSetupComplete())) {
    redirect("/admin/login");
  }
  return <SetupForm />;
}
