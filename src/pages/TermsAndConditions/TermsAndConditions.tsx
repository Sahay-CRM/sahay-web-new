// import { useEffect } from "react";
// import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function TermsAndConditions() {
  // const { setBreadcrumbs } = useBreadcrumbs();

  // useEffect(() => {
  //   setBreadcrumbs([{ label: "Terms & Conditions", href: "" }]);
  // }, [setBreadcrumbs]);

  return (
    <div className="w-full px-5 py-10">
      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none leading-relaxed">
        <div className="w-full h-20  mb-10  relative flex items-center justify-center">
          {/* Dark Overlay */}
          {/* <div className="absolute inset-0 bg-white"></div> */}

          <h1 className="relative text-primary text-4xl  font-bold drop-shadow-lg">
            Terms and Conditions for A2Z SAHAY ENTERPRISES PRIVATE LIMITED
          </h1>
        </div>

        <p>
          Welcome to A2Z SAHAY ENTERPRISES PRIVATE LIMITED. These Terms and
          Conditions ("Terms", "Terms and Conditions") govern your access to and
          use of the A2Z SAHAY ENTERPRISES PRIVATE LIMITED mobile application
          and services (collectively, the "Service").
        </p>
        <p className="mt-2">
          By accessing or using the Service, you agree to be bound by these
          Terms. If you disagree with any part of these Terms, you may not
          access the Service.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Definitions</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>"Service"</strong> refers to the A2Z SAHAY ENTERPRISES
            PRIVATE LIMITED mobile application and all related services.
          </li>
          <li>
            <strong>"User"</strong>, <strong>"You"</strong>, or{" "}
            <strong>"Your"</strong> refers to the individual or entity using the
            Service.
          </li>
          <li>
            <strong>"Company"</strong>, <strong>"We"</strong>,{" "}
            <strong>"Us"</strong>, or <strong>"Our"</strong> refers to A2Z SAHAY
            ENTERPRISES PRIVATE LIMITED and its affiliates.
          </li>
          <li>
            <strong>"Account"</strong> refers to your registered user account on
            the Service.
          </li>
          <li>
            <strong>"Content"</strong> refers to all data, text, information,
            and materials uploaded or created through the Service.
          </li>
          <li>
            <strong>"Organization"</strong> refers to the business entity that
            provides you access to the Service.
          </li>
        </ul>
        <h2 className="font-bold text-2xl mt-10"> Eligibility</h2>

        <h3 className="font-semibold text-xl mt-6">Age Requirement</h3>
        <p>
          You must be at least 18 years of age to use the Service. By using the
          Service, you represent and warrant that you meet this requirement.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Business Use</h3>
        <p>
          A2Z SAHAY ENTERPRISES PRIVATE LIMITED is intended for business and
          professional use. You represent that you are using the Service for
          legitimate business purposes.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Authority</h3>
        <p>
          If you are using the Service on behalf of an organization, you
          represent and warrant that you have the authority to bind that
          organization to these Terms.
        </p>

        <h2 className="font-bold text-2xl mt-10">
          Account Registration and Security
        </h2>

        <h3 className="font-semibold text-xl mt-6"> Account Creation</h3>
        <p>To use the Service, you must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Create an account by providing accurate and complete information
          </li>
          <li>Maintain and update your account information</li>
          <li>Choose a strong password and keep it confidential</li>
          <li>Accept responsibility for all activities under your account</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Account Types</h3>

        <p>
          <strong>Individual Accounts:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Created by individual users</li>
          <li>User maintains full control over account and data</li>
        </ul>

        <p>
          <strong>Enterprise Accounts:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Created through your organization</li>
          <li>Organization administrators may have access to your data</li>
          <li>Subject to your organization's policies and these Terms</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Account Security</h3>
        <p>You are responsible for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Maintaining the confidentiality of your credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized access</li>
          <li>Not sharing your account with others</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Account Suspension</h3>
        <p>We reserve the right to suspend or terminate your account if:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You violate these Terms</li>
          <li>We detect suspicious or fraudulent activity</li>
          <li>Required by law or regulatory authorities</li>
          <li>You fail to pay applicable fees (for paid accounts)</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10"> Subscription and Fees</h2>

        <h3 className="font-semibold text-xl mt-6">Free and Paid Services</h3>
        <p>
          A2Z SAHAY ENTERPRISES PRIVATE LIMITED may offer both free and paid
          subscription plans. Features, storage limits, and functionality vary
          by plan.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Payment Terms</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Fees are billed in advance on a monthly or annual basis</li>
          <li>Payment is due immediately upon subscription</li>
          <li>All fees are non-refundable except as required by law</li>
          <li>We may change pricing with 30 days' notice</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Automatic Renewal</h3>
        <p>
          Subscriptions automatically renew unless canceled before the renewal
          date. You can cancel at any time through your account settings.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Taxes</h3>
        <p>
          You are responsible for all applicable taxes related to your
          subscription.
        </p>

        <h2 className="font-bold text-2xl mt-10">Acceptable Use Policy</h2>

        <h3 className="font-semibold text-xl mt-6"> Permitted Uses</h3>
        <p>You may use the Service to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Manage customer relationships and business contacts</li>
          <li>Store and organize business information</li>
          <li>Collaborate with team members</li>
          <li>Conduct legitimate business activities</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Prohibited Uses</h3>
        <p>You may NOT use the Service to:</p>

        <p>
          <strong>Illegal Activities:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Violate any applicable laws or regulations</li>
          <li>Engage in fraudulent or deceptive practices</li>
          <li>Infringe on intellectual property rights</li>
          <li>Distribute malware, viruses, or harmful code</li>
        </ul>

        <p>
          <strong>Harmful Content:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Upload or share illegal, harmful, or offensive content</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Distribute spam or unsolicited communications</li>
          <li>Share content that violates privacy or confidentiality</li>
        </ul>

        <p>
          <strong>System Abuse:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Attempt to gain unauthorized access to the Service</li>
          <li>Reverse engineer, decompile, or disassemble the app</li>
          <li>Use automated tools to access or scrape the Service</li>
          <li>Overload or interfere with Service infrastructure</li>
        </ul>

        <p>
          <strong>Data Misuse:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Collect or harvest user information without consent</li>
          <li>Sell or share user data with unauthorized parties</li>
          <li>Use the Service to store or distribute pirated content</li>
          <li>Violate any data protection or privacy laws</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">
          Consequences of Violation
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Immediate suspension or termination of your account</li>
          <li>Removal of violating content</li>
          <li>Legal action and cooperation with law enforcement</li>
          <li>Forfeiture of any paid fees</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10">
          Content and Intellectual Property
        </h2>

        <h3 className="font-semibold text-xl mt-6"> Your Content</h3>
        <p>
          You retain all ownership rights to the content you create, upload, or
          store in the Service ("Your Content").
        </p>
        <p>By using the Service, you grant us a limited license to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Store, process, and transmit Your Content</li>
          <li>Display Your Content to you and authorized users</li>
          <li>Back up and secure Your Content</li>
          <li>Improve and develop the Service</li>
        </ul>
        <p>
          This license ends when you delete Your Content or terminate your
          account.
        </p>

        <h3 className="font-semibold text-xl mt-6">
          Our Intellectual Property
        </h3>
        <p>
          The Service, including its design, features, code, and content, is
          owned by A2Z SAHAY ENTERPRISES PRIVATE LIMITED and protected by:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copyright laws</li>
          <li>Trademark laws</li>
          <li>Patent laws</li>
          <li>Trade secret laws</li>
          <li>Other intellectual property rights</li>
        </ul>
        <p>You may not:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copy, modify, or create derivative works of the Service</li>
          <li>Use our trademarks, logos, or branding without permission</li>
          <li>Remove or alter any copyright or proprietary notices</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Feedback</h3>
        <p>
          If you provide feedback, suggestions, or ideas about the Service, we
          may use them without any obligation to you.
        </p>

        <h3 className="font-semibold text-xl mt-6">Third-Party Content</h3>
        <p>
          The Service may include third-party content or links. We are not
          responsible for third-party content and do not endorse it.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Data and Privacy</h2>

        <h3 className="font-semibold text-xl mt-6">Data Processing</h3>
        <p>
          Your use of the Service is subject to our Privacy Policy, which
          explains how we collect, use, and protect your data.
        </p>

        <h3 className="font-semibold text-xl mt-6">Data Ownership</h3>
        <p>
          You own all data you input into the Service. We do not claim ownership
          of your business data or customer information.
        </p>

        <h3 className="font-semibold text-xl mt-6">Data Security</h3>
        <p>
          We implement reasonable security measures to protect your data, but we
          cannot guarantee absolute security.
        </p>

        <h3 className="font-semibold text-xl mt-6">Data Backup</h3>
        <p>
          We perform regular backups, but you are responsible for maintaining
          your own backups of critical data.
        </p>

        <h3 className="font-semibold text-xl mt-6">Data Retention</h3>
        <p>
          Upon account deletion, we will delete or anonymize your data within 90
          days, except where retention is required by law.
        </p>

        <h3 className="font-semibold text-xl mt-6">Organization Access</h3>
        <p>
          If you use an enterprise account, your organization may have access to
          your usage data and content in accordance with their policies.
        </p>

        <h2 className="font-bold text-2xl mt-10">
          Service Availability and Support
        </h2>

        <h3 className="font-semibold text-xl mt-6">Service Availability</h3>
        <p>
          We strive to maintain 99.9% uptime but do not guarantee uninterrupted
          access. The Service may be unavailable due to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Scheduled maintenance</li>
          <li>Emergency repairs</li>
          <li>Technical difficulties</li>
          <li>Force majeure events</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Support</h3>
        <p>We provide customer support via:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email: support@sahaycrm.com</li>
          <li>In-app help center</li>
          <li>Online documentation</li>
        </ul>
        <p>
          Support availability and response times vary by subscription plan.
        </p>

        <h3 className="font-semibold text-xl mt-6">Updates and Changes</h3>
        <p>We may:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Update the Service to add features or fix issues</li>
          <li>Modify or discontinue features with notice</li>
          <li>Change these Terms with 30 days' notice</li>
        </ul>
        <p>Continued use after changes constitutes acceptance.</p>

        <h2 className="font-bold text-2xl mt-10">
          Disclaimers and Limitations of Liability
        </h2>

        <h3 className="font-semibold text-xl mt-6">Service "As Is"</h3>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Warranties of merchantability</li>
          <li>Fitness for a particular purpose</li>
          <li>Non-infringement</li>
          <li>Accuracy or reliability</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">No Guarantee</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>The Service will meet your requirements</li>
          <li>The Service will be uninterrupted or error-free</li>
          <li>Results obtained from the Service will be accurate</li>
          <li>Defects will be corrected</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Limitation of Liability</h3>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
        <p>
          <strong>We are NOT liable for:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Indirect, incidental, or consequential damages</li>
          <li>Loss of profits, data, or business opportunities</li>
          <li>Damages arising from Service interruptions</li>
          <li>Unauthorized access to your data</li>
          <li>Third-party actions or content</li>
        </ul>
        <p>
          <strong>Maximum Liability:</strong> Our total liability for any claims
          related to the Service shall not exceed the amount you paid us in the
          12 months preceding the claim, or $100 if you use a free plan.
        </p>

        <h3 className="font-semibold text-xl mt-6">Exceptions</h3>
        <p>
          Some jurisdictions do not allow limitation of implied warranties or
          liability for incidental damages. In such cases, our liability is
          limited to the fullest extent permitted by law.
        </p>

        <h2 className="font-bold text-2xl mt-10">Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless A2Z SAHAY
          ENTERPRISES PRIVATE LIMITED, its affiliates, officers, directors,
          employees, and agents from any claims, damages, losses, liabilities,
          and expenses (including legal fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another party</li>
          <li>Your Content or data uploaded to the Service</li>
          <li>Your negligent or wrongful conduct</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10">
          Third-Party Services and Integrations
        </h2>

        <h3 className="font-semibold text-xl mt-6">Third-Party Services</h3>
        <p>
          The Service may integrate with third-party services (e.g., email
          providers, cloud storage). Your use of third-party services is subject
          to their terms and privacy policies.
        </p>

        <h3 className="font-semibold text-xl mt-6">No Endorsement</h3>
        <p>
          We do not endorse or assume responsibility for third-party services or
          their content.
        </p>

        <h3 className="font-semibold text-xl mt-6">API and Integrations</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>You must comply with our API documentation</li>
          <li>We may rate-limit or restrict API access</li>
          <li>API availability is not guaranteed</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10"> Termination</h2>

        <h3 className="font-semibold text-xl mt-6"> Termination by You</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Using the in-app account deletion feature</li>
          <li>Contacting support@sahaycrm.com</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Termination by Us</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>You violate these Terms</li>
          <li>We detect fraudulent activity</li>
          <li>Required by law</li>
          <li>You fail to pay applicable fees</li>
          <li>The Service is discontinued</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Effect of Termination</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your access to the Service will be revoked</li>
          <li>Your data will be deleted or anonymized within 90 days</li>
          <li>You remain liable for any outstanding fees</li>
          <li>Provisions that should survive termination will continue</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Survival</h3>
        <p>
          The following sections survive termination: Content and Intellectual
          Property, Disclaimers, Limitation of Liability, Indemnification, and
          Dispute Resolution.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Dispute Resolution</h2>

        <h3 className="font-semibold text-xl mt-6"> Governing Law</h3>
        <p>
          These Terms are governed by the laws of [Your Jurisdiction], without
          regard to conflict of law principles.
        </p>

        <h3 className="font-semibold text-xl mt-6">Informal Resolution</h3>
        <p>
          Before filing a claim, you agree to contact us at legal@sahaycrm.com
          to attempt to resolve the dispute informally for at least 30 days.
        </p>

        <h3 className="font-semibold text-xl mt-6">Arbitration</h3>
        <p>
          Any disputes not resolved informally shall be resolved through binding
          arbitration in accordance with the rules of [Arbitration Association].
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Arbitration will be conducted in [Your Location]</li>
          <li>Each party bears their own costs</li>
          <li>The arbitrator's decision is final and binding</li>
          <li>Class action waiver: disputes must be brought individually</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">
          Exceptions to Arbitration
        </h3>
        <p>The following disputes are NOT subject to arbitration:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Intellectual property disputes</li>
          <li>Small claims court matters (up to jurisdictional limit)</li>
          <li>Injunctive or equitable relief</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Jurisdiction</h3>
        <p>
          For disputes not subject to arbitration, you agree to submit to the
          exclusive jurisdiction of courts located in [Your Jurisdiction].
        </p>

        <h2 className="font-bold text-2xl mt-10"> General Provisions</h2>

        <h3 className="font-semibold text-xl mt-6"> Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire
          agreement between you and A2Z SAHAY ENTERPRISES PRIVATE LIMITED.
        </p>

        <h3 className="font-semibold text-xl mt-6">Severability</h3>
        <p>
          If any provision is found unenforceable, the remaining provisions
          remain in full effect.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Waiver</h3>
        <p>
          Our failure to enforce any right or provision does not constitute a
          waiver of that right.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Assignment</h3>
        <p>
          You may not assign or transfer these Terms without our written
          consent. We may assign these Terms to any affiliate or successor.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Force Majeure</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Natural disasters</li>
          <li>Acts of government</li>
          <li>Pandemics or public health emergencies</li>
          <li>Labor disputes</li>
          <li>Internet or telecommunications failures</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Notices</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email to your registered address</li>
          <li>In-app notifications</li>
          <li>Posting on our website</li>
        </ul>
        <p>You may send notices to: legal@sahaycrm.com</p>

        <h3 className="font-semibold text-xl mt-6"> Export Compliance</h3>
        <p>
          You agree to comply with all applicable export and import laws and
          regulations.
        </p>

        <h3 className="font-semibold text-xl mt-6"> No Agency</h3>
        <p>
          These Terms do not create any partnership, joint venture, employment,
          or agency relationship.
        </p>

        <h2 className="font-bold text-2xl mt-10">Mobile App Specific Terms</h2>

        <h3 className="font-semibold text-xl mt-6"> Mobile Licenses</h3>
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive,
          non-transferable license to download and use the mobile app on devices
          you own or control.
        </p>

        <h3 className="font-semibold text-xl mt-6"> App Store Terms</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Apple App Store:</strong> Apple's Licensed Application End
            User License Agreement
          </li>
          <li>
            <strong>Google Play Store:</strong> Google Play Terms of Service
          </li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Updates</h3>
        <p>
          You must download and install updates to continue using the app. We
          may automatically update the app.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Device Requirements</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Compatible mobile device (iOS or Android)</li>
          <li>Sufficient storage space</li>
          <li>Internet connection</li>
          <li>Current operating system version</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Permissions</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Network access</li>
          <li>Storage access (for caching)</li>
          <li>Notifications</li>
          <li>Camera/Photos (if you choose to upload)</li>
        </ul>
        <p>You can manage permissions in your device settings.</p>

        <h2 className="font-bold text-2xl mt-10">
          Enterprise and Organization Terms
        </h2>

        <h3 className="font-semibold text-xl mt-6"> Enterprise Accounts</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            These Terms apply to you in addition to your organization's
            agreement
          </li>
          <li>
            Your organization may have additional policies and restrictions
          </li>
          <li>Your organization's administrators may access your data</li>
          <li>Your organization may control user access and permissions</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">
          Administrator Responsibilities
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Managing user accounts and access</li>
          <li>Ensuring users comply with these Terms</li>
          <li>Their organization's use of the Service</li>
          <li>Maintaining appropriate security measures</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10"> Compliance and Legal</h2>

        <h3 className="font-semibold text-xl mt-6">Regulatory Compliance</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Data protection laws (GDPR, CCPA, etc.)</li>
          <li>Industry-specific regulations</li>
          <li>Export control laws</li>
          <li>Anti-spam laws</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6 Government Users " />
        <p>
          If you are a government entity, additional terms may apply. Contact us
          for details.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Audit Rights</h3>
        <p>
          For enterprise accounts, we reserve the right to audit your use of the
          Service to ensure compliance with these Terms.
        </p>

        <h2 className="font-bold text-2xl mt-10">Contact Information</h2>
        <p>If you have questions about these Terms and Conditions:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email: legal@sahaycrm.com</li>
          <li>Support: support@sahaycrm.com</li>
          <li>
            Website:{" "}
            <a
              href="https://sahaycrm.com/terms"
              className="text-blue-600 underline"
            >
              https://sahaycrm.com/terms
            </a>
          </li>
          <li>Mailing Address: [Your Company Address]</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10">Acknowledgment</h2>
        <p>
          BY USING A2Z SAHAY ENTERPRISES PRIVATE LIMITED, YOU ACKNOWLEDGE THAT
          YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND
          CONDITIONS.
        </p>
      </div>
    </div>
  );
}
