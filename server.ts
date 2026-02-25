
import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const getRedirectUri = (provider: 'google' | 'github') => {
  // Use APP_URL if provided, otherwise fallback to localhost
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}/auth/${provider}/callback`;
};

app.get("/api/auth/google/url", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing Google OAuth credentials in environment variables");
    return res.status(500).json({ 
      error: "Konfigurasi Google OAuth belum lengkap (GOOGLE_CLIENT_ID/SECRET tidak ditemukan di Environment Variables)." 
    });
  }

  if (!process.env.APP_URL) {
    console.warn("APP_URL is not set, using default redirect URI");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri('google')
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
    prompt: "consent",
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      getRedirectUri('google')
    );

    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Send tokens back to the client via postMessage
    res.send(`
      <html>
        <head>
          <title>Autentikasi Berhasil</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
            .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
            h1 { color: #2563eb; margin-bottom: 0.5rem; }
            p { color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Berhasil!</h1>
            <p>Autentikasi Google berhasil. Jendela ini akan tertutup otomatis...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'GOOGLE_AUTH_SUCCESS', 
                  tokens: ${JSON.stringify(tokens)} 
                }, '*');
                console.log("Message sent to opener");
                setTimeout(() => window.close(), 1500);
              } else {
                console.error("No opener found");
                document.body.innerHTML += '<p style="color: red">Gagal mengirim data ke aplikasi utama. Silakan tutup jendela ini dan coba lagi.</p>';
              }
            } catch (e) {
              console.error("Error in postMessage:", e);
              alert("Terjadi kesalahan saat sinkronisasi. Silakan coba lagi.");
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error exchanging code:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/github/url", (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not configured" });
  }
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: getRedirectUri('github'),
    scope: 'repo,user',
    response_type: 'code',
  });
  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url });
});

app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getRedirectUri('github'),
      }),
    });

    const data = await response.json();
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', data: ${JSON.stringify(data)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. Closing window...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/github/repos", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=10", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const repos = await response.json();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

app.post("/api/google/sync-sheets", async (req, res) => {
  const { tokens, residents, rtName } = req.body;
  if (!tokens) return res.status(401).json({ error: "No tokens provided" });

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials(tokens);
    const sheets = google.sheets({ version: "v4", auth });

    let spreadsheetId = req.body.spreadsheetId;

    // 1. Create a new spreadsheet if ID is not provided
    if (!spreadsheetId) {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Database Warga - ${rtName || 'SmartWarga'} - ${new Date().toLocaleDateString('id-ID')}`,
          },
        },
      });
      spreadsheetId = spreadsheet.data.spreadsheetId;
    }

    // 2. Prepare data
    const headers = [
      "NIK", "No KK", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", 
      "Jenis Kelamin", "Agama", "Pekerjaan", "Golongan Darah", 
      "Status Perkawinan", "Provinsi", "Kabupaten/Kota", "Kecamatan", "Kelurahan", "Alamat Lengkap"
    ];

    const values = [
      headers,
      ...residents.map((r: any) => [
        r.nik, r.noKk, r.name, r.pob, r.dob, 
        r.gender, r.religion, r.occupation, r.bloodType, 
        r.maritalStatus, r.province, r.regency, r.district, r.village, r.address || '-'
      ])
    ];

    // 3. Write data (Overwrite Sheet1)
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId!,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    // Get the final URL
    const finalSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId: spreadsheetId! });

    res.json({ success: true, spreadsheetUrl: finalSpreadsheet.data.spreadsheetUrl, spreadsheetId });
  } catch (error: any) {
    console.error("Error syncing to sheets:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
