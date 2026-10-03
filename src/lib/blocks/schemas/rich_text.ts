import { z } from "zod";
import { biSchema } from "../bi";
import { b } from "../fields";

/** A heading and a list of paragraphs. Each paragraph may use simple markdown. */
export const richTextSchema = z.object({
  heading: biSchema,
  paragraphs: z.array(biSchema).max(80),
});

export type RichTextContent = z.infer<typeof richTextSchema>;

export const richTextDefaults = (): RichTextContent => ({
  heading: b(""),
  paragraphs: [b("")],
});
