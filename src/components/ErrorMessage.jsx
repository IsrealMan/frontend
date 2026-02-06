import { AlertCircle } from 'lucide-react';

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
      <AlertCircle size={20} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export default ErrorMessage;
