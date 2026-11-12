'use client';

import Link from 'next/link';
import { LegalPage, Ph } from '@/components/marketing/legal/LegalPage';

/** Text: "PakFix Legal Pages" draft, 13 November 2026, section 1. Awaiting legal approval. */
export function TermsContent() {
  return (
    <LegalPage title="Terms of Service" titleUr="سروس کی شرائط">
      <h2>1. Who we are and what these terms cover</h2>
      <p>
        PakFix is operated by <Ph>Company legal name</Ph>, <Ph>Registered office address</Ph>, <Ph>SECP / NTN number</Ph>{' '}
        (&ldquo;PakFix&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). These terms apply when you use the PakFix website (pakfix.pk) or the
        PakFix app for Android or iOS (together, the &ldquo;Service&rdquo;).
      </p>
      <p>
        By creating an account or using the Service you agree to these terms, our <Link href="/privacy-policy">Privacy Policy</Link>,
        our <Link href="/refund-policy">Cancellation and Refund Policy</Link> and our{' '}
        <Link href="/community-guidelines">Community Guidelines</Link>. If you do not agree, do not use the Service.
      </p>

      <h2>2. What PakFix is, and is not</h2>
      <p>
        PakFix is a marketplace. It connects people who need something fixed (customers) with independent professionals who do the work
        (professionals), for homes, offices, cars, bikes and electronics.
      </p>
      <ul>
        <li>
          PakFix does not do repairs and does not employ the professionals. Each professional is an independent service provider and is
          responsible for their own work, tools, materials and conduct.
        </li>
        <li>
          PakFix does not set prices. Professionals send offers; customers choose an offer or name their own price. Price ranges shown on
          PakFix are guides only.
        </li>
        <li>
          The contract for the work is between the customer and the professional. PakFix provides the platform, verification of
          professionals&apos; identity, chat, job tracking, reviews and help with disputes.
        </li>
      </ul>

      <h2>3. Where PakFix works</h2>
      <p>PakFix currently serves Islamabad and Rawalpindi. Jobs outside these cities cannot be posted.</p>

      <h2>4. Accounts</h2>
      <ul>
        <li>You must be at least 18 years old and able to enter a binding agreement.</li>
        <li>Give accurate details and keep them up to date. One person, one account.</li>
        <li>
          Keep your password private. You are responsible for what happens under your account. Tell us at{' '}
          <a href="mailto:support@pakfix.pk">support@pakfix.pk</a> if you think someone else has used it.
        </li>
        <li>
          You choose an account type when you sign up: Customer or Professional. A professional account can also book jobs as a customer by
          switching to Customer mode.
        </li>
      </ul>

      <h2>5. How a job works</h2>
      <ol>
        <li>
          <strong>Post a job.</strong> The customer describes the problem, the address and the preferred time, and may name their own price.
        </li>
        <li>
          <strong>Offers.</strong> Verified professionals nearby who are available may accept the customer&apos;s price or send their own
          offer, showing any visit fee, labour and materials. Offers can be received for a limited time (usually 2 hours; 15 minutes for
          emergency jobs).
        </li>
        <li>
          <strong>Booking.</strong> The customer accepts one offer. That price is the agreed price. Other offers are declined.
        </li>
        <li>
          <strong>Changes on site.</strong> If the job turns out bigger than described, the professional must send a revised price in the
          app. Work at the new price starts only after the customer approves it. If the customer declines, the job ends and only the visit
          fee shown in the original offer is due.
        </li>
        <li>
          <strong>Finishing.</strong> The professional marks the job done, using the code the customer gives them, or the customer confirms
          it in the app. A job marked done is confirmed automatically after 72 hours unless either side reports a problem.
        </li>
        <li>
          <strong>Payment.</strong> The customer pays the agreed price in cash, directly to the professional, when the work is done.
        </li>
        <li>
          <strong>Review.</strong> Both sides can rate the job. Only people who took part in a job can review it.
        </li>
      </ol>

      <h2>6. Prices and payment</h2>
      <ul>
        <li>All prices are in Pakistani rupees (PKR).</li>
        <li>
          Payment is in cash, directly between customer and professional. PakFix does not take payment from customers and does not hold
          anyone&apos;s money.
        </li>
        <li>Customers pay PakFix no fee.</li>
        <li>Pay only for work you agreed in the app. Do not pay for extra work that was not approved in the app.</li>
      </ul>

      <h2>7. Professionals</h2>
      <p>If you use PakFix as a professional, these extra terms apply.</p>
      <ul>
        <li>
          <strong>Verification.</strong> You must submit your CNIC (front and back) and a selfie. A trade certificate is optional. Our team
          reviews them by hand, usually within 24 hours. You can send offers only after you are verified. We may refuse or remove
          verification if documents are unclear, false or do not match.
        </li>
        <li>
          <strong>Your services and hours.</strong> You choose the services you offer (up to 10), your working hours, whether you take
          emergency jobs, and your service radius (20 km by default). You can pause new jobs at any time. You receive alerts only for jobs
          that match these settings.
        </li>
        <li>
          <strong>Offers are binding.</strong> If a customer accepts your offer, you must do the job at that price, at the agreed time. Any
          change needs the customer&apos;s approval in the app.
        </li>
        <li>
          <strong>Showing up.</strong> Cancelling after you set off, not arriving, or losing a dispute about your work counts as a strike.
          With 3 strikes you can no longer send offers until PakFix reviews your account.
        </li>
        <li>
          <strong>Location.</strong> When you mark a job as &ldquo;arrived&rdquo; and &ldquo;done&rdquo;, the app records your position, so
          PakFix can confirm you were at the job.
        </li>
        <li>
          <strong>Commission.</strong> Joining PakFix is free at launch. From <Ph>Commission start date</Ph> PakFix will charge a commission
          of <Ph>Commission rate</Ph> (between 5% and 10%) of the agreed price of each completed job. Because customers pay you in cash, the
          commission is added to your PakFix balance and settled daily. We will tell you at least 30 days before the commission starts or
          changes. If you do not pay your balance, you may stop receiving new jobs until it is paid.
        </li>
        <li>
          <strong>Taxes and permits.</strong> You are responsible for your own taxes, permits and any licence your trade needs.
        </li>
        <li>
          <strong>Safety.</strong> Follow safe working practice. Gas, high-voltage electrical and structural work must only be done by
          people qualified for it.
        </li>
      </ul>

      <h2>8. Cancellations, disputes and refunds</h2>
      <p>
        Cancellations, disputes and refunds follow our <Link href="/refund-policy">Cancellation and Refund Policy</Link>. In short:
        customers can cancel free until the professional sets off; after that the job ends only when confirmed or through a dispute that
        PakFix reviews.
      </p>

      <h2>9. Your conduct and content</h2>
      <p>
        You must follow our <Link href="/community-guidelines">Community Guidelines</Link>. In particular you must not:
      </p>
      <ul>
        <li>harass, threaten, abuse or discriminate against anyone, or send sexual, hateful or violent content;</li>
        <li>share phone numbers or arrange to take a PakFix job off the platform to avoid its rules;</li>
        <li>give false information, post fake jobs, fake offers or fake reviews, or impersonate anyone;</li>
        <li>use the Service for anything illegal, or try to break, scrape or overload it.</li>
      </ul>
      <p>
        You own what you write and upload (job descriptions, chat messages, photos, reviews). You give PakFix permission to store, show and
        process it as needed to run the Service, and to show your reviews on PakFix. You can report or block any user, and PakFix may
        remove content that breaks these terms.
      </p>

      <h2>10. PakFix AI</h2>
      <p>
        PakFix AI gives general guidance from the text you type: possible causes, how urgent it might be, safety steps and the right
        service. It is not a diagnosis and does not replace a professional&apos;s inspection. In an emergency (gas smell, fire, sparking
        wiring, flooding, structural danger) leave the area and contact the emergency services or your gas or electricity company first.
      </p>

      <h2>11. Suspension and ending your account</h2>
      <ul>
        <li>
          You can delete your account at any time in the app (Account &gt; Delete account) or at{' '}
          <Link href="/delete-account">pakfix.pk/delete-account</Link>, once you have no job in progress.
        </li>
        <li>
          PakFix may suspend or close an account that breaks these terms, puts others at risk, or uses false identity documents. Suspension
          signs you out everywhere and closes your open requests or offers. Booked jobs are reviewed one by one.
        </li>
      </ul>

      <h2>12. Our liability</h2>
      <ul>
        <li>
          We work to verify professionals&apos; identity and to keep the Service running, but we do not guarantee the quality, safety or
          result of any work, or that a professional will be available.
        </li>
        <li>
          To the extent the law allows, PakFix is not liable for loss or damage caused by a professional&apos;s or customer&apos;s acts, for
          indirect or consequential loss, or for amounts paid in cash between customer and professional.
        </li>
        <li>Nothing in these terms limits liability that cannot be limited under the laws of Pakistan.</li>
      </ul>

      <h2>13. Changes to the Service and these terms</h2>
      <p>
        We may change the Service or these terms. We will post the new terms here with a new effective date and, for important changes,
        tell you in the app or by email before they apply. If you keep using PakFix after that, the new terms apply.
      </p>

      <h2>14. Law and disputes</h2>
      <p>
        These terms are governed by the laws of Pakistan. Courts in Islamabad have jurisdiction, unless the law gives you the right to use
        another court. Please contact us first; most problems can be solved quickly.
      </p>

      <h2>15. Contact</h2>
      <p>
        Email <a href="mailto:support@pakfix.pk">support@pakfix.pk</a> · Phone <Ph>Support phone</Ph> · Post: <Ph>Company legal name</Ph>,{' '}
        <Ph>Registered office address</Ph>
      </p>
    </LegalPage>
  );
}
