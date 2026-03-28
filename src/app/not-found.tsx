export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Inter, system-ui, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "72px", fontWeight: 800, margin: 0, color: "#94a3b8" }}>
            404
          </h1>
          <p style={{ fontSize: "18px", color: "#64748b", marginTop: "8px" }}>
            This page could not be found.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "24px",
              padding: "10px 24px",
              backgroundColor: "#0891b2",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Go to Homepage
          </a>
        </div>
      </body>
    </html>
  );
}
