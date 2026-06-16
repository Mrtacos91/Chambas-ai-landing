import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OtpCodeEmailProps {
  code: string;
  email: string;
  expiresInMinutes?: number;
}

export const OtpCodeEmail = ({
  code,
  email,
  expiresInMinutes = 10,
}: OtpCodeEmailProps) => (
  <Html lang="es-MX">
    <Head />
    <Preview>Tu código de acceso a Jalector es {code}</Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brandText}>Jalector</Text>
          <Text style={brandTag}>Captación conversacional · Panel ejecutivo</Text>
        </Section>

        <Heading style={heading}>Tu código de acceso</Heading>

        <Text style={paragraph}>
          Usa el siguiente código para continuar tu inicio de sesión en Jalector.
          La solicitud llegó al correo {email}.
        </Text>

        <Section style={codeSection}>
          <Text style={codeText}>{code}</Text>
        </Section>

        <Text style={paragraph}>
          El código expira en {expiresInMinutes} minutos. Si no fuiste tú quien
          lo solicitó, ignora este mensaje y nadie podrá acceder a tu cuenta.
        </Text>

        <Hr style={divider} />

        <Text style={footer}>
          Jalector · Captación de candidatos por WhatsApp con panel ejecutivo.
          Si necesitas ayuda, responde este correo y nuestro equipo te atiende.
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
  lineHeight: 1.2,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const codeSection: React.CSSProperties = {
  backgroundColor: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  borderRadius: "14px",
  margin: "24px 0",
  padding: "24px",
  textAlign: "center",
};

const codeText: React.CSSProperties = {
  color: "#065f46",
  fontFamily: '"Geist Mono", "JetBrains Mono", "Courier New", monospace',
  fontSize: "36px",
  fontWeight: 500,
  letterSpacing: "0.5em",
  margin: 0,
  paddingLeft: "0.5em",
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

export default OtpCodeEmail;
