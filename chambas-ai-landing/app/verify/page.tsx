import { redirect } from "next/navigation";

interface VerifyPageProps {
  searchParams?: Promise<{ redirect?: string }>;
}

const VerifyPage = async ({ searchParams }: VerifyPageProps) => {
  const params = await searchParams;
  const redirectAfter =
    params?.redirect && params.redirect.startsWith("/") ? params.redirect : undefined;
  const query = redirectAfter
    ? `?redirect=${encodeURIComponent(redirectAfter)}`
    : "";
  redirect(`/login${query}`);
};

export default VerifyPage;
