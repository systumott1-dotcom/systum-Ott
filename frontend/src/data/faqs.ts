import type { FAQItem } from '../types';

export const FAQS: FAQItem[] = [
  {
    id: '1',
    category: 'delivery',
    question: 'How do I receive my subscription after payment?',
    answer: 'Immediately after completing your payment via UPI / QR code, you will receive an instant confirmation. The login credentials, invite link, or license key will be sent directly to your WhatsApp number within 5 to 15 minutes during operating hours (9 AM – 11 PM IST).',
  },
  {
    id: '2',
    category: 'general',
    question: 'What is the difference between a Private Account and a Shared Profile?',
    answer: 'A Private Account is 100% dedicated to you where you can customize passwords, manage all profiles, and log in across all supported devices. A Shared Profile gives you a personal dedicated PIN-protected profile on a premium shared plan (e.g., Netflix 4K screen), allowing you to stream in 4K at a fraction of the cost without any screen conflict issues.',
  },
  {
    id: '3',
    category: 'troubleshooting',
    question: 'What happens if my subscription stops working?',
    answer: 'All our subscriptions come with an Unconditional Replacement Warranty for the entire validity period. If you face any login issues, screen limit errors, or technical hiccups, simply message our WhatsApp support desk with your order ID, and our team will resolve or replace it within minutes.',
  },
  {
    id: '4',
    category: 'payments',
    question: 'Which payment methods are accepted?',
    answer: 'We support all major Indian UPI payment apps including Google Pay, PhonePe, Paytm, BHIM, Cred UPI, and direct bank transfers. All payments are 100% secure with instant screenshot verification.',
  },
  {
    id: '5',
    category: 'general',
    question: 'Do I need to use a VPN to watch or use these services?',
    answer: 'No! All subscriptions and licenses provided on our platform are optimized specifically for Indian users and work seamlessly without requiring any VPN or proxy configuration.',
  },
  {
    id: '6',
    category: 'general',
    question: 'Can I renew the same account after the validity period expires?',
    answer: 'Yes, for most services (such as Canva, Spotify, YouTube Premium, Adobe CC, and private accounts), you can seamlessly renew the same existing account by placing a renewal order before or at the end of the term.',
  },
];
