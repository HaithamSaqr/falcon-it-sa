/**
 * Client-side API helper for form submissions.
 * Used by frontend forms to POST to /api/leads/* endpoints.
 */

import type { ApiResponse } from "./api-helpers";

export async function submitLead<T>(
  endpoint: string,
  data: T
): Promise<ApiResponse> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Request failed (${response.status})`,
      };
    }

    return result;
  } catch (error) {
    console.error(`[API Client] ${endpoint} error:`, error);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

// ── Typed helpers for each form ─────────────────────────────────────
export const api = {
  submitDemo: (data: unknown) => submitLead("/api/leads/demo", data),
  submitContact: (data: unknown) => submitLead("/api/leads/contact", data),
  submitNewsletter: (data: unknown) => submitLead("/api/leads/newsletter", data),
  submitCalculator: (data: unknown) => submitLead("/api/leads/calculator", data),
  submitTrial: (data: unknown) => submitLead("/api/leads/trial", data),
  submitPartner: (data: unknown) => submitLead("/api/leads/partner", data),
};
