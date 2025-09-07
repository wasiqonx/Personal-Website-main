import Document, { Html, Head, Main, NextScript } from 'next/document'
import crypto from 'crypto'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)

    // Generate CSRF token for this request
    const csrfToken = crypto.randomBytes(32).toString('hex')

    // Store CSRF token in a cookie that can be read by the client
    if (ctx.res) {
      ctx.res.setHeader('Set-Cookie', `csrf-token=${csrfToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`)
    }

    return {
      ...initialProps,
      csrfToken
    }
  }

  render() {
    const { csrfToken } = this.props

    return (
      <Html>
        <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
             <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=K2D:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
            {csrfToken && <meta name="csrf-token" content={csrfToken} />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
