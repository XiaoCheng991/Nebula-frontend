import Sidebar from "@/components/Sidebar";
import MusicPage from "@/components/music/MusicPage";

export default function MusicRoute() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6 light-page-layout light-two-column light-page-main--wide">
      <Sidebar />
      {/* Main content: integrated player panel (player | playlist) */}
      <div className="light-page-main">
        <MusicPage />
      </div>
    </div>
  );
}
