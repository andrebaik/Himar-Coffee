import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

export default function MessageBubble({ message, onRetry, onClosePanel }) {
  const navigate = useNavigate();

  if (message.sender === 'user') {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[84%] bg-[#b5532c] px-4 py-3 text-sm leading-6 text-white whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.sender === 'error') {
    return (
      <div className="mb-4 flex justify-start">
        <div className="max-w-[88%] border-l-2 border-[#b5532c] bg-[#fff8f3] px-4 py-3 text-sm leading-6 text-[#281a13]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-[#b5532c]" aria-hidden="true" />
            <span className="whitespace-pre-wrap">{message.text}</span>
          </div>
          {message.retryText && (
            <button type="button" onClick={() => onRetry(message.retryText)} className="mt-3 inline-flex min-h-11 items-center gap-2 border border-[#281a13] px-3 text-xs font-bold uppercase tracking-[0.08em] text-[#281a13] transition hover:bg-[#281a13] hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#4f6d52] text-[#4f6d52]">
        <Coffee className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="max-w-[88%] space-y-3">
        <div className="border border-[#ded2c1] bg-[#fffdf8] px-4 py-3 text-sm leading-6 text-[#281a13] whitespace-pre-wrap">
          {message.text}
        </div>

        {Array.isArray(message.actions) && message.actions.length > 0 && (
          <div className="grid gap-2">
            {message.actions.map((action, index) => {
              if (action.type === 'link') {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      navigate(action.path);
                      onClosePanel?.();
                    }}
                    className="inline-flex min-h-11 items-center gap-2 border border-[#b5532c] px-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-[#b5532c] transition hover:bg-[#b5532c] hover:text-white"
                  >
                    {action.label}
                  </button>
                );
              }

              if (action.type === 'whatsapp') {
                return (
                  <a key={index} href={action.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 bg-[#25d366] px-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#20ba59]">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    {action.label}
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
