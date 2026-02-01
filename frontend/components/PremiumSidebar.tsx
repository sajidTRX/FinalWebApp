import { MessageCircle, Crown } from "lucide-react";

interface PremiumSidebarProps {
  onOpenAiChat?: () => void;
}

export default function PremiumSidebar({ onOpenAiChat }: PremiumSidebarProps) {
  return (
    <aside className="w-72 min-w-[18rem] border-l border-gray-200 bg-gray-50 p-4 flex flex-col gap-4 h-full z-10">
      <h2 className="font-serif text-lg font-semibold text-gray-800 mb-2">
        Premium Features
      </h2>
      <div className="text-xs text-gray-500 mb-2">Writing & Organization</div>
      <div className="text-xs text-gray-700 font-semibold mb-2">
        AI Assistance
      </div>
      <div className="rounded-lg bg-white border border-gray-200 p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-200">
            <MessageCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-800 text-sm leading-none">
                AI Writing Assistant
              </h3>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                <Crown className="h-3 w-3 text-yellow-600" /> Premium
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Chat with our advanced AI to get writing suggestions, plot ideas,
              character development, and more.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAiChat}
          className="self-center inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-900 text-white hover:bg-gray-800 h-9 rounded-md px-4"
        >
          <MessageCircle className="h-4 w-4" />
          Open AI Chat
        </button>
      </div>
    </aside>
  );
}
