"use client";

/**
 * Admin form generator: renders an editor for any block from its Zod schema
 * (described by src/lib/blocks/form-schema.ts). Bilingual texts sit side by
 * side, lists get add / remove / move, images use the upload widget, role-id
 * lists become checkboxes of the block's roles and role-keyed records get one
 * sub-form per declared role.
 */
import { useMemo } from "react";
import type { Bi } from "@/lib/blocks/bi";
import type { Role } from "@/lib/blocks/roles";
import { blockForm, emptyValue, syncRoles, type ContentIssue, type FormField, type FormNode } from "@/lib/blocks/form-schema";
import type { BlockType } from "@/lib/blocks/types";
import BiField from "./field-bi";
import IconField from "./field-icon";
import ImageField from "./field-image";
import LinkField from "./field-link";
import ListField from "./field-list";
import {
  BlockFormContext,
  FieldErrors,
  FieldHint,
  fieldDomId,
  inputBorder,
  inputClass,
  issuesAt,
  joinPath,
  labelClass,
  smallButton,
  useFormCtx,
  type FormCtx,
} from "./shared";

export { fieldDomId } from "./shared";

type Obj = Record<string, unknown>;

type FieldProps = {
  node: FormNode;
  path: string;
  label: string;
  name: string;
  hint?: string;
  value: unknown;
  onChange: (v: unknown) => void;
};

function TextField({ path, label, name, hint, value, onChange, multiline, mono }: Omit<FieldProps, "node"> & { multiline?: boolean; mono?: boolean }) {
  const { idPrefix, issues } = useFormCtx();
  const v = typeof value === "string" ? value : "";
  const errors = issuesAt(issues, path, true);
  const cls = `mt-1 ${inputClass} ${inputBorder(errors.length > 0)} ${mono ? "font-mono text-[13px]" : ""}`;
  return (
    <label id={fieldDomId(idPrefix, path)} className="block scroll-mt-28">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea aria-label={name} dir="auto" rows={3} value={v} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input aria-label={name} dir={mono ? "ltr" : "auto"} type="text" value={v} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      <FieldHint text={hint} />
      <FieldErrors messages={errors} />
    </label>
  );
}

function RoleRefsField({ path, label, name, value, onChange, max }: Omit<FieldProps, "node"> & { max?: number }) {
  const { idPrefix, issues, roles } = useFormCtx();
  const ids = Array.isArray(value) ? (value as string[]) : [];
  const errors = issuesAt(issues, path, true);
  const declared = new Set(roles.map((r) => r.id));
  const stale = ids.filter((id) => !declared.has(id));
  return (
    <fieldset id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
      <legend className={labelClass}>{label}</legend>
      <p className="text-xs text-slate-500">This stage is highlighted for the ticked roles.</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {roles.map((r) => {
          const checked = ids.includes(r.id);
          return (
            <label
              key={r.id}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                checked ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                aria-label={`${name}: ${r.label.en || r.label.ar || r.id}`}
                checked={checked}
                disabled={!checked && max !== undefined && ids.length >= max}
                onChange={(e) =>
                  onChange(e.target.checked ? roles.map((x) => x.id).filter((id) => id === r.id || ids.includes(id)) : ids.filter((id) => id !== r.id))
                }
                className="h-4 w-4 accent-cyan-600"
              />
              <span dir="auto">{r.label.en || r.label.ar || r.id}</span>
            </label>
          );
        })}
        {roles.length === 0 && <span className="text-xs text-slate-500">Add roles to this block first.</span>}
      </div>
      {stale.length > 0 && (
        <p className="mt-1 text-xs text-amber-700">
          Ticked for a role that no longer exists: {stale.join(", ")}.{" "}
          <button type="button" className="underline" onClick={() => onChange(ids.filter((id) => declared.has(id)))}>
            Clear it
          </button>
        </p>
      )}
      <FieldErrors messages={errors} />
    </fieldset>
  );
}

function RoleRecordField({ node, path, label, name, hint, value, onChange }: FieldProps & { node: Extract<FormNode, { kind: "roleRecord" }> }) {
  const { idPrefix, issues, roles } = useFormCtx();
  const record = value && typeof value === "object" ? (value as Obj) : {};
  const declared = new Set(roles.map((r) => r.id));
  const stale = Object.keys(record).filter((k) => !declared.has(k));
  return (
    <div id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
      <span className={labelClass}>{label}</span>
      <p className="text-xs text-slate-500">One version per role. Visitors see the one for the role they pick.</p>
      <FieldHint text={hint} />
      <FieldErrors messages={issuesAt(issues, path)} />
      <div className="mt-2 space-y-3">
        {roles.map((r) => {
          const rolePath = joinPath(path, r.id);
          const roleName = r.label.en || r.label.ar || r.id;
          const has = Object.hasOwn(record, r.id);
          return (
            <section key={r.id} id={fieldDomId(idPrefix, rolePath)} className="scroll-mt-28 rounded-lg border border-slate-200">
              <header className="flex items-center justify-between gap-2 rounded-t-lg bg-slate-50 px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">
                  For <span dir="auto">{roleName}</span> <code className="ms-1 text-xs font-normal text-slate-500">{r.id}</code>
                </span>
                {has ? (
                  <button
                    type="button"
                    className={`${smallButton} hover:text-red-600`}
                    onClick={() => {
                      if (!window.confirm(`Remove the ${roleName} version of "${label}"?`)) return;
                      const next = { ...record };
                      delete next[r.id];
                      onChange(next);
                    }}
                  >
                    Remove this version
                  </button>
                ) : (
                  <button type="button" className={smallButton} onClick={() => onChange({ ...record, [r.id]: emptyValue(node.value) })}>
                    Add a version for {roleName}
                  </button>
                )}
              </header>
              <div className="px-3 py-3">
                {has ? (
                  <Field
                    node={node.value}
                    path={rolePath}
                    label=""
                    name={`${name}, ${roleName}`}
                    value={record[r.id]}
                    onChange={(v) => onChange({ ...record, [r.id]: v })}
                  />
                ) : (
                  <>
                    <p className="text-xs text-slate-500">No version for this role yet.</p>
                    <FieldErrors messages={issuesAt(issues, rolePath)} />
                  </>
                )}
              </div>
            </section>
          );
        })}
        {stale.map((k) => (
          <div key={k} className="flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <span>
              Text kept for a role that no longer exists: <code>{k}</code>
            </span>
            <button
              type="button"
              className={smallButton}
              onClick={() => {
                const next = { ...record };
                delete next[k];
                onChange(next);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectField({ node, path, label, name, hint, value, onChange }: FieldProps & { node: Extract<FormNode, { kind: "object" }> }) {
  const { idPrefix, issues } = useFormCtx();
  const obj = value && typeof value === "object" ? (value as Obj) : {};
  const nested = label !== "";
  const body = (
    <div className="grid gap-4">
      {node.fields.map((f: FormField) => (
        <Field
          key={f.key}
          node={f.node}
          path={joinPath(path, f.key)}
          label={f.label}
          name={name ? `${name}, ${f.label}` : f.label}
          hint={f.hint}
          value={obj[f.key]}
          onChange={(v) => onChange({ ...obj, [f.key]: v })}
        />
      ))}
    </div>
  );
  if (!nested) {
    return (
      <div id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
        <FieldErrors messages={issuesAt(issues, path)} />
        {body}
      </div>
    );
  }
  return (
    <fieldset id={fieldDomId(idPrefix, path)} className="scroll-mt-28 rounded-lg border border-slate-200 px-4 pb-4 pt-2">
      <legend className="px-1 text-sm font-semibold text-slate-700">{label}</legend>
      <FieldHint text={hint} />
      <FieldErrors messages={issuesAt(issues, path)} />
      <div className="mt-2">{body}</div>
    </fieldset>
  );
}

/** One field of any kind (recursive). */
export function Field(props: FieldProps) {
  const { node, path, label, name, hint, value, onChange } = props;
  const { idPrefix, issues } = useFormCtx();
  switch (node.kind) {
    case "bi":
      return (
        <BiField
          path={path}
          label={label}
          name={name}
          hint={hint}
          value={value as Bi | undefined}
          required={node.required}
          multiline={node.multiline}
          onChange={onChange}
          bare={label === ""}
        />
      );
    case "link":
      return <LinkField path={path} label={label} name={name} hint={hint} value={value as string} allowEmpty={node.allowEmpty} onChange={onChange} />;
    case "image":
      return <ImageField path={path} label={label} name={name} hint={hint} value={value as string} onChange={onChange} />;
    case "icon":
      return <IconField path={path} label={label} name={name} hint={hint} value={value as string} onChange={onChange} />;
    case "roleId":
      return <TextField path={path} label={label} name={name} hint={hint ?? "Short lowercase slug, for example owner."} value={value} onChange={(v) => onChange(String(v).trim().toLowerCase())} mono />;
    case "text":
      return <TextField path={path} label={label} name={name} hint={hint} value={value} onChange={onChange} multiline={node.multiline} />;
    case "number": {
      const errors = issuesAt(issues, path, true);
      return (
        <label id={fieldDomId(idPrefix, path)} className="block scroll-mt-28">
          <span className={labelClass}>{label}</span>
          <input
            type="number"
            aria-label={name}
            value={typeof value === "number" ? value : ""}
            min={node.min}
            max={node.max}
            step={node.integer ? 1 : "any"}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className={`mt-1 ${inputClass} ${inputBorder(errors.length > 0)} max-w-40`}
          />
          <FieldHint text={[hint, node.min !== undefined && node.max !== undefined ? `From ${node.min} to ${node.max}.` : ""].filter(Boolean).join(" ")} />
          <FieldErrors messages={errors} />
        </label>
      );
    }
    case "boolean":
      return (
        <label id={fieldDomId(idPrefix, path)} className="flex scroll-mt-28 items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" aria-label={name} checked={value === true} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-cyan-600" />
          {label}
          <FieldErrors messages={issuesAt(issues, path, true)} />
        </label>
      );
    case "enum":
      return (
        <label id={fieldDomId(idPrefix, path)} className="block scroll-mt-28">
          <span className={labelClass}>{label}</span>
          <select aria-label={name} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`mt-1 ${inputClass} ${inputBorder(false)} max-w-xs`}>
            {node.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <FieldErrors messages={issuesAt(issues, path, true)} />
        </label>
      );
    case "object":
      return <ObjectField {...props} node={node} />;
    case "list":
      return (
        <ListField
          path={path}
          label={label}
          name={name}
          hint={hint}
          node={node}
          value={value as unknown[]}
          onChange={onChange}
          renderItem={(item) => (
            <Field node={node.item} path={item.path} label="" name={item.name} value={item.value} onChange={item.onChange} />
          )}
        />
      );
    case "roleRefs":
      return <RoleRefsField path={path} label={label} name={name} value={value} onChange={onChange} max={node.max} />;
    case "roleRecord":
      return <RoleRecordField {...props} node={node} />;
    default:
      return (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          {label}: this field cannot be edited here.
        </div>
      );
  }
}

type BlockFormProps = {
  type: BlockType;
  content: unknown;
  issues: ContentIssue[];
  /** Unique per block on the page (DOM ids). */
  idPrefix: string;
  onChange: (content: unknown) => void;
};

/** The generated editor for one block's content. */
export default function BlockForm({ type, content, issues, idPrefix, onChange }: BlockFormProps) {
  const node = blockForm(type);
  const roles = useMemo<Role[]>(() => {
    const r = (content as { roles?: unknown })?.roles;
    return Array.isArray(r) ? (r.filter((x) => x && typeof x === "object") as Role[]).map((x) => ({ id: String(x.id ?? ""), label: x.label ?? { en: "", ar: "" } })) : [];
  }, [content]);
  const ctx = useMemo<FormCtx>(() => ({ idPrefix, issues, roles: roles.filter((r) => r.id !== "") }), [idPrefix, issues, roles]);

  return (
    <BlockFormContext.Provider value={ctx}>
      <Field node={node} path="" label="" name="" value={content} onChange={(next) => onChange(syncRoles(node, content, next))} />
    </BlockFormContext.Provider>
  );
}
