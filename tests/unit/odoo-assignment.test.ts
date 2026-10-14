import { describe, expect, it } from "vitest";
import {
  calendarAssignmentValues,
  leadAssignmentValues,
  normalizeAssignment,
} from "@/lib/odoo/assignment";

describe("normalizeAssignment", () => {
  it("keeps positive integer ids, including numeric strings from the form", () => {
    expect(normalizeAssignment({ salespersonId: "7", teamId: 3 })).toEqual({ salespersonId: 7, teamId: 3 });
  });

  it("turns empty, zero, negative, fractional and junk values into 0 (not set)", () => {
    expect(normalizeAssignment({ salespersonId: "", teamId: undefined })).toEqual({ salespersonId: 0, teamId: 0 });
    expect(normalizeAssignment({ salespersonId: -2, teamId: 1.5 })).toEqual({ salespersonId: 0, teamId: 0 });
    expect(normalizeAssignment({ salespersonId: "abc", teamId: null })).toEqual({ salespersonId: 0, teamId: 0 });
  });
});

describe("leadAssignmentValues", () => {
  it("sets user_id and team_id from the configured owner", () => {
    expect(leadAssignmentValues({ salespersonId: 9, teamId: 4 })).toEqual({ user_id: 9, team_id: 4 });
  });

  it("leaves unset fields out so Odoo applies its own defaults", () => {
    expect(leadAssignmentValues({ salespersonId: 0, teamId: 0 })).toEqual({});
    expect(leadAssignmentValues({ salespersonId: 9, teamId: 0 })).toEqual({ user_id: 9 });
  });
});

describe("calendarAssignmentValues", () => {
  it("makes the salesperson the organiser and links their partner as attendee", () => {
    expect(calendarAssignmentValues({ salespersonId: 9, teamId: 4 }, 31)).toEqual({
      user_id: 9,
      partner_ids: [[4, 31]],
    });
  });

  it("omits the attendee when the salesperson's partner is unknown", () => {
    expect(calendarAssignmentValues({ salespersonId: 9, teamId: 0 }, null)).toEqual({ user_id: 9 });
    expect(calendarAssignmentValues({ salespersonId: 0, teamId: 0 }, null)).toEqual({});
  });
});
