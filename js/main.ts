import $ from 'jquery'
import Vue from 'vue'

declare global {
  interface Window {
    app: any
    $: any
  }
}

window.$ = $

$(() => {
  window.app = new Vue({
    el: '#app',
    data(): {
      showFileUploader:  boolean
      inputFiles: Array<any> | FileList
      outputFiles: Array<any>
      loading: boolean
      maxRow: number
    } {
      return {
        showFileUploader: false,
        inputFiles: [],
        outputFiles: [],
        loading: false,
        maxRow: 500
      }
    },
    methods: {
      dragOver (e: DragEvent) {
        e.preventDefault()
        if (!e.dataTransfer.types.some((t: string) => { return ['Files', 'file'].indexOf(t) >= 0 })) {
          return
        }

        if (this.showFileUploader) { return }
        this.showFileUploader = true
      },

      dragLeave (e: DragEvent) {
        e.preventDefault()
        if (!this.showFileUploader) { return }
        this.showFileUploader = false
      },

      dragEnd (e: DragEvent) {
        e.preventDefault()
        this.inputFiles = e.dataTransfer.files
        this.loading = true
        this.bulkParse()
        this.showFileUploader = false // カバーを消す
      },

      bulkParse() {
        Promise.all(
          Array.prototype.map.call(this.inputFiles, (file: File) => {
            return new Promise((resolve) => {
              this.parseXML(file, resolve)
            })
          })
        ).then(() => {
          this.loading = false
        })
      },

      async parseXML(file: File, resolve: any) {
        try {
          if (!this.isXML(file)) {
            const errObj: any = new TypeError("xmlではありません")
            errObj.code = 'notXML'
            throw errObj
          }

          return this.toOutputXML(file, resolve)
        } catch (err) {
          console.log(err.stack)
          switch (err.code) {
            case 'notXML':
              this.outputFiles.push({ name: file.name, error: err.message })
            default:
              this.outputFiles.push({ name: file.name, error: err.name })
          }
        }
      },

      isXML (file: File) {
        return file.type === 'text/xml'
      },

      // parseして必要な情報だけを抽出したファイルを返す
      // contracts(JPMR00010)が上限数maxRowを超えたら複数ファイルに分割する
      toOutputXML(file: File, resolve: any) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          const result = e.target.result;
          const xml = $($.parseXML(result))

          // 必要なデータのみ残す
          const contracts = xml.find('JPTRM > JPM00010 > JPMR00010')
          contracts.each ((_idx: number, contract: any) => {
            const rows = $(contract).find('JPM00013 JPMR00013')
            rows.each((idx: number, row: Node) => {
              // 最初と最後の日付だけ残す. 他はまるごと削除
              if (idx === 0 || idx === rows.length - 1) {
                $(row).find('JPM00014').remove()
              } else {
                $(row).remove()
              }
            })
          })

          // maxRow毎に分割する
          const rowNum  = contracts.length
          const filenum = Math.ceil(rowNum/this.maxRow)

          if (filenum === 0) {
            const filename = this.createFilename(file.name, 0)
            const f = this.xmlDomToFile(xml, filename)
            this.outputFiles.push(f)
          } else {
            for (let i = 1; i <= filenum; i++) {
              const startRow = (i - 1) * this.maxRow
              const size     = this.maxRow

              const filename  = this.createFilename(file.name, i)
              const clonedXml = $(xml[0].cloneNode(true))

              // [0...(startRow - 1)] をremove
              if (startRow > 0) {
                clonedXml.find('JPTRM > JPM00010 > JPMR00010').slice(0, startRow)
                  .each((_idx: number, row: Node) => {
                    $(row).remove()
                  })
              }
              // 末尾をremove
              clonedXml.find('JPTRM > JPM00010 > JPMR00010').slice(size)
                .each((_idx: number, row: Node) => {
                  $(row).remove()
                })


              debugger

              const f = this.xmlDomToFile(clonedXml, filename)
              this.outputFiles.push(f)
            }
          }

          resolve()
        }
        reader.readAsText(file);
      },

      xmlDomToFile (xml: JQuery, filename: string): File {
        const xmlToText = (new XMLSerializer()).serializeToString(xml[0]);
        const blob = new Blob([xmlToText], { type: 'text/xml' })
        return new File([blob], filename);
      },

      createFilename (filename: string, idx: number): string {
        let filenameBase = filename.split('.')
        const ext = filenameBase.pop()
        return filenameBase.join('.') + `_${idx}.${ext}`
      },

      downloadBlob(file: File) {
        return URL.createObjectURL(file)
      }
    }
  })
})
