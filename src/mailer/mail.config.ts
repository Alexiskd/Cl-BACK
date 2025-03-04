// config/mail.config.ts
export default () => {
  const host = process.env.SMTP_HOST;
  return {
    mail: {
      // Utilise le host défini en variable d'environnement
      // sauf si celui-ci est "mxplan-vrb1lwo-1", auquel cas on utilise le fallback 'ssl0.ovh.net'
      host: host && host !== 'mxplan-vrb1lwo-1' ? host : 'ssl0.ovh.net',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || 'Servicecle@cleservice.com',
      pass: process.env.SMTP_PASS || 'Eliseo3009@',
      from: process.env.EMAIL_FROM || 'Servicecle@cleservice.com',
    },
  };
};
