
import { useNavigate } from "react-router-dom";
import BluChat from "./BluChat";

export default function BluFullscreenView() {
  const navigate = useNavigate();

  function backToPanel() {
    window.dispatchEvent(new Event("blu-open-panel"));
    navigate("/home");
  }

  function closeEntirely() {
    window.dispatchEvent(new Event("blu-force-close"));
    navigate("/home");
  }

  return (
    <BluChat
      mode="fullscreen"
      onClose={closeEntirely}
      onBackToPanel={backToPanel}
    />
  );
}
