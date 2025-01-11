import { useEffect, useState } from "react";

interface QrCodeProps {
  content: string; // The text or link to encode
  size?: number; // The size of the QR code (default 300)
  bgColor?: string; // The background color in hex (default "ffffff")
}

const QrCode: React.FC<QrCodeProps> = ({
  content,
  size = 300,
  bgColor = "ffffff",
}) => {
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    // Generate the QR code whenever props change
    const generateQR = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?data=${content}&size=${size}x${size}&bgcolor=${bgColor}`;
        setQrCode(url);
      } catch (error) {
        console.error("Error generating QR Code:", error);
      }
    };

    generateQR();
  }, [content, size, bgColor]);

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      {qrCode && (
        <img
          src={qrCode}
          alt="Generated QR Code"
          style={{ width: size, height: size }}
        />
      )}
      {qrCode && (
        <div style={{ marginTop: "10px" }}>
          <a href={qrCode} download="QRCode.png">
            <button
              style={{
                backgroundColor: "#9370db", // Purple
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Download QR Code
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default QrCode;
