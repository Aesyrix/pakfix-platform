'use client';

import { LegalPage } from '@/components/marketing/legal/LegalPage';

/** Text: "PakFix Legal Pages" draft, 13 November 2026, section 4. Awaiting legal approval. */
export function CommunityContent() {
  return (
    <LegalPage title="Community Guidelines" titleUr="کمیونٹی رہنما اصول">
      <p>
        PakFix works when people can trust each other. These rules apply to everyone: customers, professionals, in chat, in reviews and on
        the job.
      </p>

      <h2>1. Be respectful</h2>
      <ul>
        <li>No harassment, threats, insults, hate speech or discrimination, including on religion, ethnicity, gender or disability.</li>
        <li>No sexual messages or images, and no unwanted contact.</li>
        <li>No violence or threats of violence, on or off the job.</li>
      </ul>

      <h2>2. Be honest</h2>
      <ul>
        <li>Describe jobs truthfully. Send offers you will honour.</li>
        <li>No fake accounts, fake jobs, fake offers or fake reviews. Do not review your own work or a friend&apos;s.</li>
        <li>Professionals: use only your own identity documents.</li>
      </ul>

      <h2>3. Keep it on PakFix</h2>
      <ul>
        <li>
          Use in-app chat. Do not ask for or share phone numbers or other contact details, and do not move a PakFix job off the platform.
        </li>
        <li>Agree price changes in the app, never only in conversation.</li>
      </ul>

      <h2>4. Stay safe</h2>
      <ul>
        <li>Gas, high-voltage electrical and structural work must only be done by someone qualified.</li>
        <li>
          If you ever feel unsafe, leave, then report it to PakFix. In an emergency, call the police (15) or rescue services (1122) first.
        </li>
      </ul>

      <h2>5. Reviews</h2>
      <p>
        Reviews must be about the actual job: the work, timing, price and behaviour. No insults, personal details or content that breaks
        these rules.
      </p>

      <h2>6. Reporting and blocking</h2>
      <ul>
        <li>You can report a person or a message from the job or the chat. A copy of what you report goes to PakFix&apos;s team.</li>
        <li>
          You can block someone. A block works both ways: neither of you can message the other, and you cannot be matched on new jobs
          together. You can unblock under Account &gt; Blocked people.
        </li>
        <li>We review reports within 24 hours and act on content and accounts that break these rules.</li>
      </ul>

      <h2>7. What happens if rules are broken</h2>
      <p>
        Depending on how serious it is, PakFix may remove content, give a warning, add a strike, suspend the account or close it
        permanently. Serious cases, such as threats or fraud, may be reported to the authorities.
      </p>
    </LegalPage>
  );
}
