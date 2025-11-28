# GitHub Pages Setup

Your dashboard is now compatible with GitHub Pages! Here's how to enable it:

## Quick Setup (Recommended)

1. Go to your repository: https://github.com/elle-pnc/weather-monitoring-system
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

Your dashboard will be available at:
**https://elle-pnc.github.io/weather-monitoring-system/**

## Alternative: Using GitHub Actions

If you prefer automatic deployment via GitHub Actions, the workflow file is already included (`.github/workflows/pages.yml`). Just enable GitHub Pages in Settings and it will use the workflow automatically.

## Testing Locally

Before deploying, you can test the dashboard locally:

1. Simply open `index.html` in your web browser
2. Or use a local server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

## Important Notes

- The dashboard uses MQTT WebSocket connections
- Some MQTT brokers may require HTTPS (GitHub Pages provides this)
- Update the broker URL in the dashboard if needed for production use
- The dashboard is a single-page application - all files are in the root directory

## Troubleshooting

- **404 Error**: Make sure GitHub Pages is enabled and pointing to the root directory
- **MQTT Connection Issues**: Check that your MQTT broker supports WebSocket connections
- **CORS Issues**: Some MQTT brokers may block connections from GitHub Pages domain

