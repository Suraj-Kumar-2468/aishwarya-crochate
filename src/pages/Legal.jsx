import { Link } from "react-router-dom";
import { LEGAL } from "../legal.js";

const Field = ({ value }) =>
  value ? <>{value}</> : <mark className="legal-missing">[to be provided by the shop owner]</mark>;

function Contact() {
  return (
    <ul>
      <li>Business: <Field value={LEGAL.legalName} /></li>
      <li>Address: <Field value={LEGAL.address} /></li>
      <li>Email: <Field value={LEGAL.contactEmail} /></li>
      <li>Grievance Officer: <Field value={LEGAL.grievanceOfficerName} /></li>
      <li>Grievance Officer email: <Field value={LEGAL.grievanceOfficerEmail} /></li>
      <li>Grievance Officer phone: <Field value={LEGAL.grievanceOfficerPhone} /></li>
    </ul>
  );
}

export function Privacy() {
  return (
    <main className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: {LEGAL.lastUpdated}</p>
      <p>
        This policy explains what personal data we collect when you create an account, why, and the rights you have under
        the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000 with its Reasonable
        Security Practices and Procedures Rules, 2011.
      </p>

      <h2>Who we are</h2>
      <Contact />

      <h2>What we collect and why</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Data</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>Name</td><td>To address you and identify your account.</td></tr>
          <tr><td>Email address</td><td>To create your account, send one-time verification and password-reset codes, and send security notices about your account.</td></tr>
          <tr><td>Password</td><td>To let you log in. We never store your password; we store only a one-way cryptographic hash (bcrypt).</td></tr>
          <tr><td>Consent record</td><td>The date and the policy version you agreed to, so we can show that consent was given.</td></tr>
        </tbody>
      </table>
      <p>
        We use this data only for the purposes above. We do not sell it, and we do not use it for advertising. We do not
        collect data from children: you must be 18 or older to create an account.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        When you log in, your browser stores a session token (in local storage) so you stay signed in for up to 7 days.
        We use no advertising or analytics cookies.
      </p>

      <h2>Who processes your data</h2>
      <p>
        We use service providers to run the site: web hosting, a database, and an email service to deliver your codes.
        They process data only on our behalf and under our instructions. Some providers may store data on servers outside
        India.
      </p>

      <h2>How we protect it</h2>
      <ul>
        <li>Passwords are hashed with bcrypt; one-time codes are stored only as keyed hashes and expire in 10 minutes.</li>
        <li>All traffic uses HTTPS. Logins and codes are rate-limited, and accounts lock for 15 minutes after repeated failed logins.</li>
        <li>Changing or resetting your password signs out every other device.</li>
      </ul>
      <p>
        If a personal data breach affects you, we will notify you without delay and report it to the Data Protection Board
        of India as the law requires.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your account data until you delete your account. After deletion we erase it, except for records we must
        keep by law (for example security logs).
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>Access a summary of the personal data we hold about you.</li>
        <li>Correct or update your data. You can change your password from <Link to="/account">My account</Link>; write to us to correct other details.</li>
        <li>Erase your data: use <strong>Delete account</strong> in <Link to="/account">My account</Link>.</li>
        <li>Withdraw consent at any time (deleting your account does this).</li>
        <li>Nominate another person to exercise your rights in the event of your death or incapacity.</li>
        <li>Complain to us, and if unresolved, to the Data Protection Board of India.</li>
      </ul>

      <h2>Grievances</h2>
      <p>
        Write to our Grievance Officer (details above). We acknowledge complaints within 48 hours and resolve them within
        one month.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy in a way that affects you, we will ask for your consent again where the law requires.</p>
    </main>
  );
}

export function Terms() {
  return (
    <main className="legal-page">
      <h1>Terms of Use</h1>
      <p className="legal-updated">Last updated: {LEGAL.lastUpdated}</p>

      <h2>Using your account</h2>
      <ul>
        <li>You must be 18 or older and provide accurate information.</li>
        <li>You must use a Gmail, Outlook, Hotmail or Yahoo email address that you own.</li>
        <li>Keep your password and one-time codes secret. You are responsible for activity under your account.</li>
        <li>Do not attempt to break, overload or gain unauthorised access to the site.</li>
      </ul>

      <h2>Our right to act</h2>
      <p>We may suspend or remove accounts that break these terms or the law.</p>

      <h2>Liability</h2>
      <p>
        The site is provided as is. To the extent allowed by law, we are not liable for indirect losses arising from your
        use of it. Nothing here limits your rights under the Consumer Protection Act, 2019.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at the shop's registered location have jurisdiction.</p>

      <h2>Contact and grievances</h2>
      <Contact />
      <p>See the <Link to="/privacy">Privacy Policy</Link> for how we handle your data.</p>
    </main>
  );
}
