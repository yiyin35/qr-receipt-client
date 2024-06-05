import React from "react";
import QRCode from "react-qr-code";

function QrCode(props) {
  return (
    <div>
      <div>
        <QRCode value={props.qrInfo} className="qrCode" />
      </div>
    </div>
  );
}

export default QrCode;
