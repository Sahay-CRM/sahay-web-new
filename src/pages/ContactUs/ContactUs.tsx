import { MapPin } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="w-full py-20 px-6 bg-white min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-[64px] font-medium text-primary mb-6 tracking-tight">
            Contact us
          </h1>
          <h2 className="text-xl font-bold text-gray-900 mb-12">Head Office</h2>
        </div>

        {/* Info Section */}
        <div className="max-w-3xl mx-auto mb-20 px-4">
          <div className="flex items-start gap-4 mb-10">
            <div className="mt-1.5 p-1 bg-gray-50 rounded-full">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              A2Z SAHAY ENTERPRISES PRIVATE LIMITED
            </h3>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-y-8 text-lg">
            <div className="font-semibold text-gray-800">Address</div>
            <div className="text-gray-700 leading-relaxed max-w-md">
              1103, Abhishree Adroit, near Mansi Circle, Vastrapur, Ahmedabad,
              Gujarat 380015.
            </div>

            <div className="font-semibold text-gray-800">Email</div>
            <div>
              <a
                href="mailto:help@sahay.group"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                help@sahay.group
              </a>
            </div>

            <div className="font-semibold text-gray-800">Phone</div>
            <div className="text-gray-700">
              <a
                href="tel:+918320547177"
                className="hover:text-primary transition-colors"
              >
                +91-8320547177
              </a>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full h-[600px] bg-gray-100 rounded-sm overflow-hidden relative border-t border-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.74041740!2d72.521877!3d23.0336957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e857c4f28834f%3A0x9ec583690b36129e!2sSahay%20Consultancy%20Group!5e0!3m2!1sen!2sin!4v1708230000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale-[0.2]"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
