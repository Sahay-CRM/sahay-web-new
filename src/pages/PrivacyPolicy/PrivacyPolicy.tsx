// import { useEffect } from "react";
// import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function PrivacyPolicy() {
  // const { setBreadcrumbs } = useBreadcrumbs();

  // useEffect(() => {
  //   setBreadcrumbs([{ label: "Privacy Policy", href: "" }]);
  // }, [setBreadcrumbs]);

  return (
    <div className="w-full py-10 px-6">
      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none leading-relaxed">
        {/* 🔥 Hero Section (Background Image + Center Title) */}
        <div className="w-full h-20  mb-10  relative flex items-center justify-center">
          {/* Dark Overlay */}
          {/* <div className="absolute inset-0 bg-white"></div> */}

          {/* Title */}
          <h1 className="relative text-primary text-4xl font-bold drop-shadow-lg">
            Privacy Policy for A2Z SAHAY ENTERPRISES PRIVATE LIMITED
          </h1>
        </div>
        <p>
          Welcome to A2Z SAHAY ENTERPRISES PRIVATE LIMITED ("we," "our," or
          "us"). We are committed to protecting your privacy and ensuring the
          security of your personal information. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you
          use our mobile application and services.
        </p>

        <p className="mt-5">
          By using A2Z SAHAY ENTERPRISES PRIVATE LIMITED, you agree to the
          collection and use of information in accordance with this policy.
        </p>

        <p className="mt-5">
          We collect certain information to ensure smooth functionality, enhance
          performance, improve user experience, and maintain platform security.
          This includes details you provide directly as well as information
          automatically collected when you interact with the app.
        </p>

        <h2 className="font-bold text-2xl mt-10">Information We Collect</h2>

        <p>
          We collect personal details such as your name, email address, phone
          number, business information, and login credentials, which are
          securely encrypted. Additionally, any CRM data you manage inside the
          app—such as contacts, leads, notes, or records—is stored to provide
          you with seamless CRM functionality.
        </p>

        <p>
          When you use the app, essential technical information is collected
          automatically. This includes device details such as operating system,
          model, unique device identifiers, usage patterns, app interactions,
          feature engagement, crash logs, diagnostics, and basic network
          information including your IP address. These insights help us maintain
          app performance, improve stability, and resolve issues effectively.
        </p>

        <p>
          To respect your privacy, we intentionally avoid collecting sensitive
          information such as precise GPS locations, SMS or call logs, financial
          or banking details, health-related data, or biometric identifiers.
        </p>
        <h3 className="font-semibold text-xl mt-6">
          Automatically Collected Information
        </h3>
        <p>
          When you use our app, certain information is collected automatically
          to help us improve performance, stability, and user experience. This
          includes details about your device, app usage, and technical
          environment:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Device Information:</strong> Device ID, operating system,
            device model, and unique device identifiers
          </li>
          <li>
            <strong>Usage Data:</strong> App interactions, features used, time
            spent on the app, and user preferences
          </li>
          <li>
            <strong>Performance Data:</strong> Crash logs, diagnostic
            information, error reports, and app performance metrics
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, and
            network information
          </li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">
          Information We Do NOT Collect
        </h3>
        <p>
          We respect your privacy and intentionally avoid collecting sensitive
          information that is not necessary for CRM functionality:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Precise geolocation data</li>
          <li>
            Photos, videos, or media files (unless you explicitly share them)
          </li>
          <li>SMS or call logs</li>
          <li>Financial or payment information</li>
          <li>Health or fitness data</li>
          <li>Racial, ethnic, political, or religious information</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10">
          How We Use Your Information
        </h2>

        <p>
          We use the collected information to operate, improve, and secure the
          A2Z SAHAY ENTERPRISES PRIVATE LIMITED platform. Your data is used for
          essential app functions, performance optimization, communication, and
          security purposes.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Core Functionality</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Creating and managing your account</li>
          <li>Providing CRM services and features</li>
          <li>Enabling communication between users and customers</li>
          <li>Storing and managing business contacts and data</li>
          <li>Synchronizing data across devices</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Service Improvement</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analyzing app usage to improve features</li>
          <li>Diagnosing and fixing technical issues</li>
          <li>Monitoring app performance and stability</li>
          <li>Developing new features and services</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Communication</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sending important service updates and notifications</li>
          <li>Responding to your inquiries and support requests</li>
          <li>Providing customer support</li>
          <li>Sending administrative information</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">
          Security and Fraud Prevention
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Protecting against unauthorized access</li>
          <li>Detecting and preventing fraud or security breaches</li>
          <li>Ensuring compliance with our Terms and Conditions</li>
          <li>Maintaining data integrity and security</li>
        </ul>
        <h2 className="font-bold text-2xl mt-10">
          Data Sharing and Disclosure
        </h2>

        <h3 className="font-semibold text-xl mt-6">We Do NOT Sell Your Data</h3>
        <p>
          We do not sell, rent, or trade your personal information to third
          parties for marketing purposes.
        </p>

        <h3 className="font-semibold text-xl mt-6">Service Providers</h3>
        <p>
          We may share your information with trusted third-party service
          providers who assist us in:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cloud hosting and data storage</li>
          <li>Analytics and performance monitoring</li>
          <li>Customer support services</li>
          <li>Email delivery services</li>
        </ul>
        <p>
          These providers are contractually obligated to protect your data and
          use it only for specified purposes.
        </p>

        <h3 className="font-semibold text-xl mt-6"> Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, your
          information may be transferred to the acquiring entity.
        </p>

        <h3 className="font-semibold text-xl mt-6">Legal Requirements</h3>
        <p>
          We may disclose your information if required by law or in response to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Court orders or legal processes</li>
          <li>Government or regulatory requests</li>
          <li>Protection of our rights, property, or safety</li>
          <li>Prevention of fraud or illegal activities</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6">Within Your Organization</h3>
        <p>
          If you use A2Z SAHAY ENTERPRISES PRIVATE LIMITED through an enterprise
          account, your organization's administrators may have access to your
          usage data and business information.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Data Security</h2>

        <h3 className="font-semibold text-xl mt-6"> Security Measures</h3>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Encryption:</strong> All data transmitted between your
            device and our servers is encrypted using SSL/TLS protocols
          </li>
          <li>
            <strong>Access Controls:</strong> Strict access controls and
            authentication mechanisms
          </li>
          <li>
            <strong>Secure Storage:</strong> Data is stored on secure, encrypted
            servers
          </li>
          <li>
            <strong>Regular Audits:</strong> Regular security audits and
            vulnerability assessments
          </li>
          <li>
            <strong>Employee Training:</strong> All employees are trained on
            data security and privacy practices
          </li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Data Retention</h3>
        <p>
          We retain your personal information as long as your account is active,
          necessary to provide services, or required by law. When you delete
          your account, we delete or anonymize your personal information within
          90 days, except where retention is legally required.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Your Rights and Choices</h2>

        <h3 className="font-semibold text-xl mt-6">Access and Correction</h3>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal information</li>
          <li>Request correction of inaccurate data</li>
          <li>Update your account information at any time</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Data Portability</h3>
        <p>
          You can request a copy of your data in a machine-readable format by
          contacting us .
        </p>

        <h3 className="font-semibold text-xl mt-6"> Deletion</h3>
        <p>You can request deletion of your account and personal data by:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Using the in-app account deletion feature</li>

          <li>
            Emailing:{" "}
            <a
              href="mailto:privacy@sahaycrm.com"
              className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
            >
              privacy@sahaycrm.com
            </a>
          </li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Opt-Out Options</h3>
        <p>You can opt-out of:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Marketing communications (service-related communications are
            required)
          </li>
          <li>
            Crash reporting and analytics (may limit our ability to improve the
            app)
          </li>
          <li>Push notifications (can be disabled in device settings)</li>
        </ul>

        <h3 className="font-semibold text-xl mt-6"> Do Not Track</h3>
        <p>
          We currently do not respond to "Do Not Track" signals from browsers.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Children's Privacy</h2>
        <p>
          A2Z SAHAY ENTERPRISES PRIVATE LIMITED is not intended for users under
          the age of 18. We do not knowingly collect personal information from
          children. If we discover that we have collected information from a
          child, we will promptly delete it.
        </p>

        <h2 className="font-bold text-2xl mt-10">
          International Data Transfers
        </h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your country of residence. We use industry-standard legal
          and technical safeguards to ensure compliance and protection. For
          users in the European Economic Area (EEA), we comply with GDPR
          requirements for international data transfers.
        </p>

        <h2 className="font-bold text-2xl mt-10">
          Cookies and Tracking Technologies
        </h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Maintain your session</li>
          <li>Remember your preferences</li>
          <li>Analyze app usage and performance</li>
          <li>Improve user experience</li>
        </ul>
        <p>
          You can control cookies through your device settings, but disabling
          them may affect app functionality.
        </p>

        <h2 className="font-bold text-2xl mt-10"> Third-Party Services</h2>
        <p>
          Our app may contain links to third-party websites or services. We are
          not responsible for the privacy practices of these third parties. We
          encourage you to review their privacy policies.
        </p>
        <h3 className="font-semibold text-xl mt-6">
          Third-Party Services We Use:
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cloud hosting providers</li>
          <li>Analytics services</li>
          <li>Crash reporting tools</li>
          <li>Email service providers</li>
        </ul>

        <h2 className="font-bold text-2xl mt-10">
          California Privacy Rights (CCPA)
        </h2>
        <p>
          If you are a California resident, you have additional rights under the
          California Consumer Privacy Act:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Right to Know:</strong> Request information about data
            collection and use
          </li>
          <li>
            <strong>Right to Delete:</strong> Request deletion of your personal
            information
          </li>
          <li>
            <strong>Right to Opt-Out:</strong> Opt-out of the sale of personal
            information (we do not sell data)
          </li>
          <li>
            <strong>Right to Non-Discrimination:</strong> Equal service
            regardless of privacy rights exercise
          </li>
        </ul>
        <p>To exercise these rights.</p>

        <h2 className="font-bold text-2xl mt-10">
          European Privacy Rights (GDPR)
        </h2>
        <p>
          If you are in the European Economic Area, you have rights under GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Right of Access:</strong> Access your personal data
          </li>
          <li>
            <strong>Right to Rectification:</strong> Correct inaccurate data
          </li>
          <li>
            <strong>Right to Erasure:</strong> Request deletion of your data
          </li>
          <li>
            <strong>Right to Restrict Processing:</strong> Limit how we use your
            data
          </li>
          <li>
            <strong>Right to Data Portability:</strong> Receive your data in a
            portable format
          </li>
          <li>
            <strong>Right to Object:</strong> Object to certain data processing
            activities
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Withdraw consent at any
            time
          </li>
        </ul>
        <p>
          To exercise these rights or file a complaint with a supervisory
          authority.
        </p>

        <h2 className="font-bold text-2xl mt-10">
          Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated by:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Posting the updated policy in the app</li>
          <li>Sending an email notification</li>
          <li>Displaying a prominent notice in the app</li>
        </ul>
        <p>
          Your continued use of A2Z SAHAY ENTERPRISES PRIVATE LIMITED after
          changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="font-bold text-2xl mt-10">Contact Information</h2>

        <p>
          <strong>A2Z SAHAY ENTERPRISES PRIVATE LIMITED</strong>
          <br />
          10/B Crystal CHS Ltd., Krishnabunglows, Bodakdev
          <br />
          Ahmedabad – 380054, India
        </p>

        <p>
          <strong>Website:</strong>{" "}
          <a
            href="https://www.sahay.group"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            https://www.sahay.group
          </a>
        </p>

        <p className="mt-8">
          By continuing to use A2Z SAHAY ENTERPRISES PRIVATE LIMITED, you
          confirm that you have read, understood, and agreed to this Privacy
          Policy.
        </p>
      </div>
    </div>
  );
}
