declare let $: (selector: string) => JQuery;
declare global {
    interface Window {
        ActiveXObject: any;
    }
}

window.ActiveXObject = window.ActiveXObject || {};