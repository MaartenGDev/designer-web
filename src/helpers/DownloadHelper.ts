export class DownloadHelper {
    static downloadAsFile(fileName: string, data: string){
        const blob = new Blob(["\ufeff", data], {type: 'text/xml'});
        if (window.navigator.msSaveOrOpenBlob) {
            return window.navigator.msSaveBlob(blob, fileName);
        }

        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = fileName;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}
