export const APP_NAME = "MailFlow";
export const APP_VERSION = "1.0.0";

export const ROLES = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export const CAMPAIGN_STATUS = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  SENDING: "Sending",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const EMAIL_PROVIDERS = [
  { id: "resend", name: "Resend", icon: "📧" },
  { id: "sendgrid", name: "SendGrid", icon: "📧" },
  { id: "mailgun", name: "Mailgun", icon: "📧" },
  { id: "aws_ses", name: "AWS SES", icon: "☁️" },
  { id: "smtp", name: "SMTP", icon: "🔌" },
];

export const COLORS = {
  light: {
    bg: "#F7F8FC",
    card: "#FFFFFF",
    border: "#E4E7EC",
    text: {
      primary: "#111827",
      secondary: "#6B7280",
      muted: "#9CA3AF",
    }
  },
  dark: {
    bg: "#0F1117",
    card: "#161B22",
    border: "#2A2F3A",
    text: {
      primary: "#F9FAFB",
      secondary: "#CBD5E1",
      muted: "#94A3B8",
    }
  },
};
