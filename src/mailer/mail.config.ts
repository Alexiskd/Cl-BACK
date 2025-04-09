// config/mail.config.ts
export default () => ({
  mail: {
    host: process.env.SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'Servicecle@cleservice.com',
    pass: process.env.SMTP_PASS || 'Eliseo3009@',
    from: process.env.EMAIL_FROM || 'Servicecle@cleservice.com',
  },
});
