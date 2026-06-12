import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Custom Bilibili Proxy
  app.get('/api/proxy/bilibili', async (req, res) => {
    try {
      const response = await axios.get('https://www.bilibili.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        responseType: 'text'
      });
      
      const $ = cheerio.load(response.data);
      
      // Inject base target to force all links to open in the same frame
      $('head').prepend('<base target="_self">');
      $('head').prepend('<meta name="referrer" content="no-referrer">');
      
      // Rewrite all anchors
      $('a').each((i, el) => {
         const href = $(el).attr('href');
         $(el).attr('target', '_self'); // Force self target
         
         if (href && href.includes('/video/BV')) {
            const match = href.match(/video\/(BV[a-zA-Z0-9]+)/);
            if (match) {
               // Rewrite video links to our proxy player
               $(el).attr('href', `/api/proxy/video/${match[1]}`);
            }
         }
      });
      
      let html = $.html();
      // Fix protocol-relative URLs for images and styles
      html = html.replace(/src="\/\//g, 'src="https://');
      html = html.replace(/srcset="\/\//g, 'srcset="https://');
      html = html.replace(/href="\/\//g, 'href="https://');
      html = html.replace(/url\(\/\//g, 'url(https://');
      
      // Inject keyboard event forwarder
      html = html.replace('</body>', `<script>window.addEventListener('keydown', function(e) { window.parent.postMessage({ type: 'iframeKeyDown', key: e.key, code: e.code }, '*'); });</script></body>`);
      
      // Send modified HTML
      res.send(html);
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).send('Proxy Error');
    }
  });

  // Proxy for Bilibili APIs to fix client-side routing
  app.get('/x/*', async (req, res) => {
    try {
      const url = `https://api.bilibili.com${req.originalUrl}`;
      const response = await axios({
         method: req.method,
         url,
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.bilibili.com'
         },
         responseType: 'stream'
      });
      response.data.pipe(res);
    } catch (e) {
      res.status(500).send('API Error');
    }
  });

  // Proxy for the video pages
  app.get('/api/proxy/video/*', async (req, res) => {
     try {
        let videoId = req.path.replace('/api/proxy/video/', '');
        if (videoId.includes('/')) videoId = videoId.split('/')[0];
        if (videoId.includes('?')) videoId = videoId.split('?')[0];

        // Using direct Bilibili iframe player source usually works with no-referrer
        const targetUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&high_quality=1&as_wide=1&allowfullscreen=true`;
        
        // We can actually just redirect or provide a wrapper
        res.send(`
          <html>
            <body style="margin:0;padding:0;background:black;">
              <iframe 
                src="${targetUrl}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen 
                referrerpolicy="no-referrer"
                sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-scripts allow-forms allow-presentation"
              ></iframe>
              <script>
                window.addEventListener('keydown', function(e) { 
                  window.parent.postMessage({ type: 'iframeKeyDown', key: e.key, code: e.code }, '*'); 
                });
              </script>
            </body>
          </html>
        `);
     } catch(e) {
        res.status(500).send('Error loading video proxy');
     }
  });

  // Generic proxy for other URLs (GET)
  app.get('/api/proxy/general', async (req, res) => {
    proxyGeneral(req, res);
  });

  // Generic proxy for other URLs (POST)
  app.post('/api/proxy/general', express.urlencoded({ extended: true }), async (req, res) => {
    proxyGeneral(req, res, req.body);
  });

  async function proxyGeneral(req: express.Request, res: express.Response, body?: any) {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.send('');
      
      const response = await axios({
         method: body ? 'post' : 'get',
         url: targetUrl,
         data: body,
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         },
         responseType: 'text'
      });
      const $ = cheerio.load(response.data);
      const urlObj = new URL(targetUrl);
      $('head').prepend(`<base href="${urlObj.protocol}//${urlObj.host}">`);
      
      // Inject keyboard event forwarder
      $('body').append(`<script>window.addEventListener('keydown', function(e) { window.parent.postMessage({ type: 'iframeKeyDown', key: e.key, code: e.code }, '*'); });</script>`);
      
      let html = $.html();
      html = html.replace(/src="\/\//g, 'src="https://');
      html = html.replace(/href="\/\//g, 'href="https://');
      res.send(html);
    } catch(e) {
      res.status(500).send('<div style="color:red; font-family:sans-serif; padding: 20px;">Could not load page via proxy. Error: ' + String(e) + '</div>');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
}

startServer();
