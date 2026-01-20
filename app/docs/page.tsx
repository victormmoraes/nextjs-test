"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [spec, setSpec] = useState<object | undefined>(undefined);

  const checkAuth = async (username: string, password: string) => {
    try {
      const basicAuth = btoa(`${username}:${password}`);
      const response = await fetch("/api/docs", {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpec(data);
        setIsAuthorized(true);
        // Note: sessionStorage is used for internal API docs only.
        // Credentials are cleared on tab close. For public-facing apps,
        // consider using token-based auth instead.
        sessionStorage.setItem("docs_auth", basicAuth);
      } else {
        setError("Invalid credentials");
        setIsAuthorized(false);
      }
    } catch {
      setError("Failed to authenticate");
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("docs_auth");
    if (savedAuth) {
      const [username, password] = atob(savedAuth).split(":");
      checkAuth(username, password);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    checkAuth(credentials.username, credentials.password);
  };

  if (isAuthorized === null) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h1 style={styles.title}>API Documentation</h1>
          <p style={styles.subtitle}>Please enter your credentials to access the docs</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>Username</label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                style={styles.input}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={styles.input}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button}>
              Access Documentation
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    padding: "20px",
  },
  loading: {
    color: "#fff",
    fontSize: "18px",
  },
  loginBox: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: 600,
    color: "#1a1a2e",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  error: {
    margin: 0,
    padding: "10px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "6px",
    color: "#c00",
    fontSize: "14px",
    textAlign: "center",
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    marginTop: "8px",
  },
};
