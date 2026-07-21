"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUsuario } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { HIRING_STAGES } from "@/lib/candidates/domain/hiring-stages";
import { updatePipelineNotes } from "@/lib/candidates/application/update-pipeline-notes";
import { updatePipelineStage } from "@/lib/candidates/application/update-pipeline-stage";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const stageSchema = z.object({
  pipelineId: z.string().uuid(),
  stage: z.enum(HIRING_STAGES),
});

const notesSchema = z.object({
  pipelineId: z.string().uuid(),
  notes: z.string().max(4000),
});

export const updateCandidateStage = async (input: {
  pipelineId: string;
  stage: string;
}): Promise<ActionResult> => {
  const { user, membership } = await requireUsuario();
  const parsed = stageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos de etapa inválidos." };
  }

  try {
    const supabase = await createClient();
    await updatePipelineStage(supabase, {
      pipelineId: parsed.data.pipelineId,
      companyId: membership.companyId,
      stage: parsed.data.stage,
      userId: user.id,
    });
    revalidatePath("/cliente");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No pudimos actualizar la etapa.",
    };
  }
};

export const updateCandidateNotes = async (input: {
  pipelineId: string;
  notes: string;
}): Promise<ActionResult> => {
  const { user, membership } = await requireUsuario();
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "La nota no es válida." };
  }

  try {
    const supabase = await createClient();
    await updatePipelineNotes(supabase, {
      pipelineId: parsed.data.pipelineId,
      companyId: membership.companyId,
      notes: parsed.data.notes.trim(),
      userId: user.id,
    });
    revalidatePath("/cliente");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No pudimos guardar la nota.",
    };
  }
};
