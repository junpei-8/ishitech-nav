// import React from 'react';
// import './Search-pdf-previewer'

interface Props {
  company: ;
  pdfDownloader: ;
}

function SearchPdfPreviewer({ company, pdfDownloader }: Props) {
  return ({
    company
      ? <div className="Search-pdf-previewer">
          <div className="Search-pdf-previewer-overlay" onClick={removeHash}></div>
          <div className="Search-pdf-previewer-header">
            <button className="Search-pdf-previewer-header-button" onClick={removeHash}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
            </button>

            <div className="Search-pdf-previewer-header-button-container">
              <button className="Search-pdf-previewer-header-button" onClick={() => pdfDownloader.current.anchor?.click()}>
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"/></g></svg>
              </button>
              <button className="Search-pdf-previewer-header-button" onClick={openNewPdfPage}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
              </button>
            </div>
          </div>

          <Document
            className="Search-pdf-preview"
            file={`https://storage.googleapis.com/ishitech-nav.appspot.com/${YEAR}/${company.id}.pdf`}
          >
            <Page
              className="Search-pdf-preview-page"
              renderTextLayer={false} renderAnnotationLayer={false} pageNumber={1}
              canvasRef={pdfCanvasRef} onLoadSuccess={onRenderCanvas}
            />
          </Document>

          <div className="Search-pdf-previewer-footer">
            <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(-20)}>
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>
            </button>

              <span className="Search-pdf-previewer-footer-divider"></span>

            <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(0)}>
              <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><g><rect fill="none" height="32" width="32"/><rect fill="none" height="32" width="32"/><rect fill="none" height="32" width="32"/></g><g><g/><path d="M12,5V1L7,6l5,5V7c3.31,0,6,2.69,6,6s-2.69,6-6,6s-6-2.69-6-6H4c0,4.42,3.58,8,8,8s8-3.58,8-8S16.42,5,12,5z"/></g></svg>
            </button>

              <span className="Search-pdf-previewer-footer-divider"></span>

            <button className="Search-pdf-previewer-footer-button" onClick={() => resizeCanvas(20)}>
              <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="32px" viewBox="0 0 24 24" width="32px" fill="#000000"><g><rect fill="none" height="32" width="32"/></g><g><g><path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z"/></g></g></svg>
            </button>
          </div>
        </div>
      : null
  })
}