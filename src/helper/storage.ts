const prefix = '_SYSTEM_';

export enum Mode {
    Local = "localStorage",
    Session = "sessionStorage",
}

function storage(type: Mode, key: string, data?: any) {
    let _key = prefix + key;
    let _storage = window[type];
    if (data !== undefined) {
        let jsonStr = JSON.stringify(data);
        _storage.setItem(_key, jsonStr);
    } else {
        let dataStr = _storage.getItem(_key);
        if (dataStr) {
            let obj = JSON.parse(dataStr);
            return obj;
        }
        return dataStr;
    }
}

export function local(key: string, data?: any) {
    return storage(Mode.Local, key, data);
}

export function session(key: string, data?: any) {
    return storage(Mode.Session, key, data);
}

export function remove(key: string, type?: Mode) {
    let _key = prefix + key;
    if (type) {
        let _storage = window[type];
        _storage.removeItem(_key);
    } else {
        localStorage.removeItem(_key);
        sessionStorage.removeItem(_key);
    }
}

export function clearStorage() {
    sessionStorage.clear()
    localStorage.clear()
}