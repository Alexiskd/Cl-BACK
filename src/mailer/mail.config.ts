export default () => {
  const host = process.env.SMTP_HOST || 'ssl0.ovh.net';  // Utilisation de la valeur par défaut si aucune variable n'est définie
  return {
    mail: {
      host: host,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || 'cleserviceClient@cleservice.com',
      pass: process.env.SMTP_PASS || 'Eliseo3009@',  // Veuillez changer ce mot de passe si nécessaire
      from: process.env.EMAIL_FROM || 'cleserviceClient@cleservice.com',
    },
  };
};
