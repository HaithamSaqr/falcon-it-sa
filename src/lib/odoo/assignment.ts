/**
 * Who owns a website lead in Odoo. Both ids come from admin > Integrations
 * (or ODOO_SALESPERSON_ID / ODOO_TEAM_ID); 0 means "not set", and the field
 * is left out so Odoo applies its own default (the API user, its default team).
 */
export interface OdooAssignment {
  salespersonId: number;
  teamId: number;
}

/** Defaults that match the Odoo the site was first wired to (admin user, first team). */
export const DEFAULT_ODOO_ASSIGNMENT: OdooAssignment = { salespersonId: 2, teamId: 1 };

function positiveId(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export function normalizeAssignment(raw: Partial<Record<keyof OdooAssignment, unknown>>): OdooAssignment {
  return { salespersonId: positiveId(raw.salespersonId), teamId: positiveId(raw.teamId) };
}

/** crm.lead values for the configured owner. */
export function leadAssignmentValues(a: OdooAssignment): { user_id?: number; team_id?: number } {
  const v: { user_id?: number; team_id?: number } = {};
  if (a.salespersonId > 0) v.user_id = a.salespersonId;
  if (a.teamId > 0) v.team_id = a.teamId;
  return v;
}

/** calendar.event values: the salesperson organises it and attends through their partner. */
export function calendarAssignmentValues(
  a: OdooAssignment,
  salespersonPartnerId: number | null,
): { user_id?: number; partner_ids?: [number, number][] } {
  const v: { user_id?: number; partner_ids?: [number, number][] } = {};
  if (a.salespersonId > 0) v.user_id = a.salespersonId;
  if (salespersonPartnerId && salespersonPartnerId > 0) v.partner_ids = [[4, salespersonPartnerId]];
  return v;
}
