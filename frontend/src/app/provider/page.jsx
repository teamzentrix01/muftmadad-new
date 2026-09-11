import Navbar from '@/components/Navbar';
import HospitalCareAdmin from '@/components/care/HospitalCareAdmin';

export default function ProviderPage() {
  return <><Navbar /><main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24"><HospitalCareAdmin standalone /></main></>;
}
