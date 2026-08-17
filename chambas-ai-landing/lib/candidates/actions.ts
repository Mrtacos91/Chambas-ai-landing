"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCompanyAdmin, requireUsuario } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { HIRING_STAGES } from "@/lib/candidates/domain/hiring-stages";
import { TEMPLATE_STAGES } from "@/lib/candidates/domain/hiring-message-templates";
import { updatePipelineNotes } from "@/lib/candidates/application/update-pipeline-notes";
import { updatePipelineStage } from "@/lib/candidates/application/update-pipeline-stage";
import { inviteCandidateToInterview } from "@/lib/candidates/application/invite-to-interview";
import {
  listHiringMessageTemplates,
  upsertHiringMessageTemplates,
} from "@/lib/candidates/application/manage-hiring-message-templates";
import type { HiringMessageTemplateMap } from "@/lib/candidates/domain/hiring-message-templates";

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

const inviteSchema = z.object({
  pipelineId: z.string().uuid(),
});

const templatesSchema = z.object({
  contactado: z.string().max(1500),
  entrevista: z.string().max(1500),
  contratado: z.string().max(1500),
  descartado: z.string().max(1500),
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

export const getCompanyHiringMessageTemplates = async (): Promise<
  ActionResult & { templates?: HiringMessageTemplateMap }
> => {
  const { membership } = await requireUsuario();
  try {
    const supabase = await createClient();
    const templates = await listHiringMessageTemplates(
      supabase,
      membership.companyId,
    );
    return { ok: true, templates };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No pudimos cargar las plantillas.",
    };
  }
};

export const saveCompanyHiringMessageTemplates = async (input: {
  templates: HiringMessageTemplateMap;
}): Promise<ActionResult & { templates?: HiringMessageTemplateMap }> => {
  const { membership } = await requireCompanyAdmin();
  const parsed = templatesSchema.safeParse(input.templates);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa el texto de las plantillas (máx. 1500 caracteres).",
    };
  }

  const normalized: HiringMessageTemplateMap = {
    contactado: parsed.data.contactado,
    entrevista: parsed.data.entrevista,
    contratado: parsed.data.contratado,
    descartado: parsed.data.descartado,
  };

  for (const stage of TEMPLATE_STAGES) {
    if (!(stage in normalized)) {
      return { ok: false, error: "Faltan etapas en las plantillas." };
    }
  }

  try {
    const supabase = await createClient();
    const templates = await upsertHiringMessageTemplates(supabase, {
      companyId: membership.companyId,
      templates: normalized,
    });
    revalidatePath("/cliente");
    return { ok: true, templates };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No pudimos guardar las plantillas.",
    };
  }
};

export const sendInterviewInvite = async (input: {
  pipelineId: string;
}): Promise<ActionResult> => {
  const { user, membership } = await requireUsuario();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Candidato inválido." };
  }

  try {
    const supabase = await createClient();
    await inviteCandidateToInterview(supabase, {
      pipelineId: parsed.data.pipelineId,
      companyId: membership.companyId,
      companyName: membership.companyName,
      userId: user.id,
    });
    revalidatePath("/cliente");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No pudimos enviar la confirmación de cita.",
    };
  }
};
