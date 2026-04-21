"use client";

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirmAction: () => void;
  onCloseAction: () => void;
  isDanger?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirmAction,
  onCloseAction,
  isDanger = true,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {isDanger && (
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-[var(--error)]" />
            </div>
          )}
          
          <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-text-muted mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={onCloseAction}
              className="flex-1 px-6 py-3 bg-background hover:bg-link-hover-bg text-foreground font-semibold rounded-xl transition-colors text-sm border border-surface-border order-2 sm:order-1"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmAction();
                onCloseAction();
              }}
              className={`flex-1 px-6 py-3 ${
                isDanger ? "bg-[var(--error)] hover:opacity-90 shadow-[var(--error)]/20" : "bg-[var(--primary)] hover:opacity-90 shadow-[var(--primary)]/20"
              } text-white font-semibold rounded-xl transition-colors text-sm order-1 sm:order-2 shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
