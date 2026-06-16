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

interface SignupRejectedEmailProps {
  companyName: string;
  contactName: string;
  reason?: string;
}

export const SignupRejectedEmail = ({
  companyName,
  contactName,
  reason,
}: SignupRejectedEmailProps) => (
  <Html lang="es-MX">
    <Head />
    <Preview>Actualización sobre tu solicitud para Jalector</Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brandText}>Jalector</Text>
          <Text style={brandTag}>Captación conversacional · Panel ejecutivo</Text>
        </Section>

        <Heading style={heading}>Hola {contactName}, gracias por tu interés</Heading>

        <Text style={paragraph}>
          Revisamos la solicitud de <strong>{companyName}</strong> y, por ahora,
          no podemos aprobar el acceso al panel ejecutivo de Jalector.
        </Text>

        {reason ? (
          <Section style={reasonBox}>
            <Text style={reasonLabel}>Motivo</Text>
            <Text style={reasonText}>{reason}</Text>
          </Section>
        ) : null}

        <Text style={paragraph}>
          Si crees que se trata de un error o quieres conversar tu caso con
          nuestro equipo comercial, responde este correo y agendamos una llamada.
        </Text>

        <Hr style={divider} />

        <Text style={footer}>
          Jalector · Captación de candidatos por WhatsApp con panel ejecutivo.
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
  fontSize: "24px",
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

const reasonBox: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.06)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: "14px",
  margin: "16px 0 24px",
  padding: "18px",
};

const reasonLabel: React.CSSProperties = {
  color: "#b91c1c",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.16em",
  margin: "0 0 6px",
  textTransform: "uppercase",
};

const reasonText: React.CSSProperties = {
  color: "#7f1d1d",
  fontSize: "14px",
  lineHeight: 1.55,
  margin: 0,
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

export default SignupRejectedEmail;
