import React from "react";
import ModalData from "@/components/shared/Modal/ModalData/ModalData";
import iphoneQR from "@/assets/iphone.png";
import androidQR from "@/assets/Android.png";
import {
  ArrowUpRight,
  // Apple,
  // Play,
} from "lucide-react";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const iosAppUrl = import.meta.env.VITE_IOS_APP_URL;

  const androidAppUrl = import.meta.env.VITE_ANDROID_APP_URL;

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle="Get the Mobile App"
      containerClass="max-w-[500px] w-full"
    >
      <div className="py-2">
        {/* Top Text */}
        <div className="text-center mb-6">
          <p className="text-lg font-bold text-slate-900">
            Download the app on your mobile device
          </p>

          <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
            Scan the QR code or open directly from your preferred app store.
          </p>
        </div>

        {/* QR Sections */}
        <div className="grid grid-cols-2 gap-8 mt-4">
          {/* iOS */}
          <div className="flex flex-col items-center text-center group">
            <a
              href={iosAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-200 block cursor-pointer"
            >
              <img
                src={iphoneQR}
                alt="iOS QR"
                className="w-32 h-32 object-contain"
              />
            </a>

            <a
              href={iosAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition-all text-slate-700 hover:text-slate-900 cursor-pointer shadow-sm"
            >
              {/* <Apple size={16} className="text-slate-800" /> */}
              <span className="text-sm font-bold">App Store</span>
              <ArrowUpRight size={13} className="opacity-70" />
            </a>
          </div>

          {/* Android */}
          <div className="flex flex-col items-center text-center group">
            <a
              href={androidAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-200 block cursor-pointer"
            >
              <img
                src={androidQR}
                alt="Android QR"
                className="w-32 h-32 object-contain"
              />
            </a>

            <a
              href={androidAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition-all text-slate-700 hover:text-slate-900 cursor-pointer shadow-sm"
            >
              {/* <Play size={16} className="text-emerald-600 fill-emerald-600" /> */}
              <span className="text-sm font-bold">Play Store</span>
              <ArrowUpRight size={13} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </ModalData>
  );
};

export default AppDownloadModal;
