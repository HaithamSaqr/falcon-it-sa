import { getSettings } from "@/lib/data-store";
import { jsonSuccess } from "@/lib/api-helpers";

// GET /api/settings/public — public endpoint for regional settings
export async function GET() {
  const settings = await getSettings();
  return jsonSuccess({
    gulfOnly: settings.regional?.gulfOnly ?? false,
    company: {
      name: settings.company.name,
      email: settings.company.email,
      phone: settings.regional?.gulfOnly
        ? { ksa: settings.company.phone.ksa }
        : settings.company.phone,
      whatsapp: settings.company.whatsapp,
      address: settings.regional?.gulfOnly
        ? { ksa: settings.company.address.ksa }
        : settings.company.address,
    },
  });
}
