import { z } from "zod";
import { biRequiredSchema, type Bi } from "./bi";
import { roleIdSchema } from "./fields";

/** Roles declared by a role-aware block (sector pages). */
export const roleSchema = z.object({
  id: roleIdSchema,
  label: biRequiredSchema,
});
export const rolesSchema = z.array(roleSchema).min(1).max(6);
export type Role = { id: string; label: Bi };

type Path = (string | number)[];

/** Role ids must be unique. Call from the block's outer superRefine. */
export function checkRoles(roles: Role[], ctx: z.RefinementCtx): Set<string> {
  const seen = new Set<string>();
  roles.forEach((r, i) => {
    if (seen.has(r.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate role id "${r.id}"`,
        path: ["roles", i, "id"],
      });
    }
    seen.add(r.id);
  });
  return seen;
}

/** Every key of a Record<roleId, ...> must be a declared role. */
export function checkRecordKeys(
  field: string,
  record: Record<string, unknown>,
  declared: Set<string>,
  ctx: z.RefinementCtx,
): void {
  for (const key of Object.keys(record)) {
    if (!declared.has(key)) {
      ctx.addIssue({
        code: "custom",
        message: `Unknown role id "${key}"; add it to roles first`,
        path: [field, key],
      });
    }
  }
}

/** Every declared role must have an entry in a Record<roleId, ...>. */
export function checkRecordComplete(
  field: string,
  record: Record<string, unknown>,
  declared: Set<string>,
  ctx: z.RefinementCtx,
): void {
  for (const id of declared) {
    if (!(id in record)) {
      ctx.addIssue({
        code: "custom",
        message: `Missing entry for role "${id}"`,
        path: [field, id],
      });
    }
  }
}

/** Every id in a string[] of role ids must be declared. */
export function checkRoleRefs(
  path: Path,
  ids: string[],
  declared: Set<string>,
  ctx: z.RefinementCtx,
): void {
  ids.forEach((id, i) => {
    if (!declared.has(id)) {
      ctx.addIssue({
        code: "custom",
        message: `Unknown role id "${id}"; add it to roles first`,
        path: [...path, i],
      });
    }
  });
}

/** Defaults helper: a single starter role. */
export function defaultRoles(): Role[] {
  return [{ id: "main", label: { en: "Owner", ar: "المالك" } }];
}
