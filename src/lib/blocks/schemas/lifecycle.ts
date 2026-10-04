import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { roleIdSchema, b } from "../fields";
import { rolesSchema, checkRoles, checkRecordKeys, checkRoleRefs, defaultRoles } from "../roles";

/** One lifecycle stage. `roles` lists the role ids for which the stage is lit. */
const stageSchema = z.object({
  title: biRequiredSchema,
  description: biSchema,
  modules: biSchema,
  roles: z.array(roleIdSchema).max(6),
});

/** What the selected role gets, shown under the lifecycle. */
const roleSummarySchema = z.object({
  headline: biRequiredSchema,
  points: z.array(biSchema).max(8),
});

export const lifecycleSchema = z
  .object({
    heading: biRequiredSchema,
    intro: biSchema,
    yourRoleLabel: biSchema,
    roles: rolesSchema,
    stages: z.array(stageSchema).min(1).max(12),
    summary: z.record(roleIdSchema, roleSummarySchema),
  })
  .superRefine((v, ctx) => {
    const declared = checkRoles(v.roles, ctx);
    v.stages.forEach((stage, i) => checkRoleRefs(["stages", i, "roles"], stage.roles, declared, ctx));
    checkRecordKeys("summary", v.summary, declared, ctx);
  });

export type LifecycleContent = z.infer<typeof lifecycleSchema>;

export const lifecycleDefaults = (): LifecycleContent => ({
  heading: b("One number runs through every stage."),
  intro: b(""),
  yourRoleLabel: b("Your role", "دورك هنا"),
  roles: defaultRoles(),
  stages: [{ title: b("Stage one"), description: b(""), modules: b(""), roles: ["main"] }],
  summary: {},
});
