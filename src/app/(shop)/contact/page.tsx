import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50 to-white p-6">

      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-blue-200 pb-2">
          Muskan Online Shop
        </h2>

        <div className="flex items-start gap-4">
          <MapPin className="text-blue-600 w-6 h-6 flex-shrink-0" />
          <address className="not-italic text-gray-700 leading-relaxed">
            Block B South Mandail, Zinzira<br />
            Keranigonj Model Dhaka, Bangladesh
          </address>
        </div>

        <div className="flex items-center gap-4">
          <Mail className="text-blue-600 w-6 h-6 flex-shrink-0" />
          <a
            href="mailto:info@muskanonlineshop.com"
            className="text-blue-700 hover:underline font-medium"
          >
            info@muskanonlineshop.com
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Phone className="text-blue-600 w-6 h-6 flex-shrink-0" />
          <a
            href="tel:+8801799804899"
            className="text-blue-700 hover:underline font-medium"
          >
            01799804899
          </a>
        </div>
      </div>
    </div>
  );
}
