export default () => {
  const host = process.env.SMTP_HOST;
  return {
    mail: {
      // Utilise le host défini en variable d'environnement
      // sauf si celui-ci est "mxplan-vrb1lwo-1", auquel cas on utilise le fallback 'webmail.mail.ovh.net'
      host: host && host !== 'mxplan-vrb1lwo-1' ? host : 'webmail.mail.ovh.net',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || 'cleserviceClient@cleservice.com',
      pass: process.env.SMTP_PASS || 'Eliseo3009@',
      from: process.env.EMAIL_FROM || 'cleserviceClient@cleservice.com',
    },
  };
};
