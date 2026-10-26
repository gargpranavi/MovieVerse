import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import http2 from 'node:http2'

function tmdbHttp2ProxyPlugin() {
  let h2Client = null

  function getH2Client() {
    if (!h2Client || h2Client.destroyed || h2Client.closed) {
      h2Client = http2.connect('https://api.themoviedb.org:443')
      h2Client.on('error', () => {
        h2Client = null
      })
    }
    return h2Client
  }

  return {
    name: 'tmdb-http2-proxy',
    configureServer(server) {
      server.middlewares.use('/tmdb-proxy', (req, res, next) => {
        try {
          const client = getH2Client()
          const remoteReq = client.request({
            ':path': req.url,
            ':method': req.method,
            'authorization': req.headers['authorization'] || '',
            'accept': req.headers['accept'] || 'application/json',
          })

          remoteReq.on('response', (headers) => {
            const status = Number(headers[':status']) || 200
            res.statusCode = status
            res.setHeader('content-type', headers['content-type'] || 'application/json')
            res.setHeader('access-control-allow-origin', '*')
          })

          remoteReq.on('error', (err) => {
            if (!res.headersSent) {
              res.statusCode = 502
              res.end(JSON.stringify({ error: err.message }))
            }
          })

          req.pipe(remoteReq)
          remoteReq.pipe(res)
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tmdbHttp2ProxyPlugin()],

  // Treat .js files as JSX too
  esbuild: {
    include: /\.(js|jsx|ts|tsx)$/,
    loader: 'jsx',
  },

  optimizeDeps: {
    rolldownOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})

