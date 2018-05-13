declare const $: any

$(() => {
  window.app = new Vue({
    el: '#app',
    data(): {
      showFileUploader: boolean
      inputFiles: Array<any>
      outputFiles: Array<any>
    } {
      return {
        showFileUploader: false,
        inputFiles: [],
        outputFiles: []
      }
    },
    methods: {
      dragOver (e) {
        e.preventDefault()
        if (!e.dataTransfer.types.some((t) => { return ['Files', 'file'].indexOf(t) >= 0 })) {
          return
        }

        if (this.showFileUploader) { return }
        this.showFileUploader = true
      },

      dragLeave (e) {
        e.preventDefault()
        if (!this.showFileUploader) { return }
        this.showFileUploader = false
      },

      dragEnd (e) {
        e.preventDefault()
        this.inputFiles = e.dataTransfer.files
        this.bulkParse()
        this.showFileUploader = false // カバーを消す
      },

      bulkParse() {
        Array.prototype.map.call(this.inputFiles, (file) => {
          this.parseXML(file)
        })
      },

      parseXML(file) {
        try {
          if (!this.isXML(file)) {
            const errObj = new TypeError("xmlではありません")
            errObj.code = 'notXML'
            throw errObj
          }

          return this.toOutputXML(file)
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

      isXML (file) {
        return file.type === 'text/xml'
      },

      // parseして必要な情報だけを抽出したファイルを返す
      toOutputXML(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target.result;
          const xml = $($.parseXML(result))
          const contracts = xml.find('JPTRM > JPM00010 > JPMR00010')

          contracts.each ((idx: number, contract) => {
            const rows = $(contract).find('JPM00013 JPMR00013')
            rows.each((idx: number, row) => {
              // 最初と最後の日付だけ残す. 他はまるごと削除
              if (idx === 0 || idx === rows.length - 1) {
                $(row).find('JPM00014').remove()
              } else {
                $(row).remove()
              }
            })
          })

          const xmlToText = (new XMLSerializer()).serializeToString(xml[0]);
          const blob = new Blob([xmlToText], { type: 'text/xml' })
          const f = new File([blob], file.name);
          this.outputFiles.push(f)
        }
        reader.readAsText(file);
      },

      downloadBlob(file) {
        return URL.createObjectURL(file)
      }
    }
  })
})
