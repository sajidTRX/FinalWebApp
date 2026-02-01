"use client";

import { BackButton } from "@/components/ui/back-button";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="flex-shrink-0 border-b border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center">
          <BackButton className="mr-2" />
          <h1 className="font-serif text-xl font-medium text-[#3d3225]">Help & Support</h1>
        </div>
      </div>
      <div className="flex-1 p-6">
      <h2 className="text-xl font-semibold mb-6 text-[#3d3225]">Quick Start & FAQs</h2>

      {/* Quick Start Guide */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#3d3225]">Quick Start Guide</h2>
        <ul className="list-disc pl-6 text-sm text-[#4a3f32]">
          <li>Power On: Press and hold the power button for 3 seconds.</li>
          <li>Unlock: Use your fingerprint or enter your PIN.</li>
          <li>Write: Select a writing mode and start typing.</li>
          <li>Save: Your work is auto-saved, or press Ctrl+S to save manually.</li>
          <li>Export: Go to the export menu to save your work as a PDF or text file.</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#3d3225]">FAQs</h2>
        <ul className="list-disc pl-6 text-sm text-[#4a3f32]">
          <li><strong>How do I change my PIN?</strong> Go to Settings &gt; Security &gt; Change PIN.</li>
          <li><strong>How do I switch writing modes?</strong> Use the mode selector on the home screen.</li>
          <li><strong>How do I backup my files?</strong> Connect to a USB or enable cloud sync in Settings.</li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#3d3225]">Troubleshooting</h2>
        <ul className="list-disc pl-6 text-sm text-[#4a3f32]">
          <li><strong>Device not turning on:</strong> Ensure the battery is charged. Press and hold the power button for 10 seconds.</li>
          <li><strong>Fingerprint not working:</strong> Clean the sensor and try again. Re-register your fingerprint if needed.</li>
          <li><strong>Slow performance:</strong> Restart the device or close unused applications.</li>
        </ul>
      </section>

      {/* Contact Support */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#3d3225]">Contact Support</h2>
        <p className="text-sm text-[#4a3f32]">Need more help? Contact us:</p>
        <ul className="list-disc pl-6 text-sm text-[#4a3f32]">
          <li>Email: <a href="mailto:support@sonzaikan.com" className="text-[#4a3f32] underline hover:text-[#3d3225]">support@sonzaikan.com</a></li>
          <li>Website: <a href="https://www.sonzaikan.com" target="_blank" rel="noopener noreferrer" className="text-[#4a3f32] underline hover:text-[#3d3225]">www.sonzaikan.com</a></li>
        </ul>
      </section>

      {/* Feedback */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-[#3d3225]">Feedback</h2>
        <p className="text-sm text-[#4a3f32]">We value your feedback. Let us know how we can improve:</p>
        <textarea
          rows={4}
          placeholder="Write your feedback here..."
          className="w-full mt-2 rounded-md border-[#a89880] bg-[#f5f0e8] text-[#3d3225] shadow-sm focus:border-[#6b5d4d] focus:ring-[#6b5d4d] sm:text-sm placeholder:text-[#8b7d6b]"
        ></textarea>
        <button className="mt-4 px-4 py-2 bg-[#4a3f32] text-[#efe6d5] rounded-md shadow-sm hover:bg-[#3d3225] focus:outline-none focus:ring-2 focus:ring-[#6b5d4d] focus:ring-offset-2">
          Submit Feedback
        </button>
      </section>
      </div>
    </div>
  );
}