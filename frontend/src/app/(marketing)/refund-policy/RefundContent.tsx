'use client';

import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal/LegalPage';

/** Text: "PakFix Legal Pages" draft, 13 November 2026, section 3. Awaiting legal approval. */
const CUSTOMER_CANCELLING: [string, string, string][] = [
  ['While offers are coming in', 'Yes, any time', 'Free'],
  ['After you accept an offer, before the professional sets off', 'Yes', 'Free'],
  ['After the professional sets off', 'No. The job ends when it is confirmed, or through a dispute PakFix reviews', 'See sections 4 and 5'],
];

export function RefundContent() {
  return (
    <LegalPage title="Cancellation and Refund Policy" titleUr="منسوخی اور رقم واپسی کی پالیسی">
      <h2>1. How payment works</h2>
      <p>
        All jobs on PakFix are paid in cash, directly to the professional, when the work is done. PakFix does not take or hold
        customers&apos; money. This is why it matters to pay only for work you have agreed in the app and that is finished.
      </p>

      <h2>2. Cancelling as a customer</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Can you cancel?</th>
              <th scope="col">Cost</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMER_CANCELLING.map(([when, can, cost]) => (
              <tr key={when}>
                <td>{when}</td>
                <td>{can}</td>
                <td>{cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>3. Cancelling as a professional</h2>
      <p>
        A professional can cancel a booked job until they arrive, but cancelling after setting off counts as a strike. Not arriving at all
        counts as a strike too. With 3 strikes a professional cannot send new offers until PakFix reviews the account.
      </p>

      <h2>4. Price changes and the visit fee</h2>
      <p>
        If the job turns out bigger than described, the professional must send a revised price in the app. Nothing changes until you
        approve it. If you decline the revised price, the job ends and you pay only the visit fee that was shown in the professional&apos;s
        original offer. If the offer showed no visit fee, nothing is due.
      </p>

      <h2>5. If the work was not done or not done properly</h2>
      <ol>
        <li>Do not pay for work that is not finished.</li>
        <li>
          Report a problem from the job in the app. You can do this before the job is confirmed, and for 72 hours after it is confirmed. A
          job marked done is confirmed automatically after 72 hours if you do not confirm it or report a problem.
        </li>
        <li>
          PakFix reviews what both sides say, the chat, and where the professional was when they marked &ldquo;arrived&rdquo; and
          &ldquo;done&rdquo;.
        </li>
        <li>
          PakFix decides the outcome: for example the professional returns to finish the work, the price is reduced, or the job is
          cancelled.
        </li>
      </ol>

      <h2>6. Refunds</h2>
      <p>
        Because payment is in cash between customer and professional, PakFix does not hold money to refund. If PakFix decides that money
        should be returned after a dispute, the professional must return it to the customer, and PakFix will help arrange it. A
        professional who does not follow PakFix&apos;s decision may lose their account.
      </p>

      <h2>7. Fees paid to PakFix</h2>
      <p>
        Customers pay PakFix nothing. Professionals&apos; commission, when it starts, is described in the{' '}
        <Link href="/terms-of-service">Terms of Service</Link>, section 7.
      </p>

      <h2>8. Contact</h2>
      <p>
        For help with a cancellation or dispute, use the job in the app or email <a href="mailto:support@pakfix.pk">support@pakfix.pk</a>{' '}
        with the job reference (it starts with PF).
      </p>
    </LegalPage>
  );
}
