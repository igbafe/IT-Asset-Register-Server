import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const email = new Brevo.SendSmtpEmail();

  email.sender = { email: "igbafes8@gmail.com", name: "IT Asset Register" };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;

  return apiInstance.sendTransacEmail(email);
};
