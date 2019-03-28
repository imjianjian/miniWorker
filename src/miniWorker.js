
function miniWorker(useFunc) {
    // web worker实例
    let worker;
    // 创建worker代码
    let workerCode = `(${Function.prototype.toString.call(_Worker)})(${Function.prototype.toString.call(useFunc)})`;
    // 构建worker 文件
    let workerBlob = new Blob([workerCode], {
        type: "text/javascript"
    });
    let workerUrl = URL.createObjectURL(workerBlob);

    this.start = function (...args) {
        return new Promise((resolve, reject) => {
            if (!window.Worker) {
                reject("该浏览器不支持web worker");
            }
            worker = new window.Worker(workerUrl);
            worker.postMessage({
                'action': 'start',
                'args': args
            })
            worker.onmessage = function (e) {
                resolve(e.data);
            }
            worker.onerror = function (err) {
                reject(err);
            }
        })
    }

    this.close = function () {
        if (worker) worker.terminate();
    }

    function _Worker(useFunc) {
        onmessage = function (e) {
            let result;
            if (e.data.action && e.data.action == 'start') {
                if (e.data.args) result = useFunc(...e.data.args)
                else result = useFunc()
                postMessage(result)
            }
        }
        onerror = function (err) {
            postMessage(err);
        }
    }
}