"use client";

import { FileText } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Terms of Service",
    subtitle: "Please read these terms carefully. By using Tijaar, you agree to be bound by the following conditions.",
    last_updated: "October 10, 2023",
  },
  sections: [
    { title: "1. Introduction", content: "<p>Welcome to Tijaar. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully. We serve buyers and sellers in Pakistan and beyond.</p>" },
    { title: "2. Eligibility to use services", content: "<p>You must be at least 18 years old (or the age of majority in your jurisdiction) and have the legal capacity to enter into a binding agreement. You must not be prohibited from using the service under applicable law. By using Tijaar, you represent that you meet these requirements.</p>" },
    { title: "3. Your Account", content: "<p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate and complete information when registering. Notify us immediately of any unauthorized use of your account.</p>" },
    { title: "4. Site Content", content: "<p>All content on this site (text, graphics, logos, images, software) is owned by Tijaar or its licensors and is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.</p>" },
    { title: "5. User Content", content: "<p>You retain ownership of content you submit (listings, reviews, messages). By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute it in connection with the platform. You are responsible for ensuring your content does not violate any law or third-party rights.</p>" },
    { title: "6. Prohibited Activities", content: "<p>You may not use Tijaar for illegal activity, fraud, counterfeit goods, harassment, or to harm others. Prohibited conduct includes: violating laws, infringing intellectual property, spamming, manipulating reviews or rankings, and circumventing security measures. We reserve the right to remove content and suspend or terminate accounts that violate these terms.</p>" },
    { title: "7. Fees and Payment", content: "<p>We may charge fees for selling or premium features. Any applicable fees will be shown before you commit. Sellers may be subject to transaction or listing fees. Refunds for our fees are subject to our refund policy. Payment processing is handled by third-party providers subject to their terms.</p>" },
    { title: "8. Intellectual Property", content: "<p>Tijaar and its logos, names, and related marks are our trademarks. You may not use them without our written permission. All rights in the platform and its content not expressly granted are reserved. User content is licensed as described in the User Content section.</p>" },
    { title: "9. Third-Party Links", content: "<p>Our site may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or availability of those sites. Your use of third-party services is at your own risk and subject to their terms.</p>" },
    { title: "10. Termination", content: "<p>We may suspend or terminate your account at any time for breach of these terms or for any other reason. You may close your account at any time. Upon termination, your right to use the platform ceases. Provisions that by their nature should survive (e.g. indemnification, limitation of liability) will survive.</p>" },
    { title: "11. Indemnification", content: "<p>You agree to indemnify and hold harmless Tijaar, its affiliates, and their officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, your content, or your breach of these terms.</p>" },
    { title: "12. Limitation of Liability", content: "<p>To the maximum extent permitted by law, Tijaar shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill. Our total liability for any claim shall not exceed the amount you paid us in the twelve months before the claim arose.</p>" },
    { title: "13. Disclaimers", content: "<p>The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or secure. We disclaim all warranties including merchantability and fitness for a particular purpose.</p>" },
    { title: "14. Governing Law", content: "<p>These terms are governed by the laws of the jurisdiction in which Tijaar operates, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction, unless otherwise required by applicable law.</p>" },
    { title: "15. Changes to Terms", content: "<p>We may update these terms from time to time. We will post the revised terms on this page and update the &quot;Last updated&quot; date. Continued use of the platform after changes means you accept the new terms. For material changes, we will notify you by email or through the platform where required by law.</p>" },
  ],
  footer_contact_text: "If you have any questions about these Terms, please contact us.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function TermsContent() {
  return (
    <SectionBasedPage
      slug="terms"
      defaultData={DEFAULT}
      Icon={FileText}
      badgeColor="bg-emerald-50 border-emerald-100 text-teal-800"
    />
  );
}
