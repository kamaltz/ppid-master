import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="p-8 space-y-6 w-full max-w-md bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Login</h1>
          <p className="text-sm text-gray-600">
            Masuk ke sistem administrasi PPID
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
