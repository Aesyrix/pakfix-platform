'use client';

import Link from 'next/link';
import { LegalPage, Ph } from '@/components/marketing/legal/LegalPage';

/** Text: "PakFix Legal Pages" draft, 13 November 2026, section 2. Awaiting legal approval. */
const COLLECTED: [string, string, string][] = [
  ['Name, email, phone number, password (stored encrypted), city, account type', 'Everyone', 'To create and secure your account and contact you about your jobs'],
  ['Job details: description, address, preferred time, your own price if you name one', 'Customers', 'To show your job to suitable professionals nearby and to run the booking'],
  ['Offers, bookings, job status history, cancellation reasons, disputes', 'Customers and professionals', 'To run jobs, resolve disputes and keep records'],
  ['Chat messages and photos sent in job chat', 'Customers and professionals', 'To let the two people on a job talk without sharing phone numbers, and to check reports'],
  ['Ratings and reviews', 'Customers and professionals', 'To show others the quality of work and conduct'],
  ['Reports and blocks', 'Anyone who reports or blocks', 'To keep people safe and act on rule breaks'],
  ['CNIC number, CNIC photos (front and back), a selfie, optional trade certificate', 'Professionals only', 'To verify identity before they can offer on jobs'],
  ['Services offered, working hours, service radius, base location, availability', 'Professionals only', 'To send only matching jobs and show jobs within reach'],
  ['Precise location at "arrived" and "done", and when setting a base location', 'Professionals only, with permission', 'To confirm they were at the job and to measure distance to jobs'],
  ['Precise location when posting a job, only if you tap "Use my current location" (otherwise the city centre is used)', 'Customers, with permission', 'To show the job to professionals who are actually nearby'],
  ['Device push token and app language and theme settings', 'App users', 'To send notifications about your jobs and show the app your way'],
  ['Text you type into PakFix AI', 'Anyone who uses it', 'To suggest causes, safety steps and the right service'],
  ['Messages sent through the contact form', 'Anyone who writes to us', 'To answer you'],
  ['Basic technical logs (IP address, time, pages or API calls, errors)', 'Everyone', 'To keep the Service secure and fix faults'],
];

export function PrivacyContent() {
  return (
    <LegalPage title="Privacy Policy" titleUr="رازداری پالیسی">
      <h2>1. Who is responsible</h2>
      <p>
        <Ph>Company legal name</Ph>, <Ph>Registered office address</Ph> (&ldquo;PakFix&rdquo;) is responsible for the personal data
        described here. It covers the PakFix website (pakfix.pk) and the PakFix app for Android and iOS. Questions:{' '}
        <a href="mailto:support@pakfix.pk">support@pakfix.pk</a>.
      </p>

      <h2>2. What we collect</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">From whom</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            {COLLECTED.map(([data, who, why]) => (
              <tr key={data}>
                <td>{data}</td>
                <td>{who}</td>
                <td>{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        We do not collect payment card or bank details. We do not use advertising trackers, sell personal data or use it for advertising.
      </p>

      <h2>3. Location</h2>
      <p>
        The app asks for location permission only while you use it, and only for the features in the table above. We do not track location
        in the background. You can refuse or turn off location in your phone settings; a job you post then uses your city centre, and some
        professional features (marking arrival, setting a base location by GPS) need you to enter the place by hand or will not work.
      </p>

      <h2>4. What other people can see</h2>
      <ul>
        <li>
          <strong>Professionals see</strong> a customer&apos;s first name, job description and area before booking, and the full address
          only after the customer accepts their offer.
        </li>
        <li>
          <strong>Customers see</strong> a professional&apos;s name, photo, services, verification status, ratings and reviews.
        </li>
        <li>Phone numbers and email addresses are never shown to the other person.</li>
        <li>Reviews are public on PakFix.</li>
        <li>
          CNIC numbers, CNIC photos and selfies are never shown to customers or the public. Only authorised PakFix staff can see them, for
          verification.
        </li>
      </ul>

      <h2>5. How we use your data</h2>
      <p>
        We use your data only to provide and secure the Service: running accounts and jobs, matching jobs to professionals, verification,
        chat, notifications, support, preventing fraud and abuse, keeping records we are required to keep, and improving the Service. We
        rely on our contract with you, our legitimate interest in a safe marketplace, legal obligations, and your consent where we ask for
        it (for example location and notifications).
      </p>

      <h2>6. Who we share data with</h2>
      <ul>
        <li>
          <strong>The other person on your job</strong>, as described in section 4.
        </li>
        <li>
          <strong>Service providers</strong> who process data for us under contract: our web hosting provider (servers and database) and
          Google Firebase Cloud Messaging (to deliver push notifications to your device). The app loads its fonts from Google Fonts, which
          receives your device&apos;s IP address.
        </li>
        <li>
          <strong>Authorities</strong>, when the law requires it or to protect someone&apos;s safety.
        </li>
      </ul>
      <p>We do not sell personal data. PakFix AI runs on our own servers; your text is not sent to an outside AI company.</p>

      <h2>7. How long we keep data</h2>
      <ul>
        <li>Account details: while your account exists.</li>
        <li>CNIC photos and selfies: while your professional account exists; deleted when you delete your account.</li>
        <li>
          Job records, offers, reviews and chat: kept after a job ends, because both people and our records rely on them. If you delete your
          account they stay without your name, shown as &ldquo;Deleted user&rdquo;.
        </li>
        <li>Technical logs: kept for a short period for security, then deleted.</li>
      </ul>

      <h2>8. Security</h2>
      <p>
        Data travels over encrypted connections (HTTPS). Passwords are stored hashed. On your phone, your sign-in token is kept in the
        phone&apos;s secure storage (Keystore on Android, Keychain on iOS). Identity documents are stored privately and opened only by
        authorised staff. No system is perfectly secure; tell us at <a href="mailto:support@pakfix.pk">support@pakfix.pk</a> if you notice
        a problem.
      </p>

      <h2>9. Deleting your account</h2>
      <p>
        You can delete your account at any time: in the app under Account &gt; Delete account, or at{' '}
        <Link href="/delete-account">pakfix.pk/delete-account</Link>. Deletion is not possible while a job is in progress. When you delete
        your account we erase straight away your name, email, phone, photo, CNIC and selfie files, saved addresses and all signed-in
        devices. Records of past jobs (bookings, reviews, chat) stay without your name, as &ldquo;Deleted user&rdquo;.
      </p>

      <h2>10. Your rights</h2>
      <p>
        You can ask to see the personal data we hold about you, correct it, or delete it, and you can withdraw consent (for example for
        location or notifications) in your phone settings. Email <a href="mailto:support@pakfix.pk">support@pakfix.pk</a>; we reply within
        30 days. You may also complain to the relevant authority in Pakistan.
      </p>

      <h2>11. Children</h2>
      <p>
        PakFix is for people aged 18 and over. We do not knowingly collect data from children. If you think a child has an account, tell us
        and we will remove it.
      </p>

      <h2>12. Changes</h2>
      <p>We will post changes here with a new effective date and tell you in the app or by email before important changes apply.</p>

      <h2>13. Contact</h2>
      <p>
        Email <a href="mailto:support@pakfix.pk">support@pakfix.pk</a> · Phone <Ph>Support phone</Ph> · Post: <Ph>Company legal name</Ph>,{' '}
        <Ph>Registered office address</Ph>
      </p>
    </LegalPage>
  );
}
