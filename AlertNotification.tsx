import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

/**
 * Alert Notification Component
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Clean, minimal design
 * - Auto-dismiss after duration
 * - Accessible and responsive
 */

export function Alert({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration, isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50"
      : type === "error"
        ? "bg-red-50"
        : type === "warning"
          ? "bg-yellow-50"
          : "bg-blue-50";

  const borderColor =
    type === "success"
      ? "border-green-200"
      : type === "error"
        ? "border-red-200"
        : type === "warning"
          ? "border-yellow-200"
          : "border-blue-200";

  const iconColor =
    type === "success"
      ? "text-green-600"
      : type === "error"
        ? "text-red-600"
        : type === "warning"
          ? "text-yellow-600"
          : "text-blue-600";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error" || type === "warning"
        ? AlertCircle
        : Info;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border ${bgColor} ${borderColor}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fechar alerta"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * Alert Container Component
 * Displays multiple alerts stacked vertically
 */

export interface AlertContainerProps {
  alerts: AlertProps[];
  onRemove: (index: number) => void;
  position?: "top" | "bottom";
}

export function AlertContainer({
  alerts,
  onRemove,
  position = "top",
}: AlertContainerProps) {
  return (
    <div
      className={`fixed right-4 left-4 md:left-auto md:w-96 z-50 space-y-3 ${
        position === "top" ? "top-4" : "bottom-4"
      }`}
    >
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          {...alert}
          onClose={() => onRemove(index)}
        />
      ))}
    </div>
  );
}

/**
 * Inline Alert Component
 * For displaying alerts within page content
 */

export interface InlineAlertProps extends AlertProps {
  dismissible?: boolean;
}

export function InlineAlert({
  type,
  title,
  message,
  onClose,
  dismissible = true,
}: InlineAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50"
      : type === "error"
        ? "bg-red-50"
        : type === "warning"
          ? "bg-yellow-50"
          : "bg-blue-50";

  const borderColor =
    type === "success"
      ? "border-green-200"
      : type === "error"
        ? "border-red-200"
        : type === "warning"
          ? "border-yellow-200"
          : "border-blue-200";

  const iconColor =
    type === "success"
      ? "text-green-600"
      : type === "error"
        ? "text-red-600"
        : type === "warning"
          ? "text-yellow-600"
          : "text-blue-600";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error" || type === "warning"
        ? AlertCircle
        : Info;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border ${bgColor} ${borderColor}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar alerta"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
