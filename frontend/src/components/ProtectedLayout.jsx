import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const ProtectedLayout = ({ children, user }) => {
  // Agar user null hai, toh login page par redirect karo
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        {/* Sidebar ko user object mil raha hai taaki photo dikhe */}
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} />
        </div>
        
        <main className="w-full max-w-[600px] border-x border-gray-800/60 min-h-screen">
          {children}
        </main>

        {/* Right Sidebar Placeholder */}
        <div className="hidden lg:block w-[350px] pl-8 py-3"></div>
      </div>
    </div>
  );
};

export default ProtectedLayout;