import JSZip from "jszip";
import { saveAs } from "file-saver";

const DownloadButton = ({ iframeRef }) => {
  const handleDownload = () => {
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Get HTML and CSS
    const html = iframeDoc.documentElement.outerHTML;
    const styles = Array.from(iframeDoc.querySelectorAll("style"))
      .map((style) => style.outerHTML)
      .join("\n");

    // Create ZIP file
    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file("styles.css", styles);

    // Add placeholder images (optional)
    zip.file("images/hero.jpg", "https://picsum.photos/1200/600", {
      binary: true,
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, "professional-landing-page.zip");
    });
  };

  return (
    <button
      onClick={handleDownload}
      className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 shadow-lg hover:bg-green-700 transition-all flex items-center"
    >
      <i className="fas fa-download mr-2"></i>
      Download Code
    </button>
  );
};

export default DownloadButton;
