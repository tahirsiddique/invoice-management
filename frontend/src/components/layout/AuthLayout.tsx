import { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">Invoice Management System</h1>
          <p className="text-primary-100 mt-2">Manage your invoices with ease</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
