import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: [
          initialProps.styles,
          sheet.getStyleElement(),
        ],
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Prevent FOUC */}
          <style>{`
            body { visibility: hidden; }
            body.loaded { visibility: visible; }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
          
          {/* Show content once styles are loaded */}
          <script dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.add('loaded');
              });
            `
          }} />
        </body>
      </Html>
    )
  }
} 