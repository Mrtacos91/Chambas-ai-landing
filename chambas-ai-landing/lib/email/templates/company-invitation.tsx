import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CompanyInvitationEmailProps {
  companyName: string;
  inviterName: string;
  role: "owner" | "recruiter" | "viewer";
  acceptUrl: string;
}

const roleLabels: Record<CompanyInvitationEmailProps["role"], string> = {
  owner: "Administrador",
  recruiter: "Reclutador",
  viewer: "Observador",
};

export const CompanyInvitationEmail = ({
  companyName,
  inviterName,
  role,
  acceptUrl,
}: CompanyInvitationEmailProps) => (
  <Html lang="es-MX">
    <Head />
    <Preview>
      {inviterName} te invitó a colaborar en {companyName} dentro de Jalector
    </Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brandText}>Jalector</Text>
          <Text style={brandTag}>Captación conversacional · Panel ejecutivo</Text>
        </Section>

        <Heading style={heading}>Te invitaron a colaborar en {companyName}</Heading>

        <Text style={paragraph}>
          {inviterName} agregó tu correo al equipo de {companyName} con el rol de{" "}
          <strong>{roleLabels[role]}</strong>. Acepta la invitación para acceder
          al panel ejecutivo y gestionar candidatos.
        </Text>

        <Section style={buttonSection}>
          <Button style={button} href={acceptUrl}>
            Aceptar invitación
          </Button>
        </Section>

        <Text style={paragraph}>
          Si el botón no funciona, copia y pega esta dirección en tu navegador:
        </Text>
        <Text style={linkText}>{acceptUrl}</Text>

        <Hr style={divider} />

        <Text style={footer}>
          La invitación vence en 7 días. Si no esperabas este correo, ignóralo
          sin problema.
        </Text>
      </Container>
    </Body>
  </Html>
);

const body: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily:
    'Geist, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: "32px 16px",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  border: "1px solid rgba(15, 23, 42, 0.06)",
  margin: "0 auto",
  maxWidth: "520px",
  padding: "40px 36px",
};

const brandSection: React.CSSProperties = { marginBottom: "32px" };

const brandText: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  margin: 0,
};

const brandTag: React.CSSProperties = {
  color: "#10b981",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  margin: "6px 0 0",
  textTransform: "uppercase",
};

const heading: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "26px",
  fontWeight: 500,
  letterSpacing: "-0.025em",
  lineHeight: 1.25,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const buttonSection: React.CSSProperties = {
  margin: "28px 0",
  textAlign: "center",
};

const button: React.CSSProperties = {
  backgroundColor: "#10b981",
  borderRadius: "999px",
  color: "#022c22",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "14px 28px",
  textDecoration: "none",
};

const linkText: React.CSSProperties = {
  color: "#0f766e",
  fontSize: "13px",
  margin: "0 0 20px",
  wordBreak: "break-all",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(15, 23, 42, 0.08)",
  margin: "32px 0 20px",
};

const footer: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: 1.6,
  margin: 0,
};

export default CompanyInvitationEmail;
