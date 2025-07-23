import DashGame from '@/components/dash-game';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-2 sm:p-4">
        <DashGame />
    </div>
  );
}
