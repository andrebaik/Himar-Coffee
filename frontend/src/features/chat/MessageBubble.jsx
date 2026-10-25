import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, AlertCircle, RefreshCw, MessageSquare, ArrowRight } from 'lucide-react';

export default function MessageBubble({ message, onRetry, onClosePanel }) {
  const navigate = useNavigate();

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] bg-[#B5532C] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs md:text-sm shadow-xs whitespace-pre-wrap leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.sender === 'error') {
    return (
      <div className="flex justify-start mb-3">
        <div className="max-w-[85%] bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-2xl rounded-tl-xs text-xs shadow-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{message.text}</span>
          </div>
          {message.retryText && (
            <button
              onClick={() => onRetry(message.retryText)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 bg-white border border-red-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  // Bot message
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#FAF4EA] border border-[#E7DCCB] text-[#B5532C] flex items-center justify-center shrink-0 mt-0.5">
        <Coffee className="w-3.5 h-3.5" />
      </div>

      <div className="max-w-[85%] space-y-2">
        <div className="bg-white border border-[#E7DCCB] text-[#2B1B12] px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs md:text-sm shadow-xs whitespace-pre-wrap leading-relaxed">
          {message.text}
        </div>

        {/* Action Buttons if any */}
        {Array.isArray(message.actions) && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.actions.map((act, idx) => {
              if (act.type === 'link') {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(act.path);
                      if (onClosePanel) onClosePanel();
                    }}
                    className="inline-flex items-center gap-1 text-xs bg-[#FAF4EA] hover:bg-[#E7DCCB]/60 text-[#B5532C] font-semibold border border-[#E7DCCB] px-3 py-1.5 rounded-full shadow-2xs transition cursor-pointer"
                  >
                    <span>{act.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                );
              }

              if (act.type === 'whatsapp') {
                return (
                  <a
                    key={idx}
                    href={act.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-[#25D366] hover:bg-[#20ba59] text-white font-medium px-3.5 py-1.5 rounded-full shadow-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{act.label}</span>
                  </a>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
