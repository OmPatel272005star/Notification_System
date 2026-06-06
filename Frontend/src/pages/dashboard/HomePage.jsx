import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-3 animate-fade-in pt-20 px-6 max-w-xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {greeting}, {user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
        MailFlow is a scalable notification system for sending email campaigns,
        managing your audience, and tracking delivery — all in one place.
      </p>
    </div>
  );
}
