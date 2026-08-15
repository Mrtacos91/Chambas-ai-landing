import type { SupabaseClient } from "@supabase/supabase-js";
import {
  TEMPLATE_STAGES,
  mergeHiringMessageTemplates,
  type HiringMessageTemplateMap,
  type TemplateStage,
} from "@/lib/candidates/domain/hiring-message-templates";

export const listHiringMessageTemplates = async (
  client: SupabaseClient,
  companyId: string,
): Promise<HiringMessageTemplateMap> => {
  const { data, error } = await client
    .from("company_hiring_message_templates")
    .select("stage, body")
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  const stored: Partial<Record<string, string>> = {};
  for (const row of data ?? []) {
    if (typeof row.stage === "string" && typeof row.body === "string") {
      stored[row.stage] = row.body;
    }
  }

  return mergeHiringMessageTemplates(stored);
};

export const upsertHiringMessageTemplates = async (
  client: SupabaseClient,
  params: {
    companyId: string;
    templates: HiringMessageTemplateMap;
  },
): Promise<HiringMessageTemplateMap> => {
  const rows = TEMPLATE_STAGES.map((stage) => ({
    company_id: params.companyId,
    stage,
    body: params.templates[stage].trim(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client
    .from("company_hiring_message_templates")
    .upsert(rows, { onConflict: "company_id,stage" });

  if (error) {
    throw new Error(error.message);
  }

  return params.templates;
};

export const getHiringMessageTemplateForStage = async (
  client: SupabaseClient,
  companyId: string,
  stage: TemplateStage,
): Promise<string> => {
  const templates = await listHiringMessageTemplates(client, companyId);
  return templates[stage];
};
